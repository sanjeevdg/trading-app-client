import { useEffect, useState } from "react";
import PatternResults from "./PatternResults";

const AVAILABLE_PATTERNS = [
  "Hammer",
  "Doji",
  "Morning Star",
  "Shooting Star",
  "Bullish Engulfing",
  "Bearish Engulfing",
  "Piercing Line",
  "Dark Cloud Cover",
  "Hanging Man",
  "Inverted Hammer",
  "Evening Star",
];

function CandleScreener2() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // user inputs
  const [symbols, setSymbols] = useState("AAPL,MSFT,GOOG");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("all");
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);




  const togglePattern = (pattern: string) => {
    setSelectedPatterns(prev =>
      prev.includes(pattern)
        ? prev.filter(p => p !== pattern)
        : [...prev, pattern]
    );
  };

  const loadData = async () => {
    if (!symbols.trim()) {
      alert("Please enter at least one stock symbol.");
      return;
    }
    setLoading(true);

    const params = new URLSearchParams();
    params.append("symbols", symbols);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (type) params.append("type", type);
    if (selectedPatterns.length > 0) params.append("patterns", selectedPatterns.join(","));
//trading-app-server-35kc.onrender.com
    const res = await fetch(`http://localhost:4000/api/screener?${params.toString()}`);
    const data = await res.json();
    setResults(data);

console.log('mydatafrom server>>>>>>>>>>',data);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
  <div
  style={{
    padding: "16px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  }}
>
  <h2
    style={{
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "16px",
    }}
  >
    📊 Candlestick Pattern Screener
  </h2>

  {/* Filters */}
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "24px",
      marginBottom: "24px",
      backgroundColor: "#f9fafb",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "4px",
        }}
      >
        Stock Symbols
      </label>
      <input
        type="text"
        placeholder="e.g. AAPL,MSFT,TSLA"
        value={symbols}
        onChange={(e) => setSymbols(e.target.value)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "6px",
          minWidth: "250px",
        }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "4px",
        }}
      >
        From
      </label>
      <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "6px",
        }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "4px",
        }}
      >
        To
      </label>
      <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "6px",
        }}
      />
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "4px",
        }}
      >
        Pattern Type
      </label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "6px",
        }}
      >
        <option value="all">All</option>
        <option value="bullish">Bullish</option>
        <option value="bearish">Bearish</option>
      </select>
    </div>
  </div>

  {/* Pattern Selector */}
  <div
    style={{
      marginBottom: "24px",
      backgroundColor: "#f9fafb",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
    <h3
      style={{
        fontWeight: "600",
        marginBottom: "8px",
      }}
    >
      Select Specific Patterns
    </h3>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "8px",
      }}
    >
      {AVAILABLE_PATTERNS.map((p) => (
        <label
          key={p}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={selectedPatterns.includes(p)}
            onChange={() => togglePattern(p)}
          />
          <span>{p}</span>
        </label>
      ))}
    </div>
  </div>

  <button
    onClick={loadData}
    style={{
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 24px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "15px",
      transition: "background-color 0.2s",
    }}
    onMouseOver={(e) =>
      (e.currentTarget.style.backgroundColor = "#1e40af")
    }
    onMouseOut={(e) =>
      (e.currentTarget.style.backgroundColor = "#2563eb")
    }
  >
    🔍 Run Screener
  </button>

  <div style={{ marginTop: "32px" }}>
    {loading ? <p>Loading...</p> : <PatternResults results={results} />}
  </div>
</div>


  );
}

export default CandleScreener2;
