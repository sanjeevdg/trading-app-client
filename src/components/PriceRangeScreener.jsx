import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  TextField,
  Button,
  Chip,Link,
  Typography,Modal,Divider,CircularProgress, Dialog,DialogContent, DialogTitle, 
} from "@mui/material";
import TradeOrderModal from './TradeOrderModal';
import { useNavigate } from "react-router-dom";

//192.168.150.105:5000
const API_URL = "https://candlestick-screener.onrender.com/api/stocks/price-range";

export default function PriceRangeScreener() {
  const [rows, setRows] = useState([]);
  const [minPrice, setMinPrice] = useState(50);
  const [maxPrice, setMaxPrice] = useState(200);
  const [loading, setLoading] = useState(false);


const navigate = useNavigate();
const [showTradeModal, setShowTradeModal] = useState(false);
const [mysymbol, setMySymbol] = useState(null);

const [newsOpen, setNewsOpen] = useState(false);
const [indOpen, setIndOpen] = useState(false);
const [newsData, setNewsData] = useState([]);
const [indicatorData, setIndicatorData] = useState({});

const [openTech, setOpenTech] = useState(false);

const [techData, setTechData] = useState(null);
const [loadingTech, setLoadingTech] = useState(false);

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



  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        params: {
          min: minPrice,
          max: maxPrice,
          limit: 50
        }
      });

      // DataGrid requires unique id
      const formatted = res.data.data.map((row, index) => ({
        id: `${row.symbol}-${index}`,
        ...row
      }));

      setRows(formatted);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: "symbol",
      headerName: "Symbol",
      flex: 1,
      fontWeight: 600
    },
    {
      field: "Recommend.All",
      headerName: "Rec",
      flex: 0.7,
      renderCell: (params) => {
        const v = params.value;
        return (
          <Chip
            size="small"
            label={v?.toFixed(2)}
            color={
              v > 0.2 ? "success" :
              v < -0.2 ? "error" :
              "warning"
            }
          />
        );
      }
    },
    {
      field: "change",
      headerName: "% Change",
      flex: 0.9,
      renderCell: (params) => (
        <Typography
          sx={{
            color: params.value >= 0 ? "green" : "red",
            fontWeight: 500
          }}
        >
          {params.value?.toFixed(2)}%
        </Typography>
      )
    },
    {
      field: "change_abs",
      headerName: "Change",
      flex: 0.9,
      renderCell: (params) => (
        <Typography
          sx={{
            color: params.value >= 0 ? "green" : "red"
          }}
        >
          {params.value?.toFixed(2)}
        </Typography>
      )
    },
    {
      field: "close",
      headerName: "Price",
      flex: 0.8,
      renderCell: (params) => (
        <Typography fontWeight={600}>
          ${params.value?.toFixed(2)}
        </Typography>
      )
    },
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
        navigate(`/MultiPaneChartWeb2/${params.row.symbol}`)
      }
    >
      📈
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

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        📊 Price Range Screener
      </Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Min Price"
          type="number"
          size="small"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <TextField
          label="Max Price"
          type="number"
          size="small"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={fetchData}
          disabled={loading}
        >
          Scan
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 }
            }
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




    </Box>
  );
}
