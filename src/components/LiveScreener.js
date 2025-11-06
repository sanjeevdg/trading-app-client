import React, { useState, useEffect } from 'react';

const LiveScreener = () => {
  const [params, setParams] = useState({
    min_price: 100,
    max_price: 500,
    min_change: 0.1,
    min_eodvolume: 2000,
    max_eodvolume: 100000
  });
  const [results, setResults] = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchScreener = async () => {
    setLoading(true);
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:5000/api/screen_by_criteria?${query}`);
    const data = await res.json();
    setResults(data);
    setSymbols(data.map(item => item.symbol));
    setLoading(false);
  };

/*

LUXPQ, RNWB, IDEXQ, GSCCF, LICYF
SPRB,RHLD,ITIC,ITOCY,CKHGY

*/

  // 🔄 Fetch live quotes periodically
  /*
async function handleSubscribe() {
  try {
    const res = await fetch("http://localhost:5000/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols: symbols }),
    });
    const data = await res.json();
    console.log("Subscribed:", data);
  } catch (err) {
    console.error("Error subscribing:", err);
  }
}
*/


  const [quotes, setQuotes] = useState({});

  useEffect(() => {
    // Listen to live quote stream
    const eventSource = new EventSource("http://localhost:5000/api/stream_quotes");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setQuotes((prev) => ({
        ...prev,
        [data.id]: data,
      }));
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

 // const symbols = Object.keys(quotes);

useEffect(() => {
    fetch("http://localhost:5000/api/quotes?symbols=AAPL,MSFT,NVDA,TSLA")
      .then((res) => res.json())
      .then((data) => setResults(data || []));
  }, []);

useEffect(() => {
    const es = new EventSource("http://localhost:5000/api/stream_quotes");

    es.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setResults((prev) => {
        const idx = prev.findIndex((r) => r.symbol === update.symbol);
        if (idx !== -1) {
          // update existing row
          const newArr = [...prev];
          newArr[idx] = { ...newArr[idx], ...update };
          return newArr;
        } else {
          // append new one
          return [...prev, update];
        }
      });
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      es.close();
    };

    return () => es.close();
  }, []);

 /*
  useEffect(() => {
    if (symbols.length === 0) return;

    const fetchLiveQuotes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quotes?symbols=${symbols.join(',')}`);
        const updates = await res.json();

        setResults(prev =>
          prev.map(item => {
            const update = updates.find(u => u.symbol === item.symbol);
            return update ? { ...item, ...update } : item;
          })
        );
      } catch (err) {
        console.error('Live update failed', err);
      }
    };

    const interval = setInterval(fetchLiveQuotes, 10000); // every 10 seconds
    fetchLiveQuotes(); // initial
    return () => clearInterval(interval);
  }, [symbols]);
*/
  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Stock Screener</h1>
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.keys(params).map((key) => (
          <input
            key={key}
            name={key}
            value={params[key]}
            onChange={handleChange}
            placeholder={key}
            className="border rounded p-2"
          />
        ))}
      </div>
      <button
        onClick={fetchScreener}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Run Screener
      </button>
      


      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : (
        <table className="w-full mt-6 border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Symbol</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">% Change</th>
              <th className="border p-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (

              <tr key={r.symbol} className="text-center hover:bg-gray-50">
                <td className="border p-2">{r.symbol}  </td>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.price}</td>
                <td
                  className={`border p-2 ${
                    r.percentchange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {r.percentchange?.toFixed?.(2)}%
                </td>
                <td className="border p-2">{r.volume?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LiveScreener;
