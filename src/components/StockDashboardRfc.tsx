import React, { useEffect, useState } from "react";
import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  XAxis,
  YAxis,
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  OHLCTooltip,
  ZoomButtons,
} from "react-financial-charts";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import { format } from "d3-format";
const BASE_URL = "https://trading-app-server-35kc.onrender.com";

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

export default function StockDashboardRfc() {
  const [symbols, setSymbols] = useState("AAPL,MSFT,NVDA,AMZN,META");
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_URL + "/api/cdsstocks", {
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
      <h2 style={{ marginBottom: "10px" }}>📊 Stock Dashboard (React Financial Charts)</h2>
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

      {data.map((s) => {
        const candles = s.candles.map((c) => ({
          date: new Date(c.time),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        if (candles.length === 0) return null;

        const xAccessor = (d: any) => d.date;
        const xExtents = [candles[0].date, candles[candles.length - 1].date];

        return (
          <div
            key={s.symbol}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{s.symbol}</h3>
            {statRow("Price", `$${s.price}`)}
            {statRow("P/E Ratio", s.peRatio || "N/A")}
            {statRow("EPS", s.eps || "N/A")}
            {statRow("Dividend Yield", `${s.dividendYield}%`, "#00994d")}
            {statRow("Market Cap", `${(s.marketCap / 1e9).toFixed(2)} B`)}

            <div style={{ marginTop: "20px", height: "400px" }}>
              <ChartCanvas
                height={400}
                width={800}
                ratio={3}
                margin={{ left: 60, right: 60, top: 20, bottom: 30 }}
                data={candles}
                seriesName={s.symbol}
                xAccessor={xAccessor}
                xScale={scaleTime() as any}
                xExtents={xExtents}
              >
                <Chart id={1} yExtents={(d) => [d.high, d.low]}>
                  <XAxis showGridLines />
                  <YAxis showGridLines tickFormat={format(".2f")} />

                  <MouseCoordinateX displayFormat={timeFormat("%b %Y")} />
                  <MouseCoordinateY displayFormat={format(".2f")} />

                  <CandlestickSeries
                    wickStroke="#000000"
                    fill={(d) => (d.close > d.open ? "#26a69a" : "#ef5350")}
                    stroke={(d) => (d.close > d.open ? "#26a69a" : "#ef5350")}
                  />

                  <OHLCTooltip origin={[10, 10]} />
                </Chart>

                <ZoomButtons />
                <CrossHairCursor />
              </ChartCanvas>
            </div>
          </div>
        );
      })}
    </div>
  );
}
