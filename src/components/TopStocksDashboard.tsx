import React, { useEffect, useState } from "react";

interface Stock {
  symbol: string;
  company: string;
  price: number;
  change: number;
  "%change": number;
  volume: number;
  vol_ratio: number;
}

const TopStocksDashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        //candlestick-screener.onrender.com
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/top_stocks");
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setStocks(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopStocks();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>⏳ Loading top stocks...</div>;
  }

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>
        ❌ Error fetching data: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>🔥 Top Performing Stocks</h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ backgroundColor: "#1e3a8a", color: "white" }}>
            <tr>
              <th style={thStyle}>Symbol</th>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Price ($)</th>
              <th style={thStyle}>Change ($)</th>
              <th style={thStyle}>% Change</th>
              <th style={thStyle}>Volume</th>
              <th style={thStyle}>Vol Ratio</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.symbol} style={trStyle}>
                <td style={tdStyle}>{stock.symbol}</td>
                <td style={tdStyle}>{stock.company}</td>
                <td style={tdStyle}>{stock.price.toFixed(2)}</td>
                <td
                  style={{
                    ...tdStyle,
                    color: stock.change >= 0 ? "green" : "red",
                  }}
                >
                  {stock.change.toFixed(2)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    color: stock["%change"] >= 0 ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
                  {stock["%change"].toFixed(2)}%
                </td>
                <td style={tdStyle}>{stock.volume.toLocaleString()}</td>
                <td style={tdStyle}>{stock.vol_ratio.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Inline styles
const thStyle: React.CSSProperties = {
  padding: "0.75rem",
  textAlign: "left",
  borderBottom: "2px solid #ddd",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  borderBottom: "1px solid #eee",
};

const trStyle: React.CSSProperties = {
  transition: "background 0.2s ease",
};

export default TopStocksDashboard;
