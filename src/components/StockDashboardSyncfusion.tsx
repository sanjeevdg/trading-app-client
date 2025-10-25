import React, { useEffect, useState } from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  CandleSeries,
  Category,
  Tooltip,
  Zoom,
  Crosshair,
  DateTime,
} from "@syncfusion/ej2-react-charts";

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface StockData {
  symbol: string;
  price: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  marketCap: number;
  candles: Candle[];
}

export default function StockDashboardSyncfusion() {
  const [symbols, setSymbols] = useState("AAPL,MSFT,NVDA,AMZN,META");
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://trading-app-server-35kc.onrender.com/api/cdsstocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: symbols.split(",").map((s) => s.trim()) }),
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statRow = (label: string, value: any, color?: string) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4px",
      }}
    >
      <span style={{ color: "#666" }}>{label}</span>
      <span style={{ color: color || "#000", fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>📊 Stock Dashboard (Syncfusion)</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          value={symbols}
          onChange={(e) => setSymbols(e.target.value)}
          placeholder="Enter stock symbols separated by commas"
          style={{
            width: "70%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={fetchStocks}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Analyze"}
        </button>
      </div>

      {data.map((s) => (
        <div
          key={s.symbol}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>{s.symbol}</h3>
          {statRow("Price", `$${s.price}`)}
          {statRow("P/E Ratio", s.peRatio || "N/A")}
          {statRow("EPS", s.eps || "N/A")}
          {statRow("Dividend Yield", `${s.dividendYield}%`, "#00994d")}
          {statRow("Market Cap", `${(s.marketCap / 1e9).toFixed(2)} B`)}

          <div style={{ marginTop: "10px" }}>
            <ChartComponent
              id={`chart-${s.symbol}`}
              primaryXAxis={{
                valueType: "Category",
                majorGridLines: { width: 0 },
                labelRotation: -45,
              }}
              primaryYAxis={{
                title: "Price",
                labelFormat: "${value}",
                opposedPosition: true,
                lineStyle: { width: 0 },
              }}
              tooltip={{ enable: true }}
              zoomSettings={{ enablePinchZooming: true, enableSelectionZooming: true }}
              crosshair={{ enable: true }}
              title={`Candlestick Chart - ${s.symbol}`}
              height="320px"
            >
              <Inject
                services={[CandleSeries, Category, Tooltip, Zoom, Crosshair, DateTime]}
              />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={s.candles.map((c) => ({
                    x: new Date(c.time),
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                  }))}
                  xName="x"
                  low="low"
                  high="high"
                  open="open"
                  close="close"
                  type="Candle"
                  bearFillColor="#ef5350"
                  bullFillColor="#26a69a"
                  animation={{ enable: true }}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </div>
        </div>
      ))}
    </div>
  );
}
