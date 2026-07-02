import { useState } from 'react';
import Sidebar from '@/components/feature/Sidebar';
import ChatArea from '@/components/feature/ChatArea';
import ChatInput from '@/components/feature/ChatInput';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, isLoading, isConnected, mcpServers, send } = useChat();

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background-50">
      {/* Desktop Sidebar - always visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar isOpen onClose={() => setSidebarOpen(false)} isConnected={isConnected} mcpServers={mcpServers} />
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden animate-slide-in-left">
            <Sidebar isOpen onClose={() => setSidebarOpen(false)} isConnected={isConnected} mcpServers={mcpServers} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-background-100 border-b border-background-300/40 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-background-200/60 transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <i className="ri-menu-line text-foreground-200 text-lg" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-flashlight-fill text-accent-400 text-base" />
            </div>
            <h1 className="text-sm font-semibold text-foreground-100 tracking-tight truncate">
              Supabase MCP Data Assistant
            </h1>
          </div>
        </header>

        <ChatArea messages={messages} />
        <ChatInput onSend={send} disabled={isLoading} />
      </div>
    </div>
  );
}