import React, { useState, useEffect } from "react";

interface StockData {
  symbol: string;
  price: number;
  percentchange: number;
  change: number;
}


const LiveTracker = () => {
  const [symbolInput, setSymbolInput] = useState("");
  const [results, setResults] = useState<StockData[]>([]);

  // connect to server-sent events stream
  useEffect(() => {
    //candlestick-screener.onrender.com
  const es = new EventSource("https://candlestick-screener.onrender.com/api/stream");

  es.onopen = () => console.log("Connected to live stream");
  es.onerror = () => console.warn("Stream disconnected");

  es.onmessage = (event) => {
    console.log("message:", event.data);
    const update = JSON.parse(event.data);
     if (update.heartbeat) return; // ignore heartbeats
    setResults((prev) => {
      const idx = prev.findIndex((r) => r.symbol === update.symbol);
      if (idx !== -1) {
        const newArr = [...prev];
        newArr[idx] = { ...newArr[idx], ...update };
        return newArr;
      }
      return [...prev, update];
    });
  };
  return () => es.close();
}, []);


const test_stream = async () => {

//candlestick-screener.onrender.com
const evtSource = new EventSource("https://candlestick-screener.onrender.com/api/stream");
evtSource.onmessage = e => console.log("message:", e.data);


}


  // handle adding a new symbol
  const handleAdd = async () => {
    if (!symbolInput) return;
    try {
      //candlestick-screener.onrender.com
      await fetch("https://candlestick-screener.onrender.com/api/add_symbol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbolInput }),
      });
      setSymbolInput("");
    } catch (err) {
      console.error("Add symbol error:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📈 Live Stock Tracker</h2>

      <div className="flex space-x-2 mb-4">
        <input
          value={symbolInput}
          onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g. AAPL)"
          className="border rounded px-3 py-2 w-48"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Symbol</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Change</th>
            <th className="border p-2">Change %</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.symbol} className="text-center hover:bg-gray-50">
              <td className="border p-2">{r.symbol}</td>
              <td className="border p-2">{r.price}</td>
              <td
                className={`border p-2 ${
                  r.change > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {r.change?.toFixed?.(2)}
              </td>
              <td
                className={`border p-2 ${
                  r.percentchange > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {r.percentchange?.toFixed?.(2)}%
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LiveTracker;
