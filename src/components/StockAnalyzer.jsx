import React, { useState } from "react";
import axios from "axios";
//import { Card, CardContent } from "@/components/ui/card";
//import { Button } from "@/components/ui/button";
//import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

//import MarkdownViewer from "./MarkdownViewer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // for tables, strikethrough, lists
import rehypeSanitize from "rehype-sanitize"; // prevents XSS

import loading from '../assets/loading.gif';

//const BASE_URL = "https://trading-app-server-35kc.onrender.com";
const BASE_URL = "http://localhost:4000";


export default function StockAnalyzer() {
  const [symbols, setSymbols] = useState("AAPL,MSFT,GOOG");
  const [data, setData] = useState([]);
  const [finnhubdata, setFinnHubData ]= useState([]); 

  const [analysis, setAnalysis] = useState("");
const [summary,setSummary] = useState('');
  const [recommended,setRecommended]= useState([]);


const [loading,setLoading] = useState(false);

  const fetchData = async () => {
    const syms = symbols.split(",").map((s) => s.trim());
    const results = await Promise.all(
      syms.map(async (symbol) => {
        const res = await axios.get(BASE_URL + `/api/yfstocks/${symbol}`);
        console.log('dataretuednis========',res.data);
        return res.data;
      })
    );
    setData(results);  

  };


  const fetchData2 = async () => {

setSummary('');
setRecommended([]);

const syms = symbols.split(",").map((s) => s.trim());
 const results2 = await Promise.all(
      syms.map(async (symbol) => {
        const res = await axios.get(BASE_URL + `/api/stocks/${symbol}`);
        console.log('dataretuednis========',res.data);
        return res.data;
      })
    );
    setFinnHubData(results2);
  };




  const analyze = async () => {

console.log('data====',data);
console.log('finnhubdata====',finnhubdata);


    const res = await axios.post(BASE_URL + "/api/analyze", { stocks: finnhubdata});
    let analysis = res.data.analysis;
    setAnalysis(analysis);
    const jsonMatch = res.data.analysis.match(/\[.*\]/s);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

console.log('analysis-full====',res.data.analysis);
  
const summary = res.data.analysis.replace(/^[\s\S]*?```json[\s\S]*?```/, '').trim();

console.log('summary====',summary);
console.log('typeof summary====',typeof summary );



setSummary(summary);
  setRecommended(parsed);
setLoading(false);

  };



/*



        {data.length > 0 && (
          <div className="grid">
            {data.map((stock) => (
              <div className="card" key={stock.symbol}>
                <div style={{width:'100%'}} >
                  <h2 className="text-lg font-bold">{stock.shortName || stock.symbol}</h2>
                  <p>Price: ${stock.regularMarketPrice}</p>
                  <p>Change: {stock.regularMarketChangePercent.toFixed(2)}%</p>
                  <p>Market Cap: ${Math.round(stock.marketCap / 1e9)}B</p>
                </div>
              </div>
            ))}
          </div>
        )}





<p>Ask: ${stock.ask}</p>
                  <p>Bid: ${stock.bid}</p>
                  
remarkPlugins={[remarkGfm]}
*/


  return (
    <div className="container">
      <div className="card">
        <h1>AI Stock Analyzer</h1>
        <p>Enter stock symbols in textfield below separated by comma(,).</p>
        <p>Results are from <b>Finnhub Api</b> and analysis from <b>Cohere</b>.</p>
        <input
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          className="border rounded p-2 w-full mb-4"
          placeholder="Enter comma-separated symbols (e.g., AAPL,MSFT,GOOG)"
        />
        <div className="grid">
          <button onClick={() => {fetchData2(); } }>Fetch Data</button>
          <button onClick={() => {analyze();setLoading(true); } } disabled={!data.length && !finnhubdata.length}>Analyze with AI</button>
        </div>

{finnhubdata.length > 0 && (
          <div className="grid">
            {finnhubdata.map((stock) => (
              <div className="card" key={stock.symbol}>
                <div style={{width:'100%'}} >
                  <h2 className="text-lg font-bold">{stock.name}({stock.shortName || stock.symbol})</h2>
                  <p>Price: ${stock.price}</p>
                  <p>Open: ${stock.open}</p>
                  <p>PrevClose: ${stock.prevClose}</p>                  
                  <p>Change: {stock.changePercent.toFixed(2)}%</p>
                  <p>Market Cap: {stock.marketCap.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}



{recommended && (<>
          <h2 className="font-semibold mb-2">AI Recommendation</h2>
          <div className="grid">
            
            {recommended.map((deal) => (
          <div key={deal.symbol} className="card">
            <div className="symbol-row">
              <span className="symbol">{deal.symbol}</span>
            </div>
            <div className="info"><strong>Rating:</strong> {deal.rating}</div>
            
            <div className="reason"><strong>Reason:</strong> {deal.reason}</div>
          </div>
        ))}

          </div>

<div className="summary">
  
 <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {summary}
      </ReactMarkdown>
</div>


          </>
        )}

{ loading && (
  <div className="summary"> 
<img src={require('../assets/loading.gif')} style={{width:50,height:50}} alt="loading..." /> 
</div>)
 }

        
      </div>

      
    </div>
  );
}

/*
{finnhubdata.length > 0 && (
        <div className="summary">
          <h2 className="text-xl font-semibold mb-2">Market Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={finnhubdata}>
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
*/
