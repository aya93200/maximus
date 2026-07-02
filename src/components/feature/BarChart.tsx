export interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  title?: string;
  data: BarChartData[];
}

export default function BarChart({ title, data }: BarChartProps) {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full space-y-3 pt-1">
      {title && (
        <h4 className="text-xs font-medium text-foreground-200 mb-2">{title}</h4>
      )}
      {data.map((item, index) => {
        const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={index} className="flex items-center gap-2 md:gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
            <span className="text-[11px] md:text-xs text-foreground-300 w-24 md:w-32 shrink-0 text-right whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
            <div className="flex-1 h-5 md:h-6 bg-background-400/30 rounded-md overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-md animate-bar-grow"
                style={{ width: `${widthPercent}%`, animationFillMode: 'both' }}
              />
            </div>
            <span className="text-[11px] md:text-xs font-semibold text-foreground-200 w-8 md:w-10 shrink-0 text-right">
              {item.value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}