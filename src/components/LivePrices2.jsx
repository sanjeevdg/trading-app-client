import { useEffect, useState } from "react";

export default function LivePrices2() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws/prices");

    ws.onmessage = (event) => {
      const tick = JSON.parse(event.data);

      setPrices(prev => ({
        ...prev,
        [tick.symbol]: tick
      }));
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Live Prices</h2>

      {Object.values(prices).map(t => (
        <div key={t.symbol}>
          <strong>{t.symbol}</strong> — {Number(t.price).toFixed(2)}
        </div>
      ))}
    </div>
  );
}
