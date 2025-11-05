import React, { useState } from "react";
import axios from "axios";
import ChartModal from "./ChartModal";


const ScreenByCriteria = () => {
  const [params, setParams] = useState({
    min_price: 100,
    max_price: 500,
    min_change: 0.001,
    min_eodvolume: 1000,
    max_eodvolume: 100000
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [chartSymbol, setChartSymbol] = useState("");
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(params);
      const res = await axios.get(`https://candlestick-screener.onrender.com/api/screen_by_criteria?${query.toString()}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch screener data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Stock Screener</h1>

      {/* Filter Form */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {[
          { name: "min_price", label: "Min Price" },
          { name: "max_price", label: "Max Price" },
          { name: "min_change", label: "Min % Change" },
          { name: "min_eodvolume", label: "Min Volume" },
          { name: "max_eodvolume", label: "Max Volume" },
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
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "Run Screener"}
      </button>

      {/* Error */}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* Results Table */}
      <div className="mt-6 overflow-x-auto">
        {results.length > 0 ? (
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Symbol</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-right">% Change</th>
                <th className="px-3 py-2 text-right">Volume</th>
                <th className="px-3 py-2 text-right">Chart</th>
              </tr>
            </thead>
            <tbody>
              {results.map((stock, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold">{stock.symbol}</td>
                  <td className="px-3 py-2">{stock.name}</td>
                  <td className="px-3 py-2 text-right">{stock.price?.toFixed?.(2) ?? "-"}</td>
                  <td
                    className={`px-3 py-2 text-right ${
                      stock.percentchange > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stock.percentchange?.toFixed?.(2)}%
                  </td>
                  <td className="px-3 py-2 text-right">
                    {stock.volume?.toLocaleString?.() ?? "-"}
                  </td>
                   <td className="px-3 py-2 text-right">
      <button onClick={() => setChartSymbol(stock.symbol)}>📈 Chart</button>
   </td>   
                </tr>
              ))}
            </tbody>
          </table>
 
        ) : (
          !loading && <p className="mt-4 text-gray-600">No results to display.</p>
        )}

{chartSymbol && (
        <ChartModal symbol={chartSymbol} onClose={() => setChartSymbol(null)} />
      )}

      </div>
    </div>
  );
};

export default ScreenByCriteria;
