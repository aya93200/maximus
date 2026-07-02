import { useState, useCallback, useEffect } from 'react';
import {
  sendMessage,
  checkHealth,
  fetchMcpStatus,
  type ChatMessage,
  type ChartData,
  type TableData,
  type McpServerInfo,
} from '@/lib/api';

export interface Message extends ChatMessage {
  id: string;
  isLoading?: boolean;
  error?: boolean;
  chartData?: ChartData;
  tableData?: TableData;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: 'Bonjour ! Je suis connecté à tes bases via MCP. Pose-moi une question sur tes données.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [mcpServers, setMcpServers] = useState<McpServerInfo[]>([]);

  useEffect(() => {
    checkHealth().then(setIsConnected);
    fetchMcpStatus().then(setMcpServers);

    const interval = setInterval(() => {
      checkHealth().then(setIsConnected);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const send = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
    };

    const loadingMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const history = [...messages, userMessage]
        .filter((m) => !m.isLoading && !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await sendMessage(history);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessage.id
            ? {
                id: generateId(),
                role: 'assistant',
                content: response.content,
                chartData: response.chartData,
                tableData: response.tableData,
              }
            : m
        )
      );
    } catch (error) {
      const baseText = error instanceof Error ? error.message : 'Erreur inconnue';
      const errorText = baseText.includes('fetch') || baseText.includes('Network')
        ? `Impossible de contacter le backend. Vérifie que le serveur est lancé sur http://localhost:3001 (${baseText})`
        : baseText;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessage.id
            ? { id: generateId(), role: 'assistant', content: errorText, error: true }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clear = useCallback(() => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: 'Conversation réinitialisée. Comment puis-je t\'aider ?',
      },
    ]);
  }, []);

  return { messages, isLoading, isConnected, mcpServers, send, clear };
}
