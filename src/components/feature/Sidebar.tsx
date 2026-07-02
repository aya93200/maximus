import { useState } from 'react';
import type { McpServerInfo } from '@/lib/api';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isConnected?: boolean | null;
  mcpServers?: McpServerInfo[];
}

const navItems = [
  { icon: 'ri-message-3-line', label: 'Conversation (active)', active: true },
  { icon: 'ri-database-2-line', label: 'Database Connections', active: false },
  { icon: 'ri-file-list-3-line', label: 'PV Reports', active: false },
  { icon: 'ri-truck-line', label: 'Logistics Data', active: false },
  { icon: 'ri-settings-4-line', label: 'Settings', active: false },
];

const tools = [
  'Inspect Schema',
  'Execute Query (Logistics)',
  'Generate Report (PV)',
];

export default function Sidebar({ isOpen, onClose, isConnected, mcpServers = [] }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('Conversation (active)');

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    onClose?.();
  };

  return (
    <aside className="w-[280px] lg:w-[25%] lg:min-w-[260px] lg:max-w-[320px] bg-background-100 border-r border-background-400/50 flex flex-col h-full">
      {/* Logo & Title */}
      <div className="px-5 pt-5 pb-4 border-b border-background-300/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center">
            <i className="ri-flashlight-fill text-accent-400 text-xl" />
          </div>
          <h1 className="text-sm font-semibold text-foreground-100 tracking-tight">
            Supabase MCP Data Assistant
          </h1>
        </div>
        {/* Close button - mobile only */}
        {isOpen && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background-200/60 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <i className="ri-close-line text-foreground-300 text-lg" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.label)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap cursor-pointer
                ${activeItem === item.label
                  ? 'bg-background-300/90 text-foreground-50 border border-background-400/30'
                  : 'text-foreground-400 hover:bg-background-200/60 hover:text-foreground-200'
                }
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${item.icon} text-base`} />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* MCP Section */}
        <div className="mt-6 px-3">
          <p className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider mb-3">
            Model Context Protocol (MCP)
          </p>
          <div className="bg-background-200/70 border border-background-300/50 rounded-xl p-4">
            {/* Global backend status */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-background-400/30">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected === null
                    ? 'bg-foreground-500 animate-pulse'
                    : isConnected
                      ? 'bg-accent-400'
                      : 'bg-red-500'
                }`}
              />
              <p className="text-xs font-medium text-foreground-200">
                Backend {isConnected === null ? '…' : isConnected ? 'en ligne' : 'hors ligne'}
              </p>
            </div>

            {/* MCP server list */}
            <div className="space-y-2">
              {mcpServers.length === 0 && isConnected === null && (
                <p className="text-xs text-foreground-500">Récupération des MCP...</p>
              )}
              {mcpServers.length === 0 && isConnected === false && (
                <p className="text-xs text-red-400">Impossible de lister les MCP.</p>
              )}
              {mcpServers.map((server) => (
                <div key={server.name} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-accent-400' : 'bg-red-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground-100 truncate">
                      {server.name}
                    </p>
                    {server.description && (
                      <p className="text-[10px] text-foreground-500 truncate">
                        {server.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Tools */}
        <div className="mt-5 px-3 pb-4">
          <p className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider mb-3">
            Available Tools
          </p>
          <div className="space-y-2">
            {tools.map((tool) => (
              <div
                key={tool}
                className="flex items-center gap-2 text-sm text-foreground-300"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-tools-line text-foreground-500 text-xs" />
                </div>
                <span>{tool}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}