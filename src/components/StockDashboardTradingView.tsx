import React, { useState } from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
const BASE_URL = "https://trading-app-server-35kc.onrender.com";

interface StockData {
  symbol: string;
  price?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  marketCap?: number;
}

export default function StockDashboardTradingView() {
  const [symbols, setSymbols] = useState("AAPL,MSFT,NVDA,AMZN,META");
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_URL + "/api/cdsstocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: symbols.split(",").map((s) => s.trim()) }),
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statRow = (label: string, value: any, color?: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4px",
      }}
    >
      <span style={{ color: "#666" }}>{label}</span>
      <span style={{ color: color || "#000", fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>📊 Stock Dashboard (TradingView Advanced Chart)</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          placeholder="Enter stock symbols separated by commas"
          style={{
            width: "70%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={fetchStocks}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {data.length === 0 && (
        <p style={{ color: "#555" }}>
          Enter symbols (e.g., <b>AAPL, MSFT, NVDA</b>) and click <b>Analyze</b>.
        </p>
      )}

      {data.map((s) => (
        <div
          key={s.symbol}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "30px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>{s.symbol}</h3>
          {statRow("Price", s.price ? `$${s.price}` : "N/A")}
          {statRow("P/E Ratio", s.peRatio || "N/A")}
          {statRow("EPS", s.eps || "N/A")}
          {statRow("Dividend Yield", `${s.dividendYield}%`, "#00994d")}
          {statRow("Market Cap", s.marketCap ? `${(s.marketCap / 1e9).toFixed(2)} B` : "N/A")}

          <div style={{ marginTop: "20px", height: "550px" }}>
            <AdvancedRealTimeChart
              theme="light"
              symbol={s.symbol}
              autosize
              allow_symbol_change={false}
              hide_side_toolbar={false}
              calendar={true}
              withdateranges={true}
              details={true}
              show_popup_button={false}
              locale="en"
              interval="D"
              style="1"
              range="6M"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
