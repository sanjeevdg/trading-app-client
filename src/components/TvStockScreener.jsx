import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  Switch,Stack,
  FormControlLabel
} from "@mui/material";



import { useNavigate } from "react-router-dom";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import TradeOrderModal from './TradeOrderModal';

const TvStockScreener: React.FC = () => {



const navigate = useNavigate();
const [showTradeModal, setShowTradeModal] = useState(false);
const [mysymbol, setMySymbol] = useState(null);

  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters (client + server)
  const [strategy, setStrategy] = useState("rsi_oversold");
  const [topGainers, setTopGainers] = useState(false);
  const [minPrice, setMinPrice] = useState(5);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minVolume, setMinVolume] = useState(1_000_000);


  const fetchStocks = async () => {
    setLoading(true);
    try {
      const params = {
        strategy,
        min_price: minPrice,
        max_price: maxPrice,
        min_volume: minVolume,
        top_gainers: topGainers ? 1 : 0
      };
//candlestick-screener.onrender.com
      // 192.168.150.105:5000
      const res = await axios.get("https://candlestick-screener.onrender.com/api/scan_top_gainers", { params });

      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      // Assign stable IDs
      const withIds = data.map((row, idx) => ({ id: idx, ...row }));
      setRawRows(withIds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // -----------------------------
  // CLIENT-SIDE SANITIZATION
  // -----------------------------
  const rows = useMemo(() => {
    return rawRows.filter((r) => {
      const close = Number(r.close);
      const vol = Number(r.volume);

      // Hard reject broken / OTC junk rows
      if (!isFinite(close) || close < minPrice || close > maxPrice) return false;
      if (!isFinite(vol) || vol < minVolume) return false;

      return true;
    });
  }, [rawRows, minPrice, maxPrice, minVolume]);

  const columns: GridColDef[] = [
    { field: "ticker", headerName: "Ticker", width: 140 },
    { field: "name", headerName: "Name", width: 90 },
    {
  field: "close",
  headerName: "Price",
  width: 110,
  type: "number",
  valueFormatter: (value) =>
    value != null && isFinite(value) ? value.toFixed(2) : "--"
},
   {
  field: "volume",
  headerName: "Volume",
  width: 140,
  type: "number",
  valueFormatter: (value) =>
    value != null && isFinite(value) ? value.toLocaleString() : "--"
},
   {
  field: "RSI",
  headerName: "RSI",
  width: 90,
  type: "number",
  valueFormatter: (value) =>
    value != null && isFinite(value) ? value.toFixed(2) : "--"
},
   {
  field: "changePct",
  headerName: "Change %",
  width: 130,
  type: "number",
  sortable: true,
  valueGetter: (value, row) => {
    if (!row) return null;

    const close = Number(row.close);
    const abs = Number(row.change_abs);

    if (!isFinite(close) || !isFinite(abs)) return null;

    const prev = close - abs;
    if (Math.abs(prev) < 1e-9) return 0;

    return (abs / prev) * 100;
  },
  cellClassName: (value) =>
        value.value > 0 ? "cell-green" : "cell-red",
  valueFormatter: (value) =>
    value != null ? `${value.toFixed(2)}%` : "--"
},
{
  field: "chart",
  headerName: "Chart",
  width: 90,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  renderCell: (params) => (
    <Button
      size="small"
      variant="text"
      onClick={() =>
        navigate(`/MultiPaneChartWeb/${params.row.name}`)
      }
    >
      📈
    </Button>
  )
},
{
  field: "trade",
  headerName: "Trade",
  width: 100,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  renderCell: (params) => (
    <Button
      size="small"
      variant="contained"
      color="success"
      onClick={() => {
        setMySymbol(params.row.name);
        setShowTradeModal(true);
      }}
    >
      Buy
    </Button>
  )
}

  ];

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        📊 TradingView Stock Screener
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 2
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Strategy</InputLabel>
            <Select value={strategy} label="Strategy" onChange={(e) => setStrategy(e.target.value)}>
              <MenuItem value="rsi_oversold">RSI Oversold</MenuItem>
              <MenuItem value="rsi_overbought">RSI Overbought</MenuItem>
              <MenuItem value="momentum">Momentum</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Min Price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.valueAsNumber)} />
          <TextField label="Max Price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.valueAsNumber)} />
          <TextField label="Min Volume" type="number" value={minVolume} onChange={(e) => setMinVolume(e.target.valueAsNumber)} />

          <FormControlLabel
            control={<Switch checked={topGainers} onChange={() => setTopGainers(!topGainers)} />}
            label="Top Gainers"
          />
        </CardContent>
      </Card>

      <Button variant="contained" onClick={fetchStocks} disabled={loading} sx={{ mb: 2 }}>
        {loading ? "Scanning..." : "Scan Stocks"}
      </Button>

      <Box sx={{ height: 540, width: "100%" }}>
        <DataGrid sx={{
    "& .MuiDataGrid-cell.cell-green": {
      color: "#2e7d32",
      fontWeight: 600,
    },
    "& .MuiDataGrid-cell.cell-red": {
      color: "#c62828",
      fontWeight: 600,
    },
  }}
          rows={rows}
          autoHeight
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
            sorting: { sortModel: [{ field: topGainers ? "changePct" : "RSI", sort: "desc" }] }
          }}
          disableRowSelectionOnClick
        />
      </Box>

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


    </Box>
  );
};

export default TvStockScreener;
