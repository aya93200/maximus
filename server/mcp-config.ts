import type { McpServerConfig } from './mcp-manager.js';

export const mcpServers: McpServerConfig[] = [
  {
    name: 'stephane',
    command: 'npx',
    args: [
      '-y',
      'mcp-remote',
      process.env.STEPHANE_MCP_URL ||
        process.env.SUPABASE_MCP_URL ||
        'https://mcp.supabase.com/mcp?project_ref=xcttosztgpqbwuwoivim&read_only=true',
    ],
    description: 'Stephane Supabase database access via MCP',
  },
  {
    name: 'cal',
    command: 'npx',
    args: [
      '-y',
      'mcp-remote',
      process.env.CAL_MCP_URL ||
        'https://mcp.supabase.com/mcp?project_ref=jkzkflgtkrmuzmprtaak&read_only=true',
    ],
    description: 'CAL Supabase database access via MCP',
  },
  {
    name: 'terrasses',
    command: 'npx',
    args: [
      '-y',
      'mcp-remote',
      process.env.TERRASSES_MCP_URL ||
        'https://mcp.supabase.com/mcp?project_ref=aaaubviijkfsxmjjtfns&read_only=true',
    ],
    description: 'Terrasses Supabase database: PV et établissements via MCP',
  },
  // Ajoute d'autres MCP ici, exemple :
  // {
  //   name: 'postgres',
  //   command: 'npx',
  //   args: ['-y', 'mcp-remote', 'https://autre-mcp.com/mcp'],
  //   description: 'Autre base de données',
  // },
  // {
  //   name: 'api',
  //   command: 'npx',
  //   args: ['-y', '@some/mcp-server'],
  //   description: 'API externe',
  // },
];
