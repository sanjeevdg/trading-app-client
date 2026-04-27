import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { useWatchlist } from "../context/WatchlistContext";
import { stripExchanges} from "../utils/tickerUtils";

//const API = "http://127.0.0.1:8000";
const API_BASE = import.meta.env.VITE_API_URL;
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


/*

http://127.0.0.1:8000/api/top-movers?symbols=DFIN,OLLI,USLM,POWI,MNPR,CELC,LBRX,SUN,NKTR,FANG,HTO,UTI,CGON,ORKA,TERN,VIST,MANE,PRDO,APEI,SVCO,PLYX,CVGI,PED,SHIM,HFFG,ELTX,REED,WEST,PEW,SANA,CNTX,TNGX,AMPX,DNTH,SOC,GH,DHR,EQH,RGEN,BZ,HNI,CRH,GXO,MMYT,BANC,NXPI,WAL,PHR

*/


  useEffect(() => {
    async function fetchData() {
      try {

        const [scanRes, tvRes, ovsldRes, ovbhtRes,bpRes] = await Promise.all([
          axios.get(`${API_BASE}/api/scan_top_gainers?strategy=momentum&min_price=25&max_price=200&min_volume=100000&top_gainers=0&limit=50`),
          axios.get(`${API_BASE}/api/tv/top-gainers?page=1&limit=50`),
          axios.get(`${API_BASE}/api/scan_top_gainers?strategy=rsi_oversold&min_price=10&max_price=200&min_volume=1000000&top_gainers=1&limit=50`),
          axios.get(`${API_BASE}/api/scan_top_gainers?strategy=rsi_overbought&min_price=10&max_price=200&min_volume=1000000&top_gainers=1&limit=50`),
          axios.get(`${API_BASE}/api/tv/best-performing?page=1&limit=50`),

        ]);

        const scan = scanRes.data.data || [];
        const tv = tvRes.data.data || [];
        const ovbht = ovbhtRes.data.data  || [];
        const ovsld = ovsldRes.data.data  || [];
        const bp = bpRes.data.data  || [];
         // --- STRONG BUY from scan endpoint ---
        const strongScan = scan
          .filter(s => (s.AnalystRating || "").toLowerCase() === "strongbuy")
          .map((s, i) => ({
            id: `scan-${i}`,
            ticker: s.ticker,
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

        const strongOvbht = ovbht
          .filter(t => (t.AnalystRating || "").toLowerCase() === "strongbuy")
          .map((t, i) => ({
            id: `ovbht-${i}`,
            ticker: t.ticker,
            name: t.name,
            close: t.close,
            change: t.change,
            volume: t.volume,
            AnalystRating: t.AnalystRating
          }));  

          const strongOvsld = ovsld
          .filter(t => (t.AnalystRating || "").toLowerCase() === "strongbuy")
          .map((t, i) => ({
            id: `ovbht-${i}`,
            ticker: t.ticker,
            name: t.name,
            close: t.close,
            change: t.change,
            volume: t.volume,
            AnalystRating: t.AnalystRating
          }));  

          const strongBp = bp
          .filter(t => (t.AnalystRating || "").toLowerCase() === "strongbuy")
          .map((t, i) => ({
            id: `ovbht-${i}`,
            ticker: t.ticker,
            name: t.name,
            close: t.close,
            change: t.change,
            volume: t.volume,
            AnalystRating: t.AnalystRating
          }));

        const merged = [...strongScan, ...strongTV, ...strongOvbht, ...strongOvsld, ...strongBp];

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