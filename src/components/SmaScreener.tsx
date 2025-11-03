import React, { useState } from "react";

const SmaScreener: React.FC = () => {
  const [symbols, setSymbols] = useState("AAPL,TSLA");
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSmaData = async () => {
    if (!symbols.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:4000/api/sma?symbols=${symbols}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const renderRow = (symbol: string, d: any) => {
    if (d.error) {
      return (
        <tr key={symbol}>
          <td style={tdStyle}>{symbol}</td>
          <td colSpan={6} style={{ ...tdStyle, color: "red" }}>
            {d.error}
          </td>
        </tr>
      );
    }

    return (
      <tr key={symbol}>
        <td style={tdStyle}>{symbol}</td>
        <td style={tdStyle}>{d.close ?? "-"}</td>
        <td style={tdStyle}>{d.sma_20 ?? "-"}</td>
        <td style={tdStyle}>{d.sma_50 ?? "-"}</td>
        <td style={tdStyle}>{d.sma_200 ?? "-"}</td>
        <td style={{ ...tdStyle, color: d.signal_20_50 === "bullish_cross" ? "green" : d.signal_20_50 === "bearish_cross" ? "red" : "gray" }}>
          {d.signal_20_50}
        </td>
        <td style={{ ...tdStyle, color: d.signal_50_200 === "bullish_cross" ? "green" : d.signal_50_200 === "bearish_cross" ? "red" : "gray" }}>
          {d.signal_50_200}
        </td>
      </tr>
    );
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "1rem",
  };

  const thStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "8px",
    background: "#f5f5f5",
    textAlign: "center",
  };

  const tdStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>📈 SMA Screener</h2>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
        <input
          type="text"
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          placeholder="Enter symbols, e.g. AAPL,TSLA,MSFT"
          style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
        />
        <button
          onClick={fetchSmaData}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#1d4ed8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Get SMA Data
        </button>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && Object.keys(data).length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Symbol</th>
              <th style={thStyle}>Close</th>
              <th style={thStyle}>SMA 20</th>
              <th style={thStyle}>SMA 50</th>
              <th style={thStyle}>SMA 200</th>
              <th style={thStyle}>20-50 Signal</th>
              <th style={thStyle}>50-200 Signal</th>
            </tr>
          </thead>
          <tbody>{Object.entries(data).map(([symbol, d]) => renderRow(symbol, d))}</tbody>
        </table>
      )}
    </div>
  );
};

export default SmaScreener;
