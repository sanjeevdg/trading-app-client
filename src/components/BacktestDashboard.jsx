import { useState,useEffect } from "react";
import axios from "axios";
import { useWatchlist } from "../context/WatchlistContext";

const API = "https://candlestick-screener.onrender.com/api";
//127.0.0.1:8000
export default function BacktestDashboard() {

  const { watchlist,clearWatchlist,addMultiple } = useWatchlist();

  const [symbols, setSymbols] = useState(
    "AAPL,TSLA"
  );
  
  const [loadingBars, setLoadingBars] = useState(false);
  const [loadingBacktest, setLoadingBacktest] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
//<button style={styles.button } onClick={runBot}>Start Bot</button>
console.log('typeof watchlist', typeof watchlist);
console.log('watchlist', watchlist);

  useEffect(() => {
    setSymbols(watchlist);
    console.log('setted  symbols',watchlist);
  }, [watchlist]);

  async function runBot() {
  const payload = {
    symbols: watchlist,    
  };
//http://127.0.0.1:8000/api
  const res = await fetch("https://candlestick-screener.onrender.com/api/run-bot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log(data);
  }

   const fetchBars = async () => {
    try {
      setLoadingBars(true);
      setStatus("Fetching bars from server...");
      setResult(null);
      let symbolParam;

    if (Array.isArray(symbols)) {
      symbolParam = symbols.join(",");
    } else if (typeof symbols === "string") {
      symbolParam = symbols
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
        .join(",");
    } else {
      throw new Error("Invalid symbols format");
    }

    console.log("symbols=====", symbolParam);

      const res = await axios.get(`${API}/bars`, {
        params: { symbols: symbolParam, tf: "5Min" },
      });

      setStatus(
        `File generated: ${res.data.filename || "bars_5Min.csv"}`
      );
    } catch (err) {
      const msg =
      err.response?.data?.error ||   // Flask {"error": "..."}
      err.message ||                 // axios error message
      "Unknown error";

    setStatus("Error fetching bars: " + msg);
    console.error("API error:", err.response?.data || err);
    } finally {
      setLoadingBars(false);
    }
  };

  function rankStocks(results) {
  return results
    .map((r) => {
      const win = r.win_rate_pct / 100;
      const avgWin = r.average_win_pct;
      const avgLoss = r.average_loss_pct;

      const expectancy = win * avgWin + (1 - win) * avgLoss;

      const reliability = Math.min(r.trades / 20, 1);

      const riskPenalty = Math.abs(r.max_drawdown_pct) / 10;

      const score = expectancy * r.profit_factor * reliability - riskPenalty;

      return {
        ...r,
        expectancy,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

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
      const ranked = rankStocks(res.data.results);

      const top3 = ranked.slice(0, 5);

      const symbols = top3.map(r => r.symbol);
      clearWatchlist();
        setTimeout(() => addMultiple(symbols), 50);

      console.log('mMYTOPTHREE===',top3);
      //setRows(top3);
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
    marginRight:10
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