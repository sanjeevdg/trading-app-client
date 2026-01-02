import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, Button, Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import TradeOrderModal from './TradeOrderModal';
import { useNavigate } from "react-router-dom";




export default function MarketMoversGrid() {
//192.168.150.105:5000
//candlestick-screener.onrender.com
const CATEGORY_OPTIONS = [
  {
    label: "Top Gainers",
    value: "gainers",
    endpoint: "https://candlestick-screener.onrender.com/api/market-movers?category=gainers&limit=50",
  },
  {
    label: "Most Active",
    value: "most-active",
    endpoint: "https://candlestick-screener.onrender.com/api/market-movers?category=most-active&limit=50",
  },
  {
    label: "Pre-Market Gainers",
    value: "pre-market-gainers",
    endpoint: "https://candlestick-screener.onrender.com/api/market-movers?category=pre-market-gainers&limit=50",
  },
  {
    label: "After-Hours Gainers",
    value: "after-hours-gainers",
    endpoint: "https://candlestick-screener.onrender.com/api/market-movers?category=after-hours-gainers&limit=50",
  }
];



const columns = [
  {
    field: "symbol",
    headerName: "Symbol",
    width: 150,
  },
  {
    field: "close",
    headerName: "Close",
    width: 100,
    type: "number",
    valueFormatter: (v) => v?.value?.toFixed(2),
  },
  {
  field: "change",
  headerName: "Change %",
  width: 120,
  type: "number",
  renderCell: (params) => {
    const value = params.value ?? 0;
    const color =
      value > 0 ? "#2e7d32" : value < 0 ? "#d32f2f" : "#666";

    return (
      <span style={{ color, fontWeight: 600 }}>
        {value.toFixed(2)}%
      </span>
    );
  },
},
{
  field: "change_abs",
  headerName: "Change",
  width: 110,
  type: "number",
  renderCell: (params) => {
    const value = params.value ?? 0;
    const color =
      value > 0 ? "#2e7d32" : value < 0 ? "#d32f2f" : "#666";

    return (
      <span style={{ color, fontWeight: 600 }}>
        {value.toFixed(2)}
      </span>
    );
  },
},
  {
    field: "market_cap_basic",
    headerName: "Market Cap",
    width: 140,
    type: "number",
    valueFormatter: (v) =>
      v
        ? `${(v / 1_000_000).toFixed(2)}M`
        : "—",
  },
  {
    field: "volume",
    headerName: "Volume",
    width: 140,
    type: "number",
    valueFormatter: (v) =>
      v ? v.toLocaleString() : "—",
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
        navigate(`/MultiPaneChartWeb2/${params.row.name}`)
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


  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);


const navigate = useNavigate();
const [showTradeModal, setShowTradeModal] = useState(false);
const [mysymbol, setMySymbol] = useState(null);



  const fetchData = async (endpoint,category) => {
    try {
      setLoading(true);
      const res = await axios.get(endpoint);

      const data = res.data?.data || [];

      // DataGrid requires a unique id
      const rowsWithId = data.map((row, index) => ({
        id: `${row.symbol}-${index}`,
        ...row,
      }));

      setRows(rowsWithId);
    } catch (err) {
      console.error("Failed to fetch market movers:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(category.endpoint,category.category);
  }, [category]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Dropdown */}
      <FormControl sx={{ mb: 2, minWidth: 260 }}>
        <InputLabel>Market Movers</InputLabel>
        <Select
          value={category.value}
          label="Market Movers"
          onChange={(e) => {
            const selected = CATEGORY_OPTIONS.find(
              (c) => c.value === e.target.value
            );
            setCategory(selected);
          }}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            fontWeight: "bold",
          },
        }}
      />
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
}
