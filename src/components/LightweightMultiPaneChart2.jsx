import React, { useEffect, useRef,useState } from "react";
import {
  createChart,
  CrosshairMode,
} from "lightweight-charts";

import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useParams } from "react-router-dom";
import "../styles/Tooltip.css";

const LightweightMultiPaneChart2: React.FC = () => {
  const container = useRef();
const [showRSI, setShowRSI] = useState(true);
const [showMACD, setShowMACD] = useState(true);
const [showVolume, setShowVolume] = useState(true);
const [showAI, setShowAI] = useState(true);

const chartRef = useRef(null);

const { symbol } = useParams();

const handle = useFullScreenHandle();
const tooltipRef = useRef();


function computeATSF(quotes) {
  const period = 20; // sliding window
  const out = [];

  for (let i = period; i < quotes.length; i++) {
    const slice = quotes.slice(i - period, i);
    const closes = slice.map(p => p.close);

    // Linear regression slope
    const n = closes.length;
    const x = [...Array(n).keys()];
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = closes.reduce((a, b) => a + b) / n;

    const slope =
      x.reduce((acc, xi, j) => acc + (xi - meanX) * (closes[j] - meanY), 0) /
      x.reduce((acc, xi) => acc + (xi - meanX) ** 2, 0);

    // Momentum score
    const momentum = (closes[n - 1] - closes[0]) / closes[0];

    // Volatility penalty
    const variance =
      closes.reduce((acc, c) => acc + (c - meanY) ** 2, 0) / n;
    const volPenalty = Math.sqrt(variance);

    // Normalize AI score from 0-100
    let score = slope * 1200 + momentum * 100 - volPenalty * 5;
    score = Math.max(0, Math.min(100, score));

    out.push({
      time: slice[slice.length - 1].date.split("T")[0],
      value: parseFloat(score.toFixed(2)),
    });
  }

  return out;
}

useEffect(() => {
  if (!container.current || !tooltipRef.current) return;

  const tooltip = tooltipRef.current;
  tooltip.style.display = "block";
  tooltip.style.position = "absolute";
  tooltip.style.left = "20px";
  tooltip.style.top = "20px";
  tooltip.innerHTML = "TEST TOOLTIP";

 // console.log("Tooltip exists:", tooltip); // Should NOT be null now
}, []);


  useEffect(() => {
    if (!symbol) return;
//trading-app-server-35kc.onrender.com
    //localhost:4000




    async function fetchData() {


let aiPane = null;


      
      const res = await fetch(`https://trading-app-server-35kc.onrender.com/api/fchart2?symbol=${symbol}`);
      const data = await res.json();

      if (!data.quotes) return;
      container.current.innerHTML = ""; // clear chart on symbol change

      // --- CHART BASE ---
     
chartRef.current = createChart(container.current, {
  height: 700,
  layout: {
    textColor: "#000",                // Black text
    background: { color: "#FFFFFF" }, // White background
  },
  grid: {
    vertLines: { color: "#e6e6e6" },  // Light grey grid
    horzLines: { color: "#e6e6e6" },
  },
  crosshair: { mode: CrosshairMode.Normal },
});

const chart = chartRef.current;
      // --- MAIN PRICE PANEL ---
      const candleSeries = chart.addCandlestickSeries({
        priceScaleId: "main",
      });

candleSeries.priceScale().applyOptions({
  scaleMargins: {
    top: 0.1,
    bottom: 0.1,
  },
  borderVisible: true,
});

candleSeries.applyOptions({
  priceFormat: {
    type: 'price', // other options: 'volume', 'percent'
    precision: 2,
    minMove: 0.01,
  },
});

      //chart.priceScale("main").applyOptions({ scaleMargins: { top: 0.02, bottom: 0.55 } });

      candleSeries.setData(
        data.quotes.map(q => ({
          time: q.date.split("T")[0],
          open: q.open,
          high: q.high,
          low: q.low,
          close: q.close,
        }))
      );

let volumeSeries = null;
      // --- VOLUME ---
        if (showVolume) {
       volumeSeries = chart.addHistogramSeries({
        priceScaleId: "", // separate scale
        priceFormat: { type: "volume" },
        scaleMargins: { top: 0.8, bottom: 0 },
      });
     // Volume (Histogram)
volumeSeries.setData(
  data.quotes
    .map(q => ({
      time: q.date.split("T")[0],
      value: q.volume,
    }))
    .filter(d => typeof d.value === "number" && !isNaN(d.value))
);
}
      // --- RSI PANEL ---
 let rsiPane = null;
 let macdHistPane = null;
if (showRSI) {
      rsiPane = chart.addLineSeries({
        priceScaleId: "rsi",
        color: "#d9534f",         // RED
        scaleMargins: { top: 0.6, bottom: 0 },
      });
      rsiPane.setData(data.indicators.rsi);

      // --- MACD HISTOGRAM ---
      macdHistPane = chart.addHistogramSeries({
        priceScaleId: "macd",
        scaleMargins: { top: 0.4, bottom: 0 },
      });
      
    // MACD Histogram
macdHistPane.setData(
  data.indicators.macd
    .map(m => ({
      time: m.time,
      value: m.hist,
    }))
    .filter(d => typeof d.value === "number" && !isNaN(d.value))
);

      // --- MACD LINE ---
      const macdLinePane = chart.addLineSeries({  priceScaleId: "macd",
  color: "#4285f4",         // BLUE
  lineWidth: 2, });
      macdLinePane.setData(data.indicators.macd.map(m => ({
        time: m.time,
        value: m.macd,
      })));

      // --- MACD SIGNAL (DOTTED) ---
      const macdSignalPane = chart.addLineSeries({
        priceScaleId: "macd",
         color: "#f4b400",         // YELLOW
         lineStyle: 1, 
         lineWidth: 2,
      });
      macdSignalPane.setData(data.indicators.macd.map(m => ({
        time: m.time,
        value: m.signal,
      })));
    }


chart.subscribeCrosshairMove((param) => {
//  const tooltip = tooltipRef.current;
 const tooltip = document.getElementById("chart-tooltip");
//console.log("crosshair move -price", param.seriesPrices);




   if (!param || !param.seriesData) return;

 if (!tooltip || !param.point || !param.time) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }



  // PRICE (from Candle Series)
  const price = param.seriesData.get(candleSeries);

  // RSI (from your created RSI Line Series)
  const rsiVal = rsiPane ? param.seriesData.get(rsiPane) : null;

  // MACD (use histogram or signal depending on what was created)
  const macdVal = macdHistPane ? param.seriesData.get(macdHistPane) : null;

  // VOLUME (series must be OHLC or histogram)
  const volumeVal = volumeSeries ? param.seriesData.get(volumeSeries) : null;

  const aiVal = aiPane ? param.seriesData.get(aiPane) : null;

if (price !== undefined) {
  tooltip.innerHTML = `
    <b>${param.time}</b><br/>
    💰 Open: ${price.open?.toFixed(2)}<br/>
    💰 High: ${price.high?.toFixed(2)}<br/>
    💰 Low: ${price.low?.toFixed(2)}<br/>
    💰 Close: ${price.close?.toFixed(2)}<br/>
    📉 RSI: ${rsiVal.value?.toFixed(2) || "-"}<br/>
    📊 MACD: ${macdVal.value?.toFixed(2) || "-"}<br/>
    🔊 Volume: ${volumeVal.value || "-"}
    🤖 AI Trend Strength: <b>${aiVal?.value?.toFixed(2) || "-"}</b><br/>
  `;


  tooltip.style.left = param.point.x + 20 + "px";
  tooltip.style.top = param.point.y + 20 + "px";
  tooltip.style.display = "block";
  return;
} else {
    tooltip.style.display = 'none';
    return;
  }


});

//console.log("Tooltip exists:", document.getElementById("chart-tooltip"));

    data.enrichedTrendlines.forEach((t) => {
  const series = chart.addLineSeries({
    color: t.type === "support" ? "#28a745" : "#dc3545",
    lineWidth: 2,
    lineStyle: 2, // dashed
  });

  series.setData([
    { time: t.p1.time, value: t.p1.price },
    { time: t.p2.time, value: t.p2.price },
  ]);

if (t.breakout) {
    const lastPoint = data.quotes[data.quotes.length - 1];

    chart.addShape({
      type: 'text',
      text: t.breakout === "bullish" ? "🚀 Breakout!" : "⚠ Breakdown!",
      color: t.breakout === "bullish" ? "#00b894" : "#d63031",
      x: lastPoint.time,
      y: lastPoint.close,
      fontSize: 16,
    });

alert(
    `🚨 ${t.breakout.toUpperCase()} breakout detected on ${symbol} at ${lastPoint.close}`
  );

  }


});




if (showAI && data.ai?.atsf) {
  aiPane = chart.addLineSeries({
    priceScaleId: "ai",
    color: "#6f42c1",        // purple
    lineWidth: 2,
    scaleMargins: { top: 0.7, bottom: 0 },
  });

  aiPane.setData(data.ai.atsf);
}




}
    fetchData();



  }, [symbol,showMACD,showRSI,showVolume]);


useEffect(() => {
  return () => {
    if (chartRef.current) {
      chartRef.current.remove(); // remove chart to avoid duplicates
      chartRef.current = null;
    }
  };
}, []);


  return (<div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 10,
          width: "100%",
          height: "100%", 
          paddingBottom:100,           
        }}
      >
       
<div style={{
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
}}>
  <label><input type="checkbox" checked={showRSI} onChange={() => setShowRSI(!showRSI)} /> RSI</label>
  <label><input type="checkbox" checked={showMACD} onChange={() => setShowMACD(!showMACD)} /> MACD</label>
  <label><input type="checkbox" checked={showVolume} onChange={() => setShowVolume(!showVolume)} /> Volume</label>  

<label>
  <input type="checkbox" checked={showAI} onChange={() => setShowAI(!showAI)} />
  AI Trend Strength
</label>

<button onClick={handle.enter}>
        Enter fullscreen
      </button>
 
</div>
<FullScreen handle={handle}>
 <div ref={container} style={{ width: "100%", height: "800px" }} />
  <div id="chart-tooltip" ref={tooltipRef} className="chart-tooltip"></div>
</FullScreen>
 

      </div>);
  
}

export default LightweightMultiPaneChart2;
