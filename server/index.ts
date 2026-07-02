import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { McpManager, type ManagedTool } from './mcp-manager.js';
import { mcpServers } from './mcp-config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
    credentials: true,
  })
);
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value === 'sk-...') {
    throw new Error(`Missing or placeholder environment variable: ${key}`);
  }
  return value;
}

function mapToolsToFunctions(tools: ManagedTool[]) {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || `Call the ${tool.name} tool`,
      parameters: sanitizeSchema(tool.inputSchema),
    },
  }));
}

interface ChartData {
  chart_type: string;
  title: string;
  data: Array<{ label: string; value: number }>;
}

interface TableData {
  headers: string[];
  rows: Array<Record<string, string | number>>;
}

function extractJsonBlock<T>(content: string, validator: (parsed: unknown) => T | null): T | null {
  const match = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    return validator(parsed);
  } catch {
    return null;
  }
}

function extractChartData(content: string): ChartData | null {
  return extractJsonBlock(content, (parsed) => {
    const obj = parsed as Record<string, unknown>;
    if (
      obj.chart_type === 'bar' &&
      typeof obj.title === 'string' &&
      Array.isArray(obj.data) &&
      obj.data.every((item: unknown) => {
        const row = item as Record<string, unknown>;
        return typeof row.label === 'string' && typeof row.value === 'number';
      })
    ) {
      return obj as unknown as ChartData;
    }
    return null;
  });
}

function extractTableData(content: string): TableData | null {
  return extractJsonBlock(content, (parsed) => {
    const obj = parsed as Record<string, unknown>;
    if (
      Array.isArray(obj.headers) &&
      obj.headers.every((h: unknown) => typeof h === 'string') &&
      Array.isArray(obj.rows) &&
      obj.rows.every((row: unknown) => {
        return typeof row === 'object' && row !== null && !Array.isArray(row);
      })
    ) {
      return obj as unknown as TableData;
    }
    return null;
  });
}

function sanitizeSchema(schema?: Record<string, unknown>): Record<string, unknown> {
  if (!schema || typeof schema !== 'object') {
    return { type: 'object', properties: {} };
  }

  const clone = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;

  function clean(node: unknown): unknown {
    if (!node || typeof node !== 'object') return node;
    const obj = node as Record<string, unknown>;
    delete obj.additionalProperties;
    delete obj.$schema;

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val)) {
        obj[key] = val.map(clean);
      } else if (typeof val === 'object') {
        obj[key] = clean(val);
      }
    }
    return obj;
  }

  return clean(clone) as Record<string, unknown>;
}

app.post('/api/chat', async (req, res) => {
  let manager: McpManager | null = null;

  try {
    const { messages } = req.body as { messages?: Array<{ role: string; content: string }> };
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    requireEnv('OPENAI_API_KEY');
    manager = new McpManager();
    await manager.connect(mcpServers);

    const tools = await manager.listAllTools();
    const openaiTools = mapToolsToFunctions(tools);

    const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: `You are an autonomous data agent connected to multiple MCP sources (stephane, cal, terrasses). Your job is to answer the user's questions about their data without requiring them to specify exact tables or schemas.

Source summary:
- stephane: base de données principale
- cal: base de données CAL
- terrasses: base de données des PV et établissements

Follow this process when a question is vague or does not explicitly name a table/schema:
1. If the user mentions a source (stephane, cal, terrasses), prefer that MCP. Otherwise, inspect the schemas of the connected MCPs to find the most relevant tables.
2. List the tables in the likely schemas (e.g. public) to identify candidates.
3. Choose the best table(s) based on the user's intent. If several tables could match and you are unsure, briefly explain the ambiguity and ask the user to clarify.
4. Query the chosen table(s) to compute the answer.

Always verify that a table or column exists before querying it. Be concise and explain results in French unless asked otherwise.

COUNTING AND FILTERING RULES — follow these strictly to avoid errors like counting 0 when data exists:
- When the user asks "combien", "nombre de", or "count", run an aggregate query using COUNT with a WHERE clause that matches the exact filter values.
- Before filtering on a text/status column (e.g. etat_actuel), first run \`SELECT DISTINCT <column> FROM <table> LIMIT 100\` to see the exact values stored in the database. Do not guess or assume casing, accents, or wording.
- If the filter value is not exactly what you expected (e.g. "En service" vs "en service" vs "actif"), use the exact value found in the table in your COUNT query. Use LOWER() or ILIKE only when you are certain the value may vary.
- Booleans and enums must be compared against their real database values, not human-friendly approximations.
- After a COUNT query, respond with the number directly and mention the exact filter used (e.g. "8 véhicules sont en service (colonne etat_actuel = 'En service')").

When returning structured lists of rows (top N, search results, filtered records), include a table JSON block at the very end of your response:

\`\`\`json
{
  "table_data": {
    "headers": ["Colonne 1", "Colonne 2", "Colonne 3"],
    "rows": [
      {"Colonne 1": "valeur A", "Colonne 2": 123, "Colonne 3": "oui"},
      {"Colonne 1": "valeur B", "Colonne 2": 456, "Colonne 3": "non"}
    ]
  }
}
\`\`\`

When returning rankings, counts, or totals, include a chart JSON block instead:

\`\`\`json
{
  "chart_type": "bar",
  "title": "Title for the chart",
  "data": [
    {"label": "Item 1", "value": 123},
    {"label": "Item 2", "value": 456}
  ]
}
\`\`\`

Only include one JSON block per response, choosing table or chart based on what is most useful. Never include both.`,
    };

    let currentMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      systemMessage,
      ...messages.map((m): OpenAI.Chat.ChatCompletionUserMessageParam => ({ role: 'user', content: m.content })),
    ];

    const maxIterations = 8;
    for (let i = 0; i < maxIterations; i++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: currentMessages,
        tools: openaiTools,
        tool_choice: 'auto',
      });

      const assistantMessage = completion.choices[0].message;

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        const content = assistantMessage.content || '';
        const chartData = extractChartData(content);
        const tableData = extractTableData(content);
        const cleanContent = chartData || tableData ? content.replace(/```json\s*[\s\S]*?\s*```/, '').trim() : content;

        return res.json({
          role: 'assistant',
          content: cleanContent,
          chartData,
          tableData,
          toolsUsed: [],
        });
      }

      currentMessages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs: Record<string, unknown>;
        try {
          toolArgs = JSON.parse(toolCall.function.arguments);
        } catch {
          toolArgs = {};
        }

        const toolResult = await manager.callTool(toolName, toolArgs);
        const resultText = JSON.stringify(toolResult);

        const toolResponseMessage: OpenAI.Chat.ChatCompletionToolMessageParam = {
          tool_call_id: toolCall.id,
          role: 'tool',
          content: resultText,
        };
        currentMessages.push(toolResponseMessage);
      }
    }

    return res.status(500).json({ error: 'Too many tool call iterations' });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  } finally {
    await manager?.close().catch(() => {});
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/mcp-status', (_req, res) => {
  res.json({
    servers: mcpServers.map((s) => ({ name: s.name, description: s.description })),
  });
});

app.listen(PORT, () => {
  console.log(`MCP proxy server running on http://localhost:${PORT}`);
});
