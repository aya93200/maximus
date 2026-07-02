export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChartData {
  chart_type: string;
  title: string;
  data: Array<{ label: string; value: number }>;
}

export interface TableData {
  headers: string[];
  rows: Array<Record<string, string | number>>;
}

export interface ChatResponse {
  role: 'assistant';
  content: string;
  chartData?: ChartData;
  tableData?: TableData;
  toolsUsed?: string[];
  error?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = (await response.json()) as ChatResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get response');
  }

  return data;
}

export interface McpServerInfo {
  name: string;
  description?: string;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchMcpStatus(): Promise<McpServerInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/api/mcp-status`, { method: 'GET' });
    if (!response.ok) return [];
    const data = (await response.json()) as { servers?: McpServerInfo[] };
    return data.servers || [];
  } catch {
    return [];
  }
}
