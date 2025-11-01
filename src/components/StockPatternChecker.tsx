import React, { useState } from "react";

interface PatternData {
  symbol: string;
  latest_close?: number;
  percent_change?: number;
  consolidating?: boolean;
  breaking_out?: boolean;
  error?: string;
}

const StockPatternChecker: React.FC = () => {
  const [symbols, setSymbols] = useState("");
  const [results, setResults] = useState<PatternData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPatterns() {
    if (!symbols.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/patterns?symbols=${symbols}`
      );
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ textAlign: "center" }}>📈 Stock Pattern Detector</h2>

      <div style={{ marginBottom: "12px", textAlign: "center" }}>
        <input
          type="text"
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          placeholder="Enter symbols (e.g. AAPL,MSFT,NVDA)"
          style={{
            padding: "8px",
            width: "60%",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        <button
          onClick={fetchPatterns}
          disabled={loading}
          style={{
            marginLeft: "10px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {loading ? "Loading..." : "Check Patterns"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>⚠️ {error}</p>
      )}

      {results.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "16px",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f4f4f4" }}>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                Symbol
              </th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                Close
              </th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                % Change
              </th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                Consolidating
              </th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                Breaking Out
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  borderBottom: "1px solid #eee",
                }}
              >
                <td style={{ padding: "8px" }}>{r.symbol}</td>
                <td style={{ padding: "8px" }}>
                  {r.latest_close ? `$${r.latest_close.toFixed(2)}` : "—"}
                </td>
                <td
                  style={{
                    padding: "8px",
                    color:
                      r.percent_change && r.percent_change > 0
                        ? "green"
                        : "red",
                  }}
                >
                  {r.percent_change !== undefined
                    ? `${r.percent_change.toFixed(2)}%`
                    : "—"}
                </td>
                <td style={{ padding: "8px" }}>
                  {r.consolidating ? "✅ Yes" : "❌ No"}
                </td>
                <td style={{ padding: "8px" }}>
                  {r.breaking_out ? "🚀 Yes" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockPatternChecker;
