import React, { useEffect, useState } from "react";
import ChartModal from "./ChartModal";


interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percent_change: number;
  volume: number;
}

interface StockExtras {
  symbol: string;
  relative_volume: number | null;
  market_gap: number | null;
  gap_type: string | null;
  market_status: string | null;
  price: number | null;
  prev_close: number | null;
  timestamp: string | null;
}

const MyScreener: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [type, setType] = useState("most_actives");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [chartSymbol, setChartSymbol] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  
//<{ [symbol: string]: any }>
 const [extras, setExtras] = useState<StockExtras | null>(null);



async function fetchExtras(symbol: string) {
  const res = await fetch(`https://candlestick-screener.onrender.com/api/stock_extras?symbol=${symbol}`);
 const data: StockExtras = await res.json();
    console.log("returning extras data ===", data);
    setExtras(data);
}

const handleClick = async (s: any) => {
    setLoading(true);
    await fetchExtras(s);
    setLoading(false);
    console.log('myexras==',extras);
    setShowModal(true);
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://candlestick-screener.onrender.com/api/screener?type=${type}`);
        const json = await res.json();
        setStocks(json.data);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>📊 {type.replace("_", " ").toUpperCase()}</h2>
      <div style={{ marginBottom: "10px" }}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="most_actives">Most Active</option>
          <option value="day_gainers">Top Gainers</option>
          <option value="day_losers">Top Losers</option>
        </select>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <thead>
          <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Symbol</th>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Price</th>
            <th style={{ padding: "8px" }}>Change</th>
            <th style={{ padding: "8px" }}>% Change</th>
            <th style={{ padding: "8px" }}>Volume</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, i) => (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid #ddd",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
              }}
            >
              <td style={{ padding: "8px" }}>{s.symbol}</td>
              <td style={{ padding: "8px" }}>{s.name}</td>
              <td style={{ padding: "8px" }}>{s.price}</td>
              <td style={{ padding: "8px", color: s.change > 0 ? "green" : "red" }}>{s.change}</td>
              <td style={{ padding: "8px", color: s.percent_change > 0 ? "green" : "red" }}>{s.percent_change}%</td>
              <td style={{ padding: "8px" }}>{s.volume}</td>
             <td>
        <button
          onClick={() => handleClick(s.symbol) }
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {loading ? "Loading..." : "📊 Details"}
        </button>
      </td>
  


<td style={{height:250,width:350}}  >
      <button onClick={() => setChartSymbol(s.symbol)}>📈 View</button>
   </td>   
            </tr>
          ))}
        </tbody>
      </table>

{chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
      )}
     



      {showModal && extras && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "10px",
              minWidth: "340px",
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                textAlign: "center",
                color: "#1e3a8a",
                fontSize: "20px",
                marginBottom: "16px",
              }}
            >
              {extras.symbol} — Details
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <tbody>
                <tr>
                  <td style={{ textAlign: "left", padding: "6px 0" }}>
                    Relative Volume:
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {extras.relative_volume?.toFixed(2) ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "6px 0" }}>
                    Market Gap:
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {extras.market_gap !== null
                      ? `${extras.market_gap.toFixed(2)}%`
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "6px 0" }}>
                    Gap Type:
                  </td>
                  <td style={{ textAlign: "right" }}>{extras.gap_type ?? "—"}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "6px 0" }}>
                    Market Status:
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {extras.market_status ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "6px 0" }}>
                    Price:
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {extras.price?.toFixed(2) ?? "—"}
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left", padding: "6px 0" }}>
                    Prev Close:
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {extras.prev_close?.toFixed(2) ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>

            <p
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#555",
                textAlign: "center",
              }}
            >
              Updated at: {extras.timestamp}
            </p>

            <div style={{ textAlign: "center", marginTop: "18px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "#e11d48",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default MyScreener;
