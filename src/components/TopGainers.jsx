import React, { useState, useEffect } from "react";
import ChartModal from "./ChartModal";

//https://candlestick-screener.onrender.com
//http://localhost:5000

const TopGainers = () => {



  const [index, setIndex] = useState("sp500");
   const [force, setForce] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartSymbol, setChartSymbol] = useState("");

  
const ENDPOINTS = {
  sp500: `https://candlestick-screener.onrender.com/api/top_gainers_sp500?force=${force ? 1 : 0}`,
  nasdaq100: `https://candlestick-screener.onrender.com/api/top_gainers_nasdaq100?force=${force ? 1 : 0}`,
};




  const fetchData = async (selectedIndex) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(ENDPOINTS[selectedIndex]);
      if (!res.ok) throw new Error("Failed to fetch data");

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(index);
  }, [index]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Top Gainers</h2>

      {/* Dropdown selector */}
      <select
        value={index}
        onChange={(e) => setIndex(e.target.value)}
        style={{ padding: "8px",marginRight:"20px", marginBottom: "15px" }}
      >
        <option value="sp500">S&P 500</option>
        <option value="nasdaq100">Nasdaq 100</option>
      </select>


       <label style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          checked={force}
          onChange={(e) => setForce(e.target.checked)}
        />{" "}
        Force (skip cache)
      </label>
      <button onClick={() => fetchData(index)} > Submit</button>

      {/* Loading state */}
      {loading && <p>Loading data...</p>}

      {/* Error state */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Table */}
      {!loading && !error && data.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Symbol</th>
              <th style={thStyle}>3M Change (%)</th>
              <th style={thStyle}>6M Change (%)</th>
              <th style={thStyle}>Chart</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.symbol}>
                <td style={tdStyle}>{item.symbol}</td>
                <td style={{
                    padding: "8px",
                    color: item.change_3m_pct >= 0 ? "green" : "red",
                  }}>{item.change_3m_pct}</td>
                <td style={{
                    padding: "8px",
                    color: item.change_6m_pct >= 0 ? "green" : "red",
                  }}>{item.change_6m_pct}</td>
               <td style={{ padding: "8px" }}>
                  <button onClick={() => setChartSymbol(item.symbol)}>📈 Chart</button>
                </td>    
              </tr>
            ))}
          </tbody>
        </table>
         
      )}


{chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
        
      )}  


      {/* No data */}
      {!loading && !error && data.length === 0 && <p>No data available</p>}
    </div>
  );
};

// Simple table styling
const thStyle = {
  borderBottom: "2px solid #ddd",
  padding: "8px",
  textAlign: "left",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "8px",
};

export default TopGainers;
