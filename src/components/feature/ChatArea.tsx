import FadeIn from '@/components/base/FadeIn';
import BarChart from './BarChart';
import DataTable from './DataTable';
import type { Message } from '@/hooks/useChat';

interface ChatAreaProps {
  messages: Message[];
}

export default function ChatArea({ messages }: ChatAreaProps) {
  return (
    <main className="flex-1 flex flex-col h-full bg-background-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-5">
        {messages.map((message, index) => (
          <FadeIn
            key={message.id}
            direction={message.role === 'user' ? 'right' : 'left'}
            delay={index === messages.length - 1 ? 100 : 0}
            duration={400}
          >
            {message.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] md:max-w-[70%] bg-primary-700/30 border border-primary-600/30 rounded-2xl rounded-tr-sm px-4 py-3 md:px-5 md:py-3.5 shadow-sm">
                  <p className="text-sm text-foreground-100 leading-relaxed">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2.5 md:gap-3">
                <div className="shrink-0 w-7 h-7 md:w-8 md:h-8 bg-background-300/90 border border-background-400/50 rounded-full flex items-center justify-center mt-1 shadow-sm">
                  <i className="ri-sparkling-line text-foreground-200 text-xs md:text-sm" />
                </div>
                <div
                  className={`flex-1 max-w-[90%] md:max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 md:px-5 md:py-4 shadow-sm border ${
                    message.error
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : 'bg-background-200/80 border-background-300/60'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2 text-foreground-400 text-sm">
                      <div className="w-4 h-4 border-2 border-foreground-400/30 border-t-foreground-400 rounded-full animate-spin" />
                      <span>L&apos;agent interroge la base via MCP...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-foreground-100 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.tableData && (
                        <div className="mt-3 md:mt-4 bg-background-300/30 border border-background-400/40 rounded-xl overflow-hidden">
                          <DataTable data={message.tableData} />
                        </div>
                      )}
                      {message.chartData && (
                        <div className="mt-3 md:mt-4 bg-background-300/30 border border-background-400/40 rounded-xl p-3 md:p-4">
                          <BarChart title={message.chartData.title} data={message.chartData.data} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </FadeIn>
        ))}
      </div>
    </main>
  );
}