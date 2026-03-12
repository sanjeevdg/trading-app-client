import { useState,useEffect } from "react";
import axios from "axios";
import { useWatchlist } from "../context/WatchlistContext";

const API = "https://candlestick-screener.onrender.com/api";
//127.0.0.1:8000
export default function BacktestDashboard() {

  const { watchlist } = useWatchlist();

  const [symbols, setSymbols] = useState(
    "AAPL,TSLA"
  );
  
  const [loadingBars, setLoadingBars] = useState(false);
  const [loadingBacktest, setLoadingBacktest] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");



  useEffect(() => {
    setSymbols(watchlist);
    console.log('setted  symbols',watchlist);
  }, [watchlist]);


   const fetchBars = async () => {
    try {
      setLoadingBars(true);
      setStatus("Fetching bars from server...");
      setResult(null);
      console.log('symbols=====',symbols);
      const res = await axios.get(`${API}/bars`, {
        params: { symbols: symbols.join(","), tf: "5Min" },
      });

      setStatus(
        `File generated: ${res.data.filename || "bars_5Min.csv"}`
      );
    } catch (err) {
      setStatus("Error fetching bars.");
      console.error(err);
    } finally {
      setLoadingBars(false);
    }
  };

  const runBacktest = async () => {
    try {
      setLoadingBacktest(true);
      setStatus("Running backtest...");

      const res = await axios.get(`${API}/backtest`, {
        params: {
          file: "bars_5Min.csv",
          sl: 0.005,
          tp: 0.018,
        },
      });

      setResult(res.data);
      setStatus("Backtest completed.");
    } catch (err) {
      setStatus("Backtest failed.");
      console.error(err);
    } finally {
      setLoadingBacktest(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>📊 Trading Backtest Dashboard</h2>

      <div style={styles.card}>
        <label>Symbols</label>

        <textarea
          rows={3}
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          style={styles.textarea}
        />

        <div style={{ marginTop: 15 }}>
          <button
            style={styles.button}
            onClick={fetchBars}
            disabled={loadingBars}
          >
            {loadingBars ? "Generating..." : "Generate Bars"}
          </button>

          <button
            style={styles.buttonSecondary}
            onClick={runBacktest}
            disabled={loadingBacktest}
          >
            {loadingBacktest ? "Running..." : "Run Backtest"}
          </button>
        </div>

        {status && <p style={styles.status}>{status}</p>}
      </div>

       {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Backtest Result</h3>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "15px",
              borderRadius: "6px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
       
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "900px",
    margin: "auto",
    fontFamily: "Arial",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  button: {
    padding: "10px 20px",
    marginRight: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },

  buttonSecondary: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#16a34a",
    color: "white",
    cursor: "pointer",
  },

  status: {
    marginTop: "10px",
    color: "#444",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  tdKey: {
    padding: "8px",
    borderBottom: "1px solid #eee",
    fontWeight: "bold",
    width: "40%",
  },

  tdValue: {
    padding: "8px",
    borderBottom: "1px solid #eee",
  },
};