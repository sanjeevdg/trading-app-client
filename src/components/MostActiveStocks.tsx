import React, { useEffect, useState } from "react";

import ChartModal from "./ChartModal";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
};

const MostActiveStocks: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
const [chartSymbol, setChartSymbol] = useState<string | null>(null);

const [type, setType] = useState('most_actives');

const [hdrLabel, setHdrLabel] = useState('100 Most Active');

//trading-app-server-35kc.onrender.com
  useEffect(() => {

let url = '';


if (type==='most_actives') {
url = "https://trading-app-server-35kc.onrender.com/api/most_actives";
setHdrLabel('100 Most Active');
}
if (type==='day_gainers') {
url = "https://trading-app-server-35kc.onrender.com/api/trending";
setHdrLabel('50 Top Day Gainers');
}
if (type==='day_losers') {
url = "https://trading-app-server-35kc.onrender.com/api/day_losers";
setHdrLabel('50 Top Day Losers');
}
if (type==='small_cap_gainers') {
url = "https://trading-app-server-35kc.onrender.com/api/small_cap_gainers";
setHdrLabel('50 Top Small Cap Gainers');
}
if (type==='growth_technology_stocks') {
url = "https://trading-app-server-35kc.onrender.com/api/growth_technology_stocks";
setHdrLabel('25 Top Growth Technology Stocks');
}
if (type==='undervalued_large_caps') {
url = "https://trading-app-server-35kc.onrender.com/api/undervalued_large_caps";
setHdrLabel('50 Top undervalued large caps');
}

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{hdrLabel} </h2>
<div style={{ marginBottom: "10px",display:'flex',alignItems:'center',justifyContent:'flex-start',flexDirection:"row" }}>
<h5>Select Criteria</h5>
 
        <select style={{height:30,marginLeft:20}} value={type} onChange={e => setType(e.target.value)}>
          <option value="most_actives">Most Active</option>
          <option value="day_gainers">Top Gainers</option>
          <option value="day_losers">Top Losers</option>
          <option value="small_cap_gainers">Small Cap Gainers</option>
          <option value="growth_technology_stocks">Growth Technology Stocks </option>
          <option value="undervalued_large_caps">Undervalued Large Caps </option>
        </select>
      </div>


      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Symbol</th>
            <th style={{ padding: "8px" }}>Name</th>
            <th style={{ padding: "8px" }}>Price ($)</th>
            <th style={{ padding: "8px" }}>Change (%)</th>
            <th style={{ padding: "8px" }}>Volume</th>
            <th style={{ padding: "8px" }}>Chart</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.symbol} style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "8px", fontWeight: 600 }}>{s.symbol}</td>
              <td style={{ padding: "8px" }}>{s.name}</td>
              <td style={{ padding: "8px" }}>{s.price?.toFixed(2)}</td>
              <td
                style={{
                  padding: "8px",
                  color: s.changePercent >= 0 ? "green" : "red",
                }}
              >
                {s.changePercent}%
              </td>
              <td style={{ padding: "8px" }}>
                {s.volume?.toLocaleString("en-US")}
              </td>
              <td style={{padding: "8px"}}  >
      <button onClick={() => setChartSymbol(s.symbol)}>📈 Chart</button>
   </td>   

            </tr>
          ))}
        </tbody>
      </table>
      {chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
      )}

    </div>
  );
};

export default MostActiveStocks;
