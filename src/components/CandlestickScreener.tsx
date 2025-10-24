import React, { useState } from "react";
import axios from "axios";
import { Pattern, ScreenerResult } from "../types";
import ChartModal from "./ChartModal";

const availablePatterns: Pattern[] = [
  { key: "bullishEngulfing", name: "Bullish Engulfing" },
  { key: "hammer", name: "Hammer" },
  { key: "doji", name: "Doji" },
  { key: "morningStar", name: "Morning Star" },
  { key: "shootingStar", name: "Shooting Star" },
];

interface Props {
  backendUrl: string;
}

const CandlestickScreener: React.FC<Props> = ({ backendUrl }) => {
  const [symbols, setSymbols] = useState("AAPL,MSFT,GOOG");
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartSymbol, setChartSymbol] = useState<string | null>(null);

  const togglePattern = (key: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const runScreener = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl, {
        symbols: symbols.split(",").map((s) => s.trim()),
        patterns: selectedPatterns,
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Candlestick Screener</h2>
      <div>
        <label>Symbols (comma-separated): </label>
        <input
          type="text"
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          style={{ width: "300px", margin: "0 10px" }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        {availablePatterns.map((p) => (
          <label key={p.key} style={{ marginRight: 10 }}>
            <input
              type="checkbox"
              value={p.key}
              checked={selectedPatterns.includes(p.key)}
              onChange={() => togglePattern(p.key)}
            />
            {p.name}
          </label>
        ))}
      </div>

      <button onClick={runScreener} disabled={loading} style={{ marginTop: 10 }}>
        {loading ? "Scanning..." : "Run Screener"}
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Results ({results.length})</h3>
        <table border={1} cellPadding={6} style={{ width: "100%", cursor: "pointer" }}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Pattern</th>
              <th>Date</th>
              <th>View Chart</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.symbol}</td>
                <td>{r.pattern}</td>
                <td>{r.date}</td>
                <td>
                  <button onClick={() => setChartSymbol(r.symbol)}>📈 View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
      )}
    </div>
  );
};

export default CandlestickScreener;
