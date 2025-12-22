import { useEffect, useState } from "react";
import { io } from "socket.io-client";
//http://localhost:4000
const socket = io("https://trading-app-server-35kc.onrender.com",{
  transports: ["websocket"], // IMPORTANT for Render
  withCredentials: true
});

export default function LivePrices() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    socket.on("price", (data) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    });

    return () => socket.off("price");
  }, []);

  return (
    <div className="container mt-3">
      <h4>Live Market Prices</h4>

      <table className="table table-sm table-striped">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price</th>
            <th>Size</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(prices).map(p => (
            <tr key={p.symbol}>
              <td><b>{p.symbol}</b></td>
              <td style={{ color: "green" }}>
                ${p.price.toFixed(2)}
              </td>
              <td>{p.size}</td>
              <td>{new Date(p.time).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
