import React, { useEffect, useState } from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface StockData {
  symbol: string;
  company: string;
  status: string;
  chart: string;
}

const BreakoutsDashboard: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBreakouts = async () => {
      try {
        //candlestick-screener.onrender.com
        const response = await fetch("http://localhost:5000/api/breakouts");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setStocks(data);
        console.log(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakouts();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading breakout data...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;
  if (stocks.length === 0) return <div style={{ padding: 20 }}>No breakout data found.</div>;

  return (
    
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        🚀 Breakout & Consolidation Dashboard
      </h2>

      {stocks.map((stock) => (
        <div
          key={stock.symbol}
          style={{
            marginBottom: "2rem",
            border: "1px solid #ddd",
            borderRadius: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
            padding: "1rem",
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <h3 style={{ margin: 0, color: "#1d4ed8" }}>
              {stock.symbol} – {stock.company}
            </h3>
            <p
              style={{
                margin: "0.3rem 0",
                color: stock.status === "breaking_out" ? "green" : "orange",
                fontWeight: "bold",
              }}
            >
              {stock.status === "breaking_out" ? "🚀 Breaking Out" : "📉 Consolidating"}
            </p>
          </div>

          {/* TradingView Chart */}
          <div style={{ height: "500px" }}>
            <AdvancedRealTimeChart
              symbol={stock.symbol}
              theme="light"
              autosize
              interval="D"
              style="1"
            />
          </div>
        </div>
      ))}
    </div>



  );
};

export default BreakoutsDashboard;
