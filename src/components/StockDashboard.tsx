import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StockDashboard() {
  const [symbols, setSymbols] = useState("QCOM,TXN,CSCO,HPQ,MCHP");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/sdhstocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: symbols.split(",").map((s) => s.trim()) }),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "1200px",
    margin: "0 auto",
  };

const widgetContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "flex-start",
    marginTop: "20px",
  };

  const widgetStyle: React.CSSProperties = {
    flex: "1 1 250px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    background: "#fff",
  };


  const inputRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "20px",
  };

  const thStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#f5f5f5",
    textAlign: "left",
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "8px",
  };

  const chartContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "300px",
    marginBottom: "40px",
  };

// --- statRow helper function must be defined BEFORE return ---
  const statRow = (label: string, value: any, color?: string) => {
    return (
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
  };


  return (
    <div className="container">
      <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
        📈 Stock Yield & Trend Dashboard
      </h2>

      <div style={inputRowStyle}>
        <input
          type="text"
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          placeholder="Enter stock symbols (comma-separated)"
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "300px",
          }}
        />
        <button
          onClick={fetchStocks}
          disabled={loading}
          style={{
            padding: "8px 14px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Fetching..." : "Analyze"}
        </button>
      </div>


  {/* 💳 Finance Widgets Section */}
      {data.length > 0 && (
        <>
          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Finance Widgets</h3>
          <div style={widgetContainerStyle}>
            {data.map((s) => (
              <div key={s.symbol} style={widgetStyle}>
                <h4 style={{ fontSize: "18px", marginBottom: "10px", color: "#007bff" }}>
                  {s.symbol}
                </h4>
                {statRow("Price", `$${s.price}`)}
                {statRow("Dividend Yield", `${s.dividendYield}%`, "#00994d")}
                {statRow("P/E Ratio", s.peRatio || "N/A", "#444")}
                {statRow("EPS", s.eps || "N/A")}
                {statRow("Market Cap", `${(s.marketCap / 1e9).toFixed(2)} B`)}
              </div>
            ))}
          </div>
</> )}

      {data.length > 0 && (
        <>
          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
            Current Dividend Yields & P/E Ratios
          </h3>

          <div style={chartContainerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="dividendYield" fill="#82ca9d" name="Dividend Yield (%)" />
                <Bar dataKey="peRatio" fill="#8884d8" name="P/E Ratio" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Key Metrics</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Symbol</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Dividend Yield (%)</th>
                <th style={thStyle}>P/E</th>
                <th style={thStyle}>EPS</th>
                <th style={thStyle}>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.symbol}>
                  <td style={tdStyle}>{s.symbol}</td>
                  <td style={tdStyle}>${s.price}</td>
                  <td style={tdStyle}>{s.dividendYield}%</td>
                  <td style={tdStyle}>{s.peRatio || "N/A"}</td>
                  <td style={tdStyle}>{s.eps || "N/A"}</td>
                  <td style={tdStyle}>
                    {(s.marketCap / 1e9).toFixed(2)} B
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: "18px", marginTop: "40px", marginBottom: "8px" }}>
            Historical Dividend Yield Trends (5 Years)
          </h3>

          {data.map((stock) => (
            <div key={stock.symbol} style={{ marginBottom: "40px" }}>
              <h4 style={{ fontSize: "16px", marginBottom: "6px" }}>
                {stock.symbol}
              </h4>
              <div style={{ width: "100%", height: "250px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.dividendYields}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => new Date(d).getFullYear().toString()}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="yield"
                      stroke="#82ca9d"
                      name="Dividend Yield (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
