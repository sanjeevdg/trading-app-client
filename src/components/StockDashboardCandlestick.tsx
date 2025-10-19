import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  IChartApi,
} from "lightweight-charts";

interface StockData {
  symbol: string;
  price: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  marketCap: number;
  candles: { time: string; open: number; high: number; low: number; close: number }[];
  dividendYields: { date: string; yield: string }[];
}



export default function StockDashboardCandlestick() {
  const [symbols, setSymbols] = useState("AAPL,MSFT,NVDA,AMZN,META");
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const chartRefs = useRef<Record<string, IChartApi>>({});

  const BASE_URL = "https://trading-app-server-35kc.onrender.com"; 

//http://localhost:4000


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

  // Create candlestick + line charts
  useEffect(() => {
    data.forEach((s) => {
      const container = document.getElementById(`chart-${s.symbol}`);
      if (!container || chartRefs.current[s.symbol]) return;

      const chart = createChart(container, {
        width: container.clientWidth,
        height: 300,
        layout: {
          background: { type: ColorType.Solid, color: "#ffffff" },
          textColor: "#000",
        },
        grid: {
          vertLines: { color: "#eee" },
          horzLines: { color: "#eee" },
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
      });

      // ✅ Correct new API
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      candlestickSeries.setData(
        s.candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      // 📈 Add dividend yield line chart overlay
      const yieldSeries = chart.addSeries(LineSeries, {
        color: "#007bff",
        lineWidth: 2,
      });

      yieldSeries.setData(
        s.dividendYields.map((d) => ({
          time: d.date,
          value: parseFloat(d.yield),
        }))
      );

      chart.timeScale().fitContent();
      chartRefs.current[s.symbol] = chart;
    });
  }, [data]);

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>📊 Stock Dashboard</h2>
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

          <div
            id={`chart-${s.symbol}`}
            style={{
              marginTop: "10px",
              height: "300px",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          />
        </div>
      ))}
    </div>
  );
}
