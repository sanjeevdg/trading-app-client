// StrategyChart.jsx
import { useState } from "react";

export default function MatplotlibChart() {
  const [symbol, setSymbol] = useState("AAPL");
  const [fast, setFast] = useState(20);
  const [slow, setSlow] = useState(50);

  const url =
    `https://candlestick-screener.onrender.com/api/strategy-chart` +
    `?symbol=${symbol}&fast=${fast}&slow=${slow}&t=${Date.now()}`;

  return (
    <div style={{ width: 900 }}>
      <h3>Alpaca TA-Lib Strategy (Server Rendered)</h3>

      <div style={{ display: "flex", gap: 10 }}>
        <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} />
        <input type="number" value={fast} onChange={e => setFast(+e.target.value)} />
        <input type="number" value={slow} onChange={e => setSlow(+e.target.value)} />
      </div>

      <img
        src={url}
        alt="Strategy Chart"
        style={{ width: "100%", marginTop: 12, border: "1px solid #ccc" }}
      />
    </div>
  );
}
