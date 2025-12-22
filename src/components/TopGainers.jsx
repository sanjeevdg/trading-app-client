import React, { useState, useEffect } from "react";
//import ChartModal from "./ChartModal";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import TradeOrderModal from './TradeOrderModal';

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

const [positions, setPositions] = useState([]);

const [showTradeModal, setShowTradeModal] = useState(false);

const [mysymbol, setMySymbol] = useState('');

  // candlestick-screener.onrender.com
  //localhost:5000
//192.168.150.105:5000
const ENDPOINTS = {
  sp500: `http://192.168.150.105:5000/api/top_gainers_sp500?force=${force ? 1 : 0}`,
  nasdaq100: `http://192.168.150.105:5000/api/top_gainers_nasdaq100?force=${force ? 1 : 0}`,
};

//        -H "Content-Type: application/json"         -d '["AAPL","TSLA","ADI","CNC","IR","EMR","GLW","CPAY","FCX","NXPI","ALLE","BBY","MRNA","COO","TSN","JBHT","ARE","ELV","ALB","BKNG","AMD"]'

async function getZacksBulk(symbolsString) {

//const symbols = symbolsString.split(",").map(s => s.replace(/"/g, "").trim());

console.log('symbolsString',typeof symbolsString);


//trading-app-server-35kc.onrender.com
//localhost:4000
 try {
      const res = await fetch("http://192.168.150.105:4000/api/zacks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(symbolsString),
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
      const res = await fetch("http://192.168.150.105:5000/api/symbol_list_sp500");
      if (!res.ok) throw new Error("Failed to fetch data");

      const myres = await res.json();
      console.log('fetched symbols===', myres);
      setSymbols(myres);
      await getZacksBulk(myres);
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
      setData(json.data || []);
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
//trading-app-server-35kc.onrender.com
//  192.168.150.105:4000
const fetchPositions = async () => {
    const res = await axios.get(`http://192.168.150.105:4000/api/positions`);
    setPositions(res.data);
  };

 


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
              <th style={thStyle}>Price</th>
              <th style={thStyle}>1W Price</th>
              <th style={thStyle}>3M Price</th>

              <th style={thStyle}>1W Change (%)</th>
              <th style={thStyle}>ZacksRank</th>
              <th style={thStyle}>3M Change (%)</th>
              <th style={thStyle}>Market</th>
              <th style={thStyle}>Tradable</th>
              <th style={thStyle}>Chart</th>
              <th style={thStyle}>Sell/Buy</th>
            </tr>
          </thead>
          

          <tbody>
            {data.map((item) => (
              <tr key={item.symbol}>
                <td style={tdStyle}>{item.symbol}</td> 
                <td style={tdStyle}>${item.current_price?.toFixed(2)}</td>
                <td style={tdStyle}>${item.base_price_1w?.toFixed(2)}</td>
                <td style={tdStyle}>${item.base_price_3m?.toFixed(2)}</td>

               
                  <td style={{
                    padding: "8px",
                    color: item.change_1w_pct >= 0 ? "green" : "red",
                  }}>{item.change_1w_pct}</td>

                  <td style={{ padding: "8px", color: getZacksRankColor(zacksInfo[item.symbol]?.zacksRank) }}>{zacksInfo[item.symbol]?.zacksRankText} </td>

                  <td style={{
                    padding: "8px",
                    color: item.change_3m_pct >= 0 ? "green" : "red",
                  }}>{item.change_3m_pct}</td>
                
                  <td style={tdStyle}>
  {item.market?.is_open ? "🟢 Open" : "🔴 Closed"}
</td>

<td style={{
  ...tdStyle,
  color: item.asset?.tradable ? "green" : "gray"
}}>
  {item.asset?.tradable ? "Yes" : "No"}
</td>
               <td style={{ padding: "8px" }}>
                  <button onClick={() => {navigate(`/MultiPaneChartWeb/${item.symbol}`)  }}>📈Chart</button>
                </td>    
                <td style={{ padding: "8px" }}>
                     <button onClick={() => {setMySymbol(item.symbol);setShowTradeModal(true); } }>
                      Buy
                    </button>
                   
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         
      )}



<TradeOrderModal
  show={showTradeModal}
  onClose={() => setShowTradeModal(false)}
  symbol={mysymbol}
  side="buy"
  onSubmit={async (orderPayload) => {
    
    console.log('from inside Submit tom component tags')
  //  await placeOrder(orderPayload);
    
  }}
/>

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
