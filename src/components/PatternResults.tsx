import { useState } from "react";
import CandlestickChart from "./CandlestickChart";

export default function PatternResults({ results }: { results: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div>
      <table className="table-auto border-collapse w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Symbol</th>
            <th className="p-2 border">Patterns</th>
            <th className="p-2 border">Chart</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.symbol}>
              <td className="p-2 border">{r.symbol}</td>
              <td className="p-2 border">{r.patterns.join(", ")}</td>
              <td className="p-2 border text-blue-600 cursor-pointer" onClick={() => setSelected(r)}>
                View
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">{selected.symbol}</h3>
          <CandlestickChart candles={selected.candles} />
        </div>
      )}
    </div>
  );
}
