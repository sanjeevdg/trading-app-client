import React, { useEffect, useState } from "react";
//import ChartModal from "./ChartModal";


const TvScreener = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
//const [chartSymbol, setChartSymbol] = useState<string | null>(null);

const [params, setParams] = useState({
    min_price: 100,
    max_price: 500,
    min_eodvolume: 1000,
    min_rsi: 10,
    max_rsi: 90    
  });

  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
const [chartSymbol, setChartSymbol] = useState("");
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };



  async function fetchResults() {
    const query = new URLSearchParams(params);  
    
    fetch(`http://10.36.127.120:5000/api/tvscreener?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  
  }
  

 // if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "15px" }}>🔥 TradingView Screener</h2>
      

 {/* Filter Form */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {[
          { name: "min_price", label: "Min Price" },
          { name: "max_price", label: "Max Price" },
          { name: "min_eodvolume", label: "Min Volume" },
          { name: "min_rsi", label: "Min RSI" },
          { name: "max_rsi", label: "Max RSI" },          
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {field.label}
            </label>
            <input
              type="number"
              name={field.name}
              value={params[field.name]}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
              placeholder="e.g. 5"
            />
          </div>
        ))}
      </div>

      <button
        onClick={fetchResults}
     //   disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Run Screener"}
      </button>

      {/* Error */}
      {error && <p className="text-red-500 mt-3">{error}</p>}


      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          textAlign: "left",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ background: "#f2f2f2" }}>
            <th style={{ padding: "8px" }}>Symbol</th>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Open</th>
            <th style={{ padding: "8px" }}>Close</th>
            <th style={{ padding: "8px" }}>Change</th>
            <th style={{ padding: "8px" }}>P/L</th>
            <th style={{ padding: "8px" }}>Volume</th>
            <th style={{ padding: "8px" }}>RSI</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.symbol}>
              <td style={{ padding: "8px", fontWeight: "bold" }}>{s.ticker}</td>
              <td style={{ padding: "8px" }}>{s.name}</td>
              <td style={{ padding: "8px" }}>{s.open}</td>
              <td style={{ padding: "8px" }}>{s.close}</td>
              <td style={{ padding: "8px" }}>{s.change.toFixed(3)} </td>
              
              <td
                style={{
                  padding: "8px",
                  color: s.change_percent >= 0 ? "green" : "red",
                }}
              >
                {s.change_percent.toFixed(3)}%
              </td>

              <td style={{ padding: "8px" }}>
                {s.volume}
              </td>

<td style={{padding: "8px"}}>
                {s.RSI?.toFixed(3)}
   </td>   
            </tr>
          ))}
        </tbody>
      </table>
        

    </div>
  );
};

export default TvScreener;
