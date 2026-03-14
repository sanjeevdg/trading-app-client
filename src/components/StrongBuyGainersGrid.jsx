import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useWatchlist } from "../context/WatchlistContext";
import { getSymbol ,stripExchanges} from "../utils/tickerUtils";

const API = "https://candlestick-screener.onrender.com";
//https://candlestick-screener.onrender.com
//http://127.0.0.1:8000
export default function StrongBuyGrid() {

  const { clearWatchlist, addMultiple } = useWatchlist();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { field: "ticker", headerName: "Ticker", width: 140 },
    { field: "name", headerName: "Name", width: 160 },
    { field: "close", headerName: "Price", width: 110 },
    { field: "change", headerName: "% Change", width: 120 },
    { field: "volume", headerName: "Volume", width: 140 },
    { field: "AnalystRating", headerName: "Rating", width: 140 }
  ];

  useEffect(() => {
    async function fetchData() {
      try {

        const [scanRes, tvRes] = await Promise.all([
          axios.get(`${API}/api/scan_top_gainers?strategy=momentum&min_price=25&max_price=200&min_volume=100000&top_gainers=0`),
          axios.get(`${API}/api/tv/top-gainers?page=1&limit=50`)
        ]);

        const scan = scanRes.data.data || [];
        const tv = tvRes.data.data || [];

        // --- STRONG BUY from scan endpoint ---
        const strongScan = scan
          .filter(s => (s.AnalystRatinga || "").toLowerCase() === "strongbuy")
          .map((s, i) => ({
            id: `scan-${i}`,
            ticker: s.symbol,
            name: s.symbol,
            close: s.close,
            change: s.change,
            volume: s.volume,
            AnalystRating: "Strong Buy"
          }));

        // --- STRONG BUY from TradingView endpoint ---
        const strongTV = tv
          .filter(t => (t.AnalystRating || "").toLowerCase() === "strongbuy")
          .map((t, i) => ({
            id: `tv-${i}`,
            ticker: t.ticker,
            name: t.name,
            close: t.close,
            change: t.change,
            volume: t.volume,
            AnalystRating: t.AnalystRating
          }));
        const merged = [...strongScan, ...strongTV];

        // extract tickers
        const symbols = [...new Set(merged.map(r => r.ticker))];

        // clear and repopulate watchlist
        clearWatchlist();
        setTimeout(() => addMultiple(stripExchanges(symbols)), 50);

        setRows(merged);  
        //setRows([...strongScan, ...strongTV]);

      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <Box sx={{ height: 650, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } }
        }}
      />
    </Box>
  );
}