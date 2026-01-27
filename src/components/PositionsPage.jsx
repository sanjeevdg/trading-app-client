import { useEffect, useState } from "react";

export default function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [botRunning, setBotRunning] = useState(false);

  const fetchPositions = async () => {
  try {
    const res = await fetch("http://10.154.222.120:8000/api/positions");

    if (!res.ok) {
      const text = await res.text();
      console.error("positions API error:", res.status, text);
      return;
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("positions returned non-JSON:", text);
      return;
    }

    const data = await res.json();
    setPositions(data);
  } catch (err) {
    console.error("fetchPositions failed:", err);
  }
};


const fetchStatus = async () => {
  try {
    const res = await fetch("http://10.154.222.120:8000/bot/status");

    if (!res.ok) {
      const text = await res.text();
      console.error("status API error:", res.status, text);
      return;
    }

    const data = await res.json();
    setBotRunning(Boolean(data.running));
  } catch (err) {
    console.error("fetchStatus failed:", err);
  }
};


  useEffect(() => {
    fetchPositions();
    fetchStatus();
    const i = setInterval(fetchPositions, 3000);
    return () => clearInterval(i);
  }, []);

  const startBot = () => fetch("http://10.154.222.120:8000/bot/start", { method: "POST" });
  const stopBot = () => fetch("http://10.154.222.120:8000/bot/stop", { method: "POST" });

  return (
    <div style={{ padding: 20 }}>
      <h2>Momentum Scalping Bot</h2>

      <div style={{ marginBottom: 10 }}>
        <button onClick={startBot}>Start Bot</button>
        <button onClick={stopBot} style={{ marginLeft: 10 }}>
          Stop Bot
        </button>
        <span style={{ marginLeft: 20 }}>
          Status: {botRunning ? "🟢 Running" : "🔴 Stopped"}
        </span>
      </div>

      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Entry</th>
            <th>Current</th>
            <th>PnL ($)</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => (
            <tr key={p.symbol}>
              <td>{p.symbol}</td>
              <td>{p.qty}</td>
              <td>{p.avg_entry.toFixed(2)}</td>
              <td>{p.current.toFixed(2)}</td>
              <td
                style={{
                  color: p.unrealized_pl >= 0 ? "green" : "red",
                }}
              >
                {p.unrealized_pl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
