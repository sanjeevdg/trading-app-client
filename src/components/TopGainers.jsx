import React, { useState, useEffect } from "react";
//import ChartModal from "./ChartModal";
import { useNavigate } from "react-router-dom";
//https://candlestick-screener.onrender.com
//http://localhost:5000

const TopGainers: React.FC = () => {
// = ({route,navigation}) => {




const navigate = useNavigate();

  const [index, setIndex] = useState("sp500");
   const [force, setForce] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartSymbol, setChartSymbol] = useState("");

const [symbols,setSymbols] = useState("");

const [zacksInfo , setZacksInfo] = useState([]);


  // candlestick-screener.onrender.com
  //localhost:5000
//192.168.150.105:5000
const ENDPOINTS = {
  sp500: `https://candlestick-screener.onrender.com/api/top_gainers_sp500?force=${force ? 1 : 0}`,
  nasdaq100: `https://candlestick-screener.onrender.com/api/top_gainers_nasdaq100?force=${force ? 1 : 0}`,
};

//        -H "Content-Type: application/json"         -d '["AAPL","TSLA","ADI","CNC","IR","EMR","GLW","CPAY","FCX","NXPI","ALLE","BBY","MRNA","COO","TSN","JBHT","ARE","ELV","ALB","BKNG","AMD"]'

async function getZacksBulk(symbolsString) {

const symbols = symbolsString.split(",").map(s => s.replace(/"/g, "").trim());

//trading-app-server-35kc.onrender.com
//localhost:4000
 try {
      const res = await fetch("https://trading-app-server-35kc.onrender.com/api/zacks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(symbols),
      });
      const data = await res.json();
      console.log('zacksinfo',data);
      setZacksInfo(data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }

}    
async function fetchSymbols() {


 try {
     // setLoading(true);
      setError("");
//candlestick-screener.onrender.com
      //192.168.150.105:5000
      const res = await fetch("https://candlestick-screener.onrender.com/api/symbol_list_sp500");
      if (!res.ok) throw new Error("Failed to fetch data");

      const json = await res.json();
      console.log('fetched symbols===', json.symbols);
      setSymbols(json.symbols);
      await getZacksBulk(json.symbols);
    } catch (err) {
      setError(err.error || "Something went wrong");
    } finally {
    //  setLoading(false);
    }




  } 

  const fetchData = async (selectedIndex) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(ENDPOINTS[selectedIndex]);
      if (!res.ok) throw new Error("Failed to fetch data");

      const json = await res.json();
      setData(json);
      await fetchSymbols();
      console.log('mydata====',json);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(index);
  }, [index]);


const getZacksRankColor = (rank) => {
  switch (rank) {
    case "1": return "#009900"; // Strong Buy → bright green
    case "2": return "#33CC33"; // Buy → green
    case "3": return "#FF9900"; // Hold → orange
    case "4": return "#FF5555"; // Sell → light red
    case "5": return "#CC0000"; // Strong Sell → dark red
    default:  return "gray";    // Unknown → gray
  }
};

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
      {loading && <p>Loading data...this may take a while ...please be patient</p>}

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
              <th style={thStyle}>1W Change (%)</th>
              <th style={thStyle}>ZacksRank</th>
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
                    color: item.change_1w_pct >= 0 ? "green" : "red",
                  }}>{item.change_1w_pct}</td>

                  <td style={{ padding: "8px", color: getZacksRankColor(zacksInfo[item.symbol]?.zacksRank) }}>{zacksInfo[item.symbol]?.zacksRankText} </td>

                  <td style={{
                    padding: "8px",
                    color: item.change_3m_pct >= 0 ? "green" : "red",
                  }}>{item.change_3m_pct}</td>
                <td style={{
                    padding: "8px",
                    color: item.change_6m_pct >= 0 ? "green" : "red",
                  }}>{item.change_6m_pct}</td>
               <td style={{ padding: "8px" }}>
                  <button onClick={() => {navigate(`/PatternCandleChart/${item.symbol}`)  }}>📈 Chart</button>
                  <button onClick={() => {navigate(`/MultiPaneChartWeb/${item.symbol}`)  }}>📈 Chart2</button>
                </td>    
              </tr>
            ))}
          </tbody>
        </table>
         
      )}


{/* chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
        
      ) */ }  


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
