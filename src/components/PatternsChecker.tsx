import React, { useState } from "react";

const PatternsChecker = () => {
 const [symbolsInput, setSymbolsInput] = useState("");
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkPatterns() {
    if (!symbolsInput.trim()) {
      alert("Enter at least one symbol!");
      return;
    }

    const symbols = symbolsInput.replace(/\s+/g, "");
    setLoading(true);
    setError(null);
    setPatterns([]);

    try {
      const res = await fetch(`https://candlestick-screener.onrender.com/api/patterns?symbols=${symbols}`);
      const data = await res.json();

console.log('my-data====',data);


      if (data.error) {
        setError(data.error);
      } else {
        console.log('setting patterns===',data);
        setPatterns(data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pattern data.");
    } finally {
      setLoading(false);
    }
  }


  async function loadMostActives() {
    try {
      setLoading(true);
      const res = await fetch("https://candlestick-screener.onrender.com/api/most_active_symbols");
      const data = await res.json();

      if (data.symbols) {
        setSymbolsInput(data.symbols.join(", "));
      } else {
        alert("Could not fetch most active symbols.");
      }
    } catch (err) {
      console.error("Error fetching most actives:", err);
      alert("Failed to fetch symbols.");
    } finally {
      setLoading(false);
    }
  }
async function load100MostActives() {
    try {
      setLoading(true);
      //candlestick-screener.onrender.com
      const res = await fetch("https://candlestick-screener.onrender.com/api/most_active_symbols_100");
      const data = await res.json();

console.log('ret-data====',data);

      if (data.symbols) {
        setSymbolsInput(data.symbols.join(", "));
      } else {
        alert("Could not fetch most active symbols.");
      }
    } catch (err) {
      console.error("Error fetching most actives:", err);
      alert("Failed to fetch symbols.");
    } finally {
      setLoading(false);
    }
  }
async function loadDayGainers() {
    try {
      setLoading(true);
      const res = await fetch("https://candlestick-screener.onrender.com/api/day_gainers");
      const data = await res.json();

      if (data.symbols) {
        setSymbolsInput(data.symbols.join(", "));
      } else {
        alert("Could not fetch most active symbols.");
      }
    } catch (err) {
      console.error("Error fetching day gainers:", err);
      alert("Failed to fetch symbols.");
    } finally {
      setLoading(false);
    }
  }

async function loadDayLosers() {
    try {
      setLoading(true);
      const res = await fetch("https://candlestick-screener.onrender.com/api/day_losers");
      const data = await res.json();

      if (data.symbols) {
        setSymbolsInput(data.symbols.join(", "));
      } else {
        alert("Could not fetch day losers symbols.");
      }
    } catch (err) {
      console.error("Error fetching most actives:", err);
      alert("Failed to fetch symbols.");
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
      <h2 style={{ color: "#1e3a8a", marginBottom: "10px" }}>📊 Pattern Checker</h2>

<p>Either enter a comma-separated set of symbols, or fetch symbols from one of [most active/day gainers/day losers] and, <em>then</em> press the Check Patterns button. </p>

      <div style={{ marginBottom: "12px" }}>
        <textarea
          value={symbolsInput}
          onChange={(e) => setSymbolsInput(e.target.value)}
          placeholder="Enter comma-separated symbols, e.g. AAPL, MSFT, TSLA"
          rows={8}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={load100MostActives}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔥 Load 100 Most Actives
        </button>

 <button
          onClick={load100MostActives}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔥 Load Most Actives
        </button>



        <button
          onClick={loadDayGainers}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔥 Load Day Gainers
        </button>
         <button
          onClick={loadDayLosers}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🔥 Load Day Losers
        </button>

        <button
          onClick={checkPatterns}
          style={{
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Checking..." : "✅ Check Patterns"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {patterns.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: "6px" }}>Symbol</th>
              <th style={{ padding: "6px" }}>Close Price</th>
              <th style={{ padding: "6px" }}>Change (%)</th>
               <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                Consolidating
              </th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                Breaking Out
              </th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((p, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <td style={{ padding: "6px" }}>{p.symbol}</td>
                <td style={{ padding: "6px" }}>{p.latest_close?.toFixed(2)}</td>
                <td
                  style={{
                    padding: "6px",
                    color: p.percent_change > 0 ? "green" : "red",
                  }}
                >
                  {p.percent_change?.toFixed(2)}%
                </td>
                 <td style={{ padding: "8px" }}>
                  {p.consolidating ? "✅ Yes" : "❌ No"}
                </td>
                <td style={{ padding: "8px" }}>
                  {p.breaking_out ? "🚀 Yes" : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatternsChecker;
