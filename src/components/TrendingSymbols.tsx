import React, { useEffect, useState } from "react";
import ChartModal from "./ChartModal";


const TrendingSymbols = () => {
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(true);
const [chartSymbol, setChartSymbol] = useState<string | null>(null);


  useEffect(() => {
    fetch("https://trading-app-server-35kc.onrender.com/api/small_cap_gainers")
      .then((res) => res.json())
      .then((data) => {
        setSymbols(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "15px" }}>🔥 Day Gainers</h2>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "left",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={{ padding: "8px" }}>Symbol</th>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Price</th>
            <th style={{ padding: "8px" }}>% Change</th>
            <th style={{ padding: "8px" }}>Volume</th>
            <th style={{ padding: "8px" }}>View Chart</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s:any) => (
            <tr key={s.symbol}>
              <td style={{ padding: "8px", fontWeight: "bold" }}>{s.symbol}</td>
              <td style={{ padding: "8px" }}>{s.name}</td>
              <td style={{ padding: "8px" }}>{s.price?.toFixed(2)}</td>
              <td
                style={{
                  padding: "8px",
                  color: s.changePercent >= 0 ? "green" : "red",
                }}
              >
                {s.changePercent}%
              </td>
              <td style={{ padding: "8px" }}>
                {s.volume?.toLocaleString() || "-"}
              </td>

<td style={{padding: "8px"}}  >
      <button onClick={() => setChartSymbol(s.symbol)}>📈 View</button>
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

export default TrendingSymbols;
