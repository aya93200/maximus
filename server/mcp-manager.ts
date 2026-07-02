import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface McpServerConfig {
  name: string;
  command: string;
  args: string[];
  description?: string;
}

export interface ManagedTool {
  name: string;
  originalName: string;
  clientName: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export class McpManager {
  private clients = new Map<string, Client>();
  private transports: StdioClientTransport[] = [];

  async connect(configs: McpServerConfig[]): Promise<void> {
    for (const config of configs) {
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
      });
      this.transports.push(transport);

      const client = new Client({
        name: `${config.name}-agent`,
        version: '1.0.0',
      });

      await client.connect(transport);
      this.clients.set(config.name, client);
      console.log(`MCP connected: ${config.name}`);
    }
  }

  async listAllTools(): Promise<ManagedTool[]> {
    const allTools: ManagedTool[] = [];

    for (const [clientName, client] of this.clients.entries()) {
      const result = await client.listTools();
      const tools = (result.tools as Array<{
        name: string;
        description?: string;
        inputSchema?: Record<string, unknown>;
      }>) || [];

      for (const tool of tools) {
        allTools.push({
          name: `${clientName}_${tool.name}`,
          originalName: tool.name,
          clientName,
          description: tool.description,
          inputSchema: tool.inputSchema,
        });
      }
    }

    return allTools;
  }

  async callTool(prefixedName: string, args: Record<string, unknown>): Promise<unknown> {
    const separatorIndex = prefixedName.indexOf('_');
    if (separatorIndex === -1) {
      throw new Error(`Invalid tool name: ${prefixedName}`);
    }

    const clientName = prefixedName.slice(0, separatorIndex);
    const originalName = prefixedName.slice(separatorIndex + 1);

    const client = this.clients.get(clientName);
    if (!client) {
      throw new Error(`Unknown MCP client: ${clientName}`);
    }

    return client.callTool({ name: originalName, arguments: args });
  }

  async close(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.close().catch(() => {});
    }
    this.clients.clear();
    this.transports = [];
  }
}
