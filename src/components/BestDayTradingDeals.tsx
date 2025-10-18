import React, { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // for tables, strikethrough, lists
import rehypeSanitize from "rehype-sanitize"; // prevents XSS



interface TradeDeal {
  symbol: string;
  price: number;
  change_pct: string;
  volume: string;
  pattern: string;
  reason: string;
}

//const BASE_URL = "http://localhost:4000";
const BASE_URL =  "https://trading-app-server-35kc.onrender.com";


const BestDayTradingDeals: React.FC = () => {


  const [deals, setDeals] = useState<TradeDeal[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const [symbols, setSymbols] = useState("AAPL,MSFT,GOOG");

  const fetchDeals = async () => {
    setLoading(true);

//const syms = symbols.split(",").map((s) => s.trim());

console.log('sending symbols array...............',symbols);


    try {
      const res = await fetch(BASE_URL + "/api/daytrading-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"symbols":symbols})
      });
      const data = await res.json();
      console.log('DATARETUED',data);
      console.log('DEALSRETUED',data.deals);
      console.log('SUMMARYRETUED',data.summary.substring(data.summary.indexOf('**Summary Paragraph:**')+27,data.summary.length));

      setDeals(data.deals || []);
      setSummary(data.summary.substring(data.summary.indexOf('**Summary Paragraph:**'),data.summary.length) || "No summary available.");
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };


/*

*/


  return (
    <div className="container">
      <div className="header">
        <h1>🔥 Best Day Trading Deals</h1>
        <h5>Fetches stock quotes from Yahoo finance quote api and Cohere AI for analysis.</h5>
        
      </div>

 <div className="summary">
          <h3>📊 Enter stock symbols here</h3>
       
 <input
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          className="border rounded p-2 w-full mb-4"
          placeholder="Enter comma-separated symbols (e.g., AAPL,MSFT,GOOG)"
        />
       &emsp;&emsp;&emsp;
<button onClick={fetchDeals} disabled={loading}>
          {loading ? "Loading..." : "Get Latest Deals"}
        </button>

</div>

      <div className="grid">
{deals.map((deal) => (
          <div key={deal.symbol} className="card">
            <div className="symbol-row">
              <span className="symbol">{deal.symbol}</span>
              <span
                className={`change ${
                  deal.change_pct.startsWith("+") ? "positive" : "negative"
                }`}
              >
                {deal.change_pct}
              </span>
            </div>
            <div className="info">Price: ${deal.price}</div>
            <div className="info">Volume: {deal.volume}</div>
            <div className="pattern">{deal.pattern}</div>
            <div className="reason">{deal.reason}</div>
          </div>
        ))}
      </div>

      {summary && (
        <div className="summary">
          <h3>📊 Summary</h3>
          <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
 {summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default BestDayTradingDeals;

