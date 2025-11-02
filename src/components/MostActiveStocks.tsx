import React, { useEffect, useState } from "react";

import ChartModal from "./ChartModal";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
};

const MostActiveStocks: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
const [chartSymbol, setChartSymbol] = useState<string | null>(null);


  useEffect(() => {
    fetch("https://trading-app-server-35kc.onrender.com/api/most_actives")
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>100 Most Active Stocks</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Symbol</th>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Price ($)</th>
            <th style={{ padding: "8px" }}>Change (%)</th>
            <th style={{ padding: "8px" }}>Volume</th>
            <th style={{ padding: "8px" }}>Chart</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.symbol} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px", fontWeight: 600 }}>{s.symbol}</td>
              <td style={{ padding: "8px" }}>{s.name}</td>
              <td style={{ padding: "8px" }}>{s.price?.toFixed(2)}</td>
              <td
                style={{
                  padding: "8px",
                  color: s.change >= 0 ? "green" : "red",
                }}
              >
                {s.change?.toFixed(2)}%
              </td>
              <td style={{ padding: "8px" }}>
                {s.volume?.toLocaleString("en-US")}
              </td>
              <td style={{padding: "8px"}}  >
      <button onClick={() => setChartSymbol(s.symbol)}>📈 Chart</button>
   </td>   

            </tr>
          ))}
        </tbody>
      </table>
      {chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
      )}

    </div>
  );
};

export default MostActiveStocks;
