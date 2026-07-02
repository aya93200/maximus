import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend?.(message);
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full px-3 py-3 md:px-5 md:py-4 border-t border-background-400/50 bg-background-100"
    >
      <div className="flex items-center gap-2 md:gap-3 bg-background-200/90 border border-background-400/60 rounded-xl px-3 py-2.5 md:px-4 md:py-3 shadow-sm">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          placeholder="Pose une question sur tes données..."
          className="flex-1 bg-transparent text-sm text-foreground-50 placeholder-foreground-500 outline-none min-w-0 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="shrink-0 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 disabled:cursor-not-allowed text-background-50 text-sm font-medium px-4 py-2 md:px-5 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
        >
          <span className="hidden md:inline">Envoyer</span>
          <i className="ri-send-plane-fill md:hidden text-base" />
        </button>
      </div>
    </form>
  );
}