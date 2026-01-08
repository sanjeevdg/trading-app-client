import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Watchlist() {
  const [rows, setRows] = useState([]);

  /* ---------------- LOAD WATCHLIST + PRICES ---------------- */
  useEffect(() => {
    loadWatchlistWithPrices();
  }, []);

const normalizeSymbol = (symbol) =>
  symbol.includes(":") ? symbol.split(":")[1] : symbol;


  const loadWatchlistWithPrices = async () => {
    try {
      /* 1️⃣ Fetch watchlist symbols */
      const wlRes = await axios.get(
        "https://candlestick-screener.onrender.com/api/watchlist"
      );

      const symbols = wlRes.data.data.map((r) => r.symbol);
      if (!symbols.length) {
        setRows([]);
        return;
      }
//192.168.150.105:5000
      // candlestick-screener.onrender.com

      /* 2️⃣ Fetch prices */
      const priceRes = await axios.get(
        `https://candlestick-screener.onrender.com/api/watchlist/prices?symbols=${symbols.join(
          ","
        )}`
      );

      const priceMap = priceRes.data; // { AAPL: { price, timestamp, ... } }

      /* 3️⃣ Build rows ONCE */
      const mergedRows = symbols.map((symbol) => {
        

      const normalized = normalizeSymbol(symbol);
      const data = priceMap[normalized];

        return {
          id: symbol,
          symbol,
          open: data?.open ?? null,
          high: data?.high ?? null,
          low: data?.low ?? null,
          close: data?.close ?? null,          
          volume: data?.volume ?? null,
          lastUpdated: data?.timestamp ?? null,
        };
      });

      console.log('mergedRows[0]',mergedRows[0]);
      setRows(mergedRows);
    } catch (err) {
      console.error("Failed to load watchlist with prices", err);
    }
  };
//192.168.150.105:5000
  /* ---------------- REMOVE SYMBOL ---------------- */
  const removeSymbol = async (symbol) => {
    try {
      await axios.delete(
        `https://candlestick-screener.onrender.com/api/watchlist/${symbol}`
      );

      setRows((prev) => prev.filter((r) => r.symbol !== symbol));
    } catch (err) {
      console.error("Failed to remove symbol", err);
    }
  };

  /* ---------------- GRID COLUMNS ---------------- */
  const columns = [
    { field: "symbol", headerName: "Symbol", width: 150 },

    {
      field: "open",
      headerName: "Open",
      width: 100,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "high",
      headerName: "High",
      width: 100,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "low",
      headerName: "Low",
      width: 100,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "close",
      headerName: "Close",
      width: 100,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "volume",
      headerName: "volume",
      width: 100,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v : "--"
    },
    
    {
      field: "remove",
      headerName: "",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          onClick={() => removeSymbol(params.row.symbol)}
        >
          ❌
        </Button>
      )
    }
  ];

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        ⭐ Watchlist
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
}
