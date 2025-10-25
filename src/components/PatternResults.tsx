import { useState } from "react";
import CandlestickChart from "./CandlestickChart";

import ChartModal from "./ChartModal";

export default function PatternResults({ results }: { results: any[] }) {
  const [selected, setSelected] = useState<any | null>(null);
const [chartSymbol, setChartSymbol] = useState<string>('');



  return (
   <div style={{ width: "100%", margin: "0 auto", padding: "20px" }}>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      border: "1px solid #ccc",
    }}
  >
    <thead>
      <tr style={{ backgroundColor: "#f9f9f9" }}>
        <th
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Symbol
        </th>
        <th
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Patterns
        </th>
        <th
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          Chart
        </th>
      </tr>
    </thead>
    <tbody>
      {results.map((r) => (
        <tr key={r.symbol}>
          <td style={{ padding: "8px", border: "1px solid #ccc" }}>
            {r.symbol}
          </td>

          <td style={{ padding: "8px", border: "1px solid #ccc", fontSize: "14px" }}>
            {r.patterns.map((p: any, i:any) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <span style={{ fontWeight: "500" }}>{p.name}</span>
                <span style={{ marginLeft: "4px", color: "#666" }}>
                  ({p.type})
                </span>
                <span style={{ marginLeft: "6px", color: "#999", fontSize: "12px" }}>
                  on {new Date(p.date).toISOString().split("T")[0]}
                </span>
              </div>
            ))}
          </td>

          <td
  style={{
    padding: "8px",
    border: "1px solid #ccc",
    color: "#2563eb",
    cursor: "pointer",
    textDecoration: "underline",
  }}
  onClick={() => setChartSymbol(r.symbol)}
  onMouseOver={(e) => {
    const target = e.currentTarget as HTMLElement;
    target.style.color = "#1d4ed8";
  }}
  onMouseOut={(e) => {
    const target = e.currentTarget as HTMLElement;
    target.style.color = "#2563eb";
  }}
>
  View
</td>

        </tr>
      ))}
    </tbody>
  </table>

  {chartSymbol && (
    <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol("")} />
  )}
</div>

  );
}


/*
  {selected && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">{selected.symbol}</h3>
          <CandlestickChart candles={selected.candles} />
        </div>
      )}
    

*/