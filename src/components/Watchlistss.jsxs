import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {socket} from '../utils/socket';
/*
import { io } from "socket.io-client";


const socket = io("http://192.168.150.105:5000", {
  transports: ["websocket"]
});
*/

export default function Watchlist() {
  const [rows, setRows] = useState([]);
  const [force, setorce] = useState(true);
  const navigate = useNavigate();
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
        "http://192.168.150.105:5000/api/watchlist"
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
        `http://192.168.150.105:5000/api/watchlist/prices?symbols=${symbols.join(
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

     // console.log('mergedRows[0]',mergedRows[0]);
      setRows(mergedRows);
    } catch (err) {
      console.error("Failed to load watchlist with prices", err);
    }
  };

useEffect(() => {
  const onPrice = data => {
    console.log('data returned from socket...',data);
  };

  socket.on("price", onPrice);
console.log('in seffect....e222222',socket);
  rows.forEach(row => {
    const clean = row?.symbol.split(":");
    socket.emit("subscribe", { symbol: clean[1] });
    console.log('done emitting to...',clean[1]);
  });

//  socket.emit("subscribe", symbol);

  return () => {
    rows.forEach(row => {
      socket.emit("unsubscribe", { symbol: row?.symbol });
    });
    socket.off("price", onPrice); // 🔑 THIS LINE FIXES IT
  };
}, []);


/*
useEffect(() => {

socket.emit("subscribe", "MSFT");
socket.on("price", data => {
  console.log('yahoo got response...',data);
});
console.log('fired seeffect ...socket emitted sbscribe....')
/*
  if (!rows.length) return;

  // subscribe all symbols
  rows.forEach(row => {
    socket.emit("subscribe", { symbol: row.symbol });
  });

  socket.on("realtime_bar", (bar) => {
    const lastUpdatedMs = bar.time * 1000;
    console.log('rows changed',bar);
    setRows(prev =>
      prev.map(row =>
        row.symbol.endsWith(bar.symbol)
          ? {
              ...row,
              close: bar.close,
              open: bar.open,
              high: bar.high,
              low: bar.low,
              volume: bar.volume,
              lastUpdated: lastUpdatedMs
            }
          : row
      )
    );

  },[] );



  return () => {
   
    rows.forEach(row => {
      socket.emit("unsubscribe", { symbol: row.symbol });
    });

    socket.off("price");

  };
}, [rows.length,force]);

*/



//192.168.150.105:5000
  //candlestick-screener.onrender.com
  /* ---------------- REMOVE SYMBOL ---------------- */
  const removeSymbol = async (symbol) => {
    try {
      await axios.delete(
        `http://192.168.150.105:5000/api/watchlist/${symbol}`
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
      width: 70,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "high",
      headerName: "High",
      width: 70,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "low",
      headerName: "Low",
      width: 70,
      valueFormatter: (v) =>
        Number.isFinite(v) ? v.toFixed(2) : "--"
    },
    {
      field: "close",
      headerName: "Close",
      width: 70,
     cellClassName: (params) => {
    const { open, close } = params.row;

    if (!Number.isFinite(open) || !Number.isFinite(close)) return "";

    return close > open ? "cell-green" :  "cell-red" ;
  },
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
  field: "chart",
  headerName: "Chart",
  width: 70,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  renderCell: (params) => (
    <Button
      size="small"
      variant="text"
      onClick={() =>
        navigate(`/MultiPaneChartWeb2/${params.row.symbol}`)
      }
    >
      📈
    </Button>
  )
},
  {
  field: "lastUpdated",
  headerName: "Last Updated",
  width: 180,
  valueFormatter: (params) => {
  if (!params) return "-";

  const diff = Math.floor((Date.now() - params) / 1000);

  if (diff < 5) return "now";
  if (diff < 60) return `${diff}s ago`;

  return new Date(params).toLocaleString();
  },
},
  {
      field: "remove",
      headerName: "Remove",
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
        sx={{
    "& .cell-green": {
      color: "#2e7d32",
      fontWeight: 600,
    },
    "& .cell-red": {
      color: "#c62828",
      fontWeight: 600,
    },
  }}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50, 100]}        
      />
    </Box>
  );
}
