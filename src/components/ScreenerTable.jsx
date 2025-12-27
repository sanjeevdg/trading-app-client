import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Box, Button, Select, MenuItem } from "@mui/material";
import TradeOrderModal from './TradeOrderModal';
import { useNavigate } from "react-router-dom";


const ScreenerTable = () => {



const navigate = useNavigate();
const [showTradeModal, setShowTradeModal] = useState(false);
const [mysymbol, setMySymbol] = useState(null);



  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
const [type, setType] = useState("top-gainers");



const [rowCount, setRowCount] = useState(0);
const [paginationModel, setPaginationModel] = useState({
  page: 0,        // DataGrid is 0-based
  pageSize: 50
});




  // Dynamically define columns based on type
  const getColumns = (type) => {
    const baseColumns = [
      { field: "ticker", headerName: "Symbol", width: 130 },
      { field: "AnalystRating", headerName: "Analyst Rating", width: 130 },
      { field: "change", headerName: "Change %", width: 110, cellClassName: (params) =>
        Number.isFinite(params.value) && params.value >= 0
      ? "cell-green"
      : "cell-red",
   valueFormatter: (p) => Number.isFinite(p) ? `${p.toFixed(2)}%` : "-" },
      { field: "close", headerName: "Price", width: 100, valueFormatter: (p) => Number.isFinite(p) ? p.toFixed(2) : "-" },
      { field: "volume", headerName: "Volume", width: 130, valueFormatter: (p) => Number.isFinite(p) ? p.toLocaleString() : "-" },
      ,
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

    // Add type-specific column
    if (type === "best-performing") {
      baseColumns.splice(1, 0, {  // insert after AnalystRating
        field: "Perf.Y",
        headerName: "Perf.Y",
        width: 120,
        valueFormatter: (p) => Number.isFinite(p) ? `${p.toFixed(2)}%` : "-",
      });
    }

    if (type === "volume-leaders") {
      baseColumns.splice(1, 0, {  // insert after AnalystRating
        field: "Value.Traded",
        headerName: "Value Traded",
        width: 160,
        valueFormatter: (p) => Number.isFinite(p) ? `$${(p / 1e9).toFixed(2)}B` : "-",
      });
    }

    return baseColumns;
  };

  useEffect(() => {
    const fetchData = async () => {
    setLoading(true);
    const { page, pageSize } = paginationModel;
//192.168.150.105:5000

    let endpoint = "";
    switch (type) {
      case "top-gainers":
        endpoint = "https://candlestick-screener.onrender.com/api/tv/top-gainers";
        break;
      case "volume-leaders":
        endpoint = "https://candlestick-screener.onrender.com/api/tv/volume-leaders";
        break;
      case "best-performing":
        endpoint = "https://candlestick-screener.onrender.com/api/tv/best-performing";
        break;
      default:
        console.error("Unknown type:", type);
        return;
    }

    axios
      .get(endpoint, {
      params: {
        page: paginationModel.page + 1,     // backend usually 1-based
        limit: paginationModel.pageSize
      }})
      .then((res) => {
        console.log('typeof res',typeof res);
        console.log('typeof res.data',typeof res.data);
        const data = res.data;
        if (!Array.isArray(data.data)) {
          console.error("Expected array, got:", data.data);
          setRows([]);
          return;
        }

        const mappedRows = data.data.map((row, idx) => ({
          id: row.ticker || `${type}-${idx}`,
          ...row,
        }));
        console.log('mappedRows[0]==',mappedRows[0]);
        setRows(mappedRows);
        setRowCount(data.total);
      })
      .catch((err) => {
        console.error("API error", err);
        setRows([]);
      })
      .finally(() => setLoading(false));
}

  fetchData();



  }, [type,paginationModel]);

  return (
    <div style={{ height: 600, width: "100%" }}>
     <Select
        value={type}
        onChange={(e) => setType(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="top-gainers">Top Gainers</MenuItem>
        <MenuItem value="volume-leaders">Volume Leaders</MenuItem>
        <MenuItem value="best-performing">Best Performing (1Y)</MenuItem>
      </Select>

      <DataGrid
         sx={{
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
        columns={getColumns(type)}
        pageSize={25}
        rowsPerPageOptions={[25, 50]}
        loading={loading}

        pagination
        paginationMode="server"
        rowCount={rowCount}  

        getRowId={(row) => row.ticker}

        autoHeight
        disableSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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


    </div>
  );
};

export default ScreenerTable;
