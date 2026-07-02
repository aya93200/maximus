export interface TableData {
  headers: string[];
  rows: Array<Record<string, string | number>>;
}

interface DataTableProps {
  data: TableData;
}

export default function DataTable({ data }: DataTableProps) {
  if (!data.headers?.length || !data.rows?.length) {
    return <p className="text-sm text-foreground-400">Aucune donnée à afficher.</p>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-background-400/40 border-b border-background-500/50">
            {data.headers.map((header) => (
              <th
                key={header}
                className="text-left py-3 px-4 font-semibold text-foreground-50 text-xs uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => (
            <tr
              key={index}
              className={`border-b border-background-400/30 last:border-0 hover:bg-background-400/20 transition-colors ${
                index % 2 === 1 ? 'bg-background-300/10' : ''
              }`}
            >
              {data.headers.map((header) => (
                <td key={`${index}-${header}`} className="py-3 px-4 text-foreground-200">
                  {row[header] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}