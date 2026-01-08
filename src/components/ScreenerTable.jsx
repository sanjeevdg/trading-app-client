import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Box, Button, Select, MenuItem, Chip,Link } from "@mui/material";
import TradeOrderModal from './TradeOrderModal';
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Typography,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent
} from "@mui/material";



const ScreenerTable = () => {



const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "80vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 3
};
/*
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 2
};
*/

const navigate = useNavigate();
const [showTradeModal, setShowTradeModal] = useState(false);
const [mysymbol, setMySymbol] = useState(null);

const [newsOpen, setNewsOpen] = useState(false);
const [indOpen, setIndOpen] = useState(false);
const [newsData, setNewsData] = useState([]);
const [indicatorData, setIndicatorData] = useState({});


  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
const [type, setType] = useState("top-gainers");



const [rowCount, setRowCount] = useState(0);
const [paginationModel, setPaginationModel] = useState({
  page: 0,        // DataGrid is 0-based
  pageSize: 50
});


const [openTech, setOpenTech] = useState(false);

const [techData, setTechData] = useState(null);
const [loadingTech, setLoadingTech] = useState(false);



const handleOpenTechModal = (symbol) => {
  setMySymbol(symbol);
  setOpenTech(true);
  fetchTechnicalAnalysis(symbol);
};

const handleCloseTechModal = () => {
  setOpenTech(false);
  setTechData(null);
};

const fetchTechnicalAnalysis = async (symbol) => {
  try {
    setLoadingTech(true);

    const res = await axios.get("https://candlestick-screener.onrender.com/api/technical-analysis", {
      params: {
        symbol,
        exchange: "NASDAQ",
        interval: "1d"
      }
    });

    if (res.data.success) {
      setTechData(res.data);
    }
  } catch (err) {
    console.error("TA fetch error", err);
  } finally {
    setLoadingTech(false);
  }
};


const addToWatchlist = async (symbol) => {
  await axios.post(
    "http://192.168.150.105:5000/api/watchlist",
    { symbol },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};
const openNewsModal = async (symbol) => {
  setMySymbol(symbol);
  setNewsOpen(true);

  const res = await axios.get(
    `https://candlestick-screener.onrender.com/api/tv/news/${symbol}`
  );

  setNewsData(res.data.data || []);
};

const openIndicatorsModal = async (symbol) => {
  setMySymbol(symbol);
  setIndOpen(true);
//192.168.150.105:5000
  const res = await axios.get(
    `https://candlestick-screener.onrender.com/api/tv/indicators/${symbol}?timeframe=1d`
  );

  console.log('res==full>>>>',res.data);

  setIndicatorData(res.data.data.data || {});
};

  // Dynamically define columns based on type
  const getColumns = (type) => {
    const baseColumns = [
      { field: "ticker", headerName: "Symbol", width: 130 },
      { field: "AnalystRating", headerName: "Analyst Rating", width: 130, cellClassName: (params) =>
        (params.value === 'Buy' || params.value ==='StrongBuy') 
      ? "cell-green"
      : "cell-red", },
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
  width: 80,
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
  renderCell: (params) => (
    <Button
      size="small"
      variant="text"
      onClick={() =>
        navigate(`/MultiPaneChartWeb2/${params.row.ticker}`)
      }
    >
      📈
    </Button>
  )
},
{
  field: "watch",
  headerName: "Watch",
  width: 120,
  sortable: false,
  renderCell: (params) => (
    <Button
      size="small"
      onClick={() => addToWatchlist(params.row.ticker)}
    >
      ⭐ Add
    </Button>
  )
},
{
  field: "trade",
  headerName: "Trade",
  width: 80,
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
},
{
    field: "tech",
    headerName: "Technical",
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Button
        size="small"
        variant="outlined"
        onClick={() => handleOpenTechModal(params.row.name)}
      >
        TA
      </Button>
    )
  },
  {
    field: "news",
    headerName: "News",
    width: 80,
    sortable: false,
    renderCell: (params) => (
      <Button
        size="small"
        variant="outlined"
        color="primary"
        onClick={() => openNewsModal(params.row.name)}
      >
        News
      </Button>
    )
  },

  {
    field: "indicators",
    headerName: "Indicators",
    width: 80,
    sortable: false,
    renderCell: (params) => (
      <Button
        size="small"
        variant="contained"
        color="secondary"
        onClick={() => openIndicatorsModal(params.row.name)}
      >
        IN
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


const indicatorColor = (value) => {
  if (typeof value !== "number") return "default";
  if (value > 60) return "success";
  if (value < 40) return "error";
  return "warning";
};


  useEffect(() => {
    const fetchData = async () => {
    setLoading(true);
    const { page, pageSize } = paginationModel;
//192.168.150.105:5000
//candlestick-screener.onrender.com
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
      case "small-cap":
        endpoint = "https://candlestick-screener.onrender.com/api/tv/small-cap";
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

const isNumber = (v) => typeof v === "number" && !Number.isNaN(v);

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
        <MenuItem value="small-cap">Small Cap</MenuItem>
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

<Modal open={openTech} onClose={handleCloseTechModal}>
  <Box sx={modalStyle}>
    <Typography variant="h6" gutterBottom>
      Technical Analysis – {mysymbol}
    </Typography>

    <Divider sx={{ mb: 2 }} />

    {loadingTech && <CircularProgress />}

    {!loadingTech && techData && (
      <>
        {/* Summary */}
        <Typography variant="subtitle1">
          Recommendation: <b>{techData.summary.RECOMMENDATION}</b>
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Oscillators */}
        <Typography variant="subtitle2">Oscillators</Typography>
        <Typography variant="body2">
          Buy: {techData.oscillators.BUY} | 
          Sell: {techData.oscillators.SELL} | 
          Neutral: {techData.oscillators.NEUTRAL}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Moving Averages */}
        <Typography variant="subtitle2">Moving Averages</Typography>
        <Typography variant="body2">
          Buy: {techData.moving_averages.BUY} | 
          Sell: {techData.moving_averages.SELL} | 
          Neutral: {techData.moving_averages.NEUTRAL}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Key Indicators */}
        <Typography variant="subtitle2">Indicators</Typography>
        <Typography variant="body2">
          RSI: {techData.indicators.RSI?.toFixed(2)} <br />
          MACD: {techData.indicators["MACD.macd"]?.toFixed(2)} <br />
          ADX: {techData.indicators.ADX?.toFixed(2)}
        </Typography>
      </>
    )}
  </Box>
</Modal>

<Dialog
  open={newsOpen}
  onClose={() => setNewsOpen(false)}
  maxWidth="md"
  fullWidth
  scroll="paper"   // 👈 critical
>
  <DialogTitle>
    📰 {mysymbol} News
  </DialogTitle>

  <Divider />

  <DialogContent dividers>
    {newsData?.length > 0 ? (
      newsData.map((item, idx) => (
        <Box
          key={idx}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#f9fafb"
          }}
        >
          {/* Title */}
          <Typography variant="subtitle1" fontWeight={600}>
            {item.title || "Untitled"}
          </Typography>

          {/* Meta */}
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            {item.source && (
              <Chip label={item.source} size="small" />
            )}
            {item.published_at && (
              <Chip
                label={new Date(item.published_at).toLocaleDateString()}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          {/* Summary */}
          {item.summary && (
            <Typography
              variant="body2"
              sx={{ mt: 1, color: "text.secondary" }}
            >
              {item.summary}
            </Typography>
          )}

          {/* Link */}
          {item.url && (
            <Link
              href={item.url}
              target="_blank"
              rel="noopener"
              sx={{ display: "inline-block", mt: 1 }}
            >
              Read full article →
            </Link>
          )}
        </Box>
      ))
    ) : (
      <Typography variant="body2" color="text.secondary">
        No news found for this symbol.
      </Typography>
    )}
  </DialogContent>
</Dialog>




<Dialog
  open={indOpen}
  onClose={() => setIndOpen(false)}
  maxWidth="md"
  fullWidth
  scroll="paper"
>
  <DialogTitle>
    📊 {mysymbol} Indicators
  </DialogTitle>

  <Divider />

  <DialogContent dividers>
    {Object.entries(indicatorData).map(([key, value]) => (
      <Box
        key={key}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1
        }}
      >
        <Typography variant="body2">{key}</Typography>

        {typeof value === "number" && !Number.isNaN(value) ? (
          <Chip
            label={value.toFixed(2)}
            color={
              value > 60 ? "success" :
              value < 40 ? "error" :
              "warning"
            }
            size="small"
          />
        ) : (
          <Chip label={String(value)} size="small" />
        )}
      </Box>
    ))}
  </DialogContent>
</Dialog>




    </div>
  );
};

export default ScreenerTable;
