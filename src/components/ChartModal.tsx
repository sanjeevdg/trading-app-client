import React, {useRef, useEffect,useState} from "react";
// import { AdvancedRealTimeChart  } from "react-ts-tradingview-widgets";
import { useParams } from "react-router-dom";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import {
  createChart,
  ColorType,
  type SeriesMarker,
  type Time,
  type SeriesMarkerShape,
} from "lightweight-charts";

type Pattern = {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  date: string;
  rsi?: number;   // 🔥 MAKE OPTIONAL
  macd?: number;  // 🔥 MAKE OPTIONAL
};
// ADD THESE TYPES
type StockInfo = {
  floatShares?: number;   // e.g., 120000000
};


type Candle = {
  time: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; 
};

interface Props {
  symbol: string;
  onClose: () => void;
}
type Marker = {
  time: string;
  position: 'aboveBar' | 'belowBar';
  shape: 'arrowUp' | 'arrowDown';
  color: string;
  text: string;
};
//{ symbol,onClose  }
const ChartModal: React.FC = () => {

 const handle = useFullScreenHandle();
 const { symbol } = useParams<{ symbol: string }>();


 const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);


 const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartPatterns, setChartPatterns] = useState<Pattern[]>([]);

const [showRSI, setShowRSI] = useState(true);
const [showMACD, setShowMACD] = useState(true);
const [showVolume, setShowVolume] = useState(true);

// ---- RSI & MACD CALCULATION HELPERS ----
function calculateRSI(data: any[], period = 14) {
  let gains: number[] = [];
  let losses: number[] = [];
  let rsiData: any[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);

    if (i >= period) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgGain / (avgLoss || 1);
      const rsi = 100 - 100 / (1 + rs);

      rsiData.push({ time: data[i].date.split("T")[0], value: rsi });
    }
  }
  return rsiData;
}

function calculateEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];

  values.forEach((curr, i) => {
    if (i === 0) {
      ema.push(curr);  // first value = seed
    } else {
      ema.push(curr * k + ema[i - 1] * (1 - k));
    }
  });

  return ema;
}


function calculateMACD(data: { date: string; close: number }[]) {
  const closingPrices = data.map(d => d.close);

  const ema12 = calculateEMA(closingPrices, 12);
  const ema26 = calculateEMA(closingPrices, 26);

  const macdLine: number[] = ema12.map((v: number, i: number) => {
    return v - (ema26[i] || 0);
  });

  const signalLine: number[] = calculateEMA(macdLine, 9);
  const histogram: number[] = macdLine.map((v: number, i: number) => {
    return v - (signalLine[i] || 0);
  });

  return data.slice(26).map((d, i) => ({
    time: d.date.split("T")[0],
    macd: macdLine[i + 26],
    signal: signalLine[i] || 0,
    hist: histogram[i] || 0,
  }));
}



 useEffect(() => {
    async function loadHistoricalData() {
      const params = new URLSearchParams();
      params.append("symbols", symbol || "");
      params.append("type", "all");
//trading-app-server-35kc.onrender.com
      const res = await fetch(`http://localhost:4000/api/screener?${params}`);
      const data = await res.json();


      initChart(data[0].candles,data[0].patterns);


      setChartCandles(data[0].candles || []);
      setChartPatterns(data[0].patterns || []);
    }

    loadHistoricalData();

  async function initChart(chartCandles:Candle[] ,chartPatterns:Pattern[] ) { 

console.log('chart-candles',chartCandles.length);
console.log('chart-[patt]',chartPatterns.length);

  //if (!chartContainerRef.current || chartCandles.length === 0) return;


  if (!chartContainerRef.current) return;

  // 🧽 Cleanup old chart (if exists)
  if (chartRef.current) {
    chartRef.current.remove();
  }
  // Assuming you already fetched OHLCV data and stock info:
const stockInfo: StockInfo = {
  floatShares: 125000000,  // example
};


const chart = createChart(chartContainerRef.current, {
  width: chartContainerRef.current.clientWidth,
  height: 400, // ⬆ taller for 3 panes
  layout: { background: { color: "#ffffff" }, textColor: "#333" },
  rightPriceScale: { visible: true },
});
chartRef.current = chart;

const activePaneCount = 1 + (showRSI ? 1 : 0) + (showMACD ? 1 : 0) + (showVolume ? 1 : 0);

chart.resize(
  chartContainerRef.current.clientWidth,
  activePaneCount * 200     // 200px each pane
);

/*
chart.priceScale('macd').applyOptions({
  scaleMargins: { top: 0.7, bottom: 0 },
});

  const candleSeries = chart.addCandlestickSeries({
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  });
*/
// =============================================================
// 1️⃣ PRICE PANE  (Top)  → occupies TOP 60% of screen
// =============================================================
const candleSeries = chart.addCandlestickSeries({ priceScaleId: 'price' });
chart.priceScale('price').applyOptions({
  scaleMargins: { top: 0, bottom: 0.50 },  // 👈 Leaves space for next panes
});
candleSeries.setData(chartCandles.map(c => ({
  time: c.date,
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close,
  volume:c.volume
})));


console.log("chartCandles[0]==", chartCandles[0]);
/*
  // 👉 DO NOT CHECK length === 0
  if (chartCandles.length > 0) {
    candleSeries.setData(
      chartCandles.map((c) => ({
        time: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume:c.volume
      }))
    );
    console.log('SET DATA SUCCESS');
  }
*/
  // Set markers after data loads
  if (chartPatterns.length > 0) {
    candleSeries.setMarkers(
      chartPatterns.map((p) => ({        
        time: p.date.split("T")[0],
       position:
            p.type === "bullish" ? "aboveBar" : p.type === "bearish" ? "belowBar" : "aboveBar",
          shape:
            p.type === "bullish"
              ? "arrowUp"
              : p.type === "bearish"
              ? "arrowDown"
              : "square",
          color:
            p.type === "bullish"
              ? "#22c55e"
              : p.type === "bearish"
              ? "#ef4444"
              : "#fbbf24",
        text: p.name,
      }))
    );
  }


// TREND COLORING BASED ON PRICE MOMENTUM
// =====================================================
    //       PATTERN MARKERS — ICON BASED ON NAME
    // =====================================================
    const ICONS: Record<string, SeriesMarkerShape> = {
  "Double Top": "arrowDown",
  "Double Bottom": "arrowUp",
  "Head And Shoulders": "arrowDown",
  "Triangle": "circle",
  "Flag": "square",
  "Doji": "square",  // ✔ fallback to supported shape
};

 const trendMarkers: SeriesMarker<Time>[] = chartPatterns.map((p) => ({
  time: p.date.split("T")[0],
  position: p.type === "bullish" ? "belowBar" : "aboveBar",
  shape: (
    ICONS[p.name] ||
    (p.type === "bullish" ? "arrowUp" : p.type === "bearish" ? "arrowDown" : "cross")
  ) as SeriesMarkerShape,
  color:
    p.type === "bullish" ? "#22c55e" :
    p.type === "bearish" ? "#ef4444" :
    "#fbbf24",
  text: p.name,
}));

  
  // -------- 🧠 TOOLTIP --------
  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.display = "none";
  tooltip.style.pointerEvents = "none";
  tooltip.style.background = "rgba(0, 0, 0, 0.8)";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "5px 10px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.fontSize = "12px";
  tooltip.style.zIndex = "10";
  chartContainerRef.current.appendChild(tooltip);

  chart.subscribeCrosshairMove((param: any) => {
    if (!param.point || !param.time) {
      tooltip.style.display = "none";
      return;
    }

    const pattern = chartPatterns.find(p => p.date.split("T")[0] === param.time);
    if (pattern) {
      tooltip.style.left = param.point.x + 10 + "px";
      tooltip.style.top = param.point.y - 20 + "px";
      tooltip.innerHTML = `<strong>${pattern.name}</strong><br/>Type: ${pattern.type}`;
      tooltip.style.display = "block";
    } else {
      tooltip.style.display = "none";
    }
  });

if (showRSI) {
// ---- ADD RSI SERIES ----
const rsiSeries = chart.addLineSeries({ color: 'purple', lineWidth: 1 });
const rsiData = calculateRSI(chartCandles);
rsiSeries.setData(rsiData);
}
/*

// ---- 🧠 MACD IN SEPARATE VISUAL PANE ----
const macdPane = chart.addLineSeries({
  priceScaleId: 'macd',          // separate scale
  lineWidth: 2,
});

// 👉 this pushes MACD to bottom (like TradingView)
chart.priceScale('macd').applyOptions({
  scaleMargins: {
    top: 0.8,    // 80% = price at top
    bottom: 0,  // 20% reserved for MACD pane
  },
});

// MACD DATA
const macdData = calculateMACD(chartCandles);

macdPane.setData(
  macdData.map((d) => ({
    time: d.time,
    value: d.macd,
  }))
);

// 🔁 SIGNAL LINE
const macdSignal = chart.addLineSeries({
  priceScaleId: 'macd',   // same pane
  lineWidth: 1,
});

macdSignal.setData(
  macdData.map((d) => ({
    time: d.time,
    value: d.signal,
  }))
);

// 📊 HISTOGRAM BAR PLOT
const macdHistogram = chart.addHistogramSeries({
  priceScaleId: 'macd',   // stays in MACD pane
});
// 🛠 Apply `priceFormat` to the histogram series itself
macdHistogram.applyOptions({
  priceFormat: { type: 'price', precision: 4 },
});

// 📏 Apply `scaleMargins` to the MACD pane (priceScale)
chart.priceScale('macd').applyOptions({
  scaleMargins: { top: 0.7, bottom: 0 },
});


macdHistogram.setData(
  macdData.map((d) => ({
    time: d.time,
    value: d.hist,
    color: d.hist >= 0 ? 'green' : 'red',
  }))
);

*/





/*

// ---- NEW PANE FOR MACD ----
const macdPane = chart.addLineSeries({ priceScaleId: 'macd' }); // separate pane
chart.priceScale('macd').applyOptions({ scaleMargins: { top: 0.7, bottom: 0 } });

const macdData = calculateMACD(chartCandles);
macdPane.setData(macdData.map(d => ({ time: d.time, value: d.macd })));

// SIGNAL LINE
const macdSignal = chart.addLineSeries({ priceScaleId: 'macd', lineWidth: 1 });
macdSignal.setData(macdData.map(d => ({ time: d.time, value: d.signal })));

// HISTOGRAM
const histogramSeries = chart.addHistogramSeries({ priceScaleId: 'macd' });
histogramSeries.setData(macdData.map(d => ({
  time: d.time,
  value: d.hist,
  color: d.hist >= 0 ? 'green' : 'red',
})));
*/

// assume these exist and are arrays of { time: 'YYYY-MM-DD', ... }
const rsiData = calculateRSI(chartCandles);    // [{ time, value }]
const macdData = calculateMACD(chartCandles);  // [{ time, macd, signal, histogram }]

console.log('RSIDATA==',rsiData);
console.log('MACDDATA==',macdData);


// safe helper to format numeric values
//const fmt = (v: any) => (Number.isFinite(v) ? (v as number).toFixed(2) : "-");

// create tooltip element (if not already created)
const tooltip2 = document.createElement("div");
Object.assign(tooltip2.style, {
  position: "absolute",
  display: "none",
  pointerEvents: "none",
  background: "rgba(0,0,0,0.8)",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: "8px",
  fontSize: "12px",
  zIndex: "1000",
});
chartContainerRef.current?.appendChild(tooltip2);

// helper: safe number formatting
const fmt = (v: any) => (Number.isFinite(v) ? v.toFixed(2) : "-");

chart.subscribeCrosshairMove((param: any) => {
  if (!param?.point || !param?.time) {
    tooltip2.style.display = "none";
    return;
  }

  // --- normalize time format to "YYYY-MM-DD" ---
  let dateStr = "";
  if (typeof param.time === "string") {
    dateStr = param.time;
  } else if (typeof param.time === "number") {
    dateStr = new Date(param.time * 1000).toISOString().split("T")[0];
  } else if (param.time.year) {
    const mm = String(param.time.month).padStart(2, "0");
    const dd = String(param.time.day).padStart(2, "0");
    dateStr = `${param.time.year}-${mm}-${dd}`;
  }

  // --- find data for this date ---
  const pattern = chartPatterns.find((p) => p.date.split("T")[0] === dateStr);
  const rsiPoint = rsiData.find((r) => r.time === dateStr);
  const macdPoint = macdData.find((m) => m.time === dateStr);

  // --- position the tooltip ---
  tooltip2.style.left = param.point.x + 10 + "px";
  tooltip2.style.top = param.point.y - 20 + "px";

  // --- CASE 1: Pattern exists ---
  if (pattern) {
    tooltip2.style.display = "block";
    tooltip2.innerHTML = `
      <strong>${pattern.name}</strong><br/>
      Type: ${pattern.type}<br/>
      ${pattern.name === "Doji" ? "⚠️ Market Indecision<br/>" : ""}
      <hr style="border: 0; border-top: 1px solid #555; margin: 6px 0">
      RSI: ${fmt(rsiPoint?.value)}<br/>
      MACD: ${fmt(macdPoint?.macd)}<br/>
      Signal: ${fmt(macdPoint?.signal)}<br/>
      Histogram: ${fmt(macdPoint?.hist)}
    `;
    return;
  }

  // --- CASE 2: NO pattern but RSI/MACD available ---
  if (rsiPoint || macdPoint) {
    tooltip2.style.display = "block";
    tooltip2.innerHTML = `
      <strong>${dateStr}</strong><br/>
      RSI: ${fmt(rsiPoint?.value)}<br/>
      MACD: ${fmt(macdPoint?.macd)}<br/>
      Signal: ${fmt(macdPoint?.signal)}<br/>
      Histogram: ${fmt(macdPoint?.hist)}
    `;
    return;
  }

  // --- CASE 3: Nothing available ---
  tooltip2.style.display = "none";
});



/*
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.point || !param.time) {
        tooltip2.style.display = "none";
        return;
      }

      const pattern = chartPatterns.find(
        (p) => p.date.split("T")[0] === param.time
      );

      if (pattern) {
        tooltip2.style.left = param.point.x + 10 + "px";
        tooltip2.style.top = param.point.y - 20 + "px";
        tooltip2.style.display = "block";
        tooltip2.innerHTML = `
  <strong>${pattern.name}</strong><br/>
  Type: ${pattern.type}<br/>
  ${pattern.name === "Doji" ? "⚠️ Market Indecision" : ""}
  RSI: ${pattern.rsi ?? "-"}<br/>
  MACD: ${pattern.macd ?? "-"}
`;
      } else {
        tooltip2.style.display = "none";
      }
    });
*/



    // =====================================================
    //                  LEGEND ON CHART
    // =====================================================
    const legend = document.createElement("div");
    legend.style.position = "absolute";
    legend.style.bottom = "20px";
    legend.style.left = "20px";
    legend.style.background = "rgba(255, 255, 255, 0.9)";
    legend.style.padding = "8px 12px";
    legend.style.borderRadius = "6px";
    legend.style.fontSize = "12px";
    legend.style.marginBottom = "-28px";
    legend.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
    legend.innerHTML = `
  <div>🟢 Bullish → ArrowUp</div>
  <div>🔴 Bearish → ArrowDown</div>
  <div>🟡 Neutral → Square / Circle (Doji)</div>
`;
    chartContainerRef.current.appendChild(legend);



// =============================================================
// 2️⃣ VOLUME PANE  (Middle) → takes 20% of height
// =============================================================
    if (showVolume) {
const volumeSeries = chart.addHistogramSeries({
  priceScaleId: 'volume',
});
chart.priceScale('volume').applyOptions({
  scaleMargins: { top: 0.65, bottom: 0.25 }, // between price & MACD
});
volumeSeries.applyOptions({ priceFormat: { type: 'volume' } });
volumeSeries.setData(
  chartCandles.map(c => ({
    time: c.date,
    value: c.volume,
    color: c.close > c.open ? '#4caf50' : '#ff5252',
  }))
);

}

// =============================================================
// 3️⃣ MACD PANE  (Bottom) → takes last 20% of screen
// =============================================================


if (showMACD) {

// MACD LINE
const macdLine = chart.addLineSeries({ priceScaleId: 'macd', lineWidth: 2 });

chart.priceScale('macd').applyOptions({
  scaleMargins: { top: 0.85, bottom: 0 }, // 👈 bottom-most pane
});

// MACD SIGNAL
const macdSignal = chart.addLineSeries({ priceScaleId: 'macd', lineWidth: 1 });
// HISTOGRAM
const macdHistogram = chart.addHistogramSeries({ priceScaleId: 'macd' });

const macdData = calculateMACD(chartCandles);
macdLine.setData(macdData.map(d => ({ time: d.time, value: d.macd })));
macdSignal.setData(macdData.map(d => ({ time: d.time, value: d.signal })));

macdHistogram.applyOptions({ priceFormat: { type: 'price', precision: 4 } });
macdHistogram.setData(
  macdData.map(d => ({
    time: d.time,
    value: d.hist,
    color: d.hist >= 0 ? 'green' : 'red',
  }))
);

}

/*
// ---------------- Volume Pane (NEW) ----------------
//const volumePane = chart.addPane();
const volumeSeries = chart.addHistogramSeries({
  priceScaleId: 'volume',
});

// AFTER the series is created → apply options to its price scale
chart.priceScale('volume').applyOptions({
  scaleMargins: { top: 0.85, bottom: 0 }, // pushes panel down
});

volumeSeries.applyOptions({
  priceFormat: { type: 'volume' }, // THIS must be applied to the series
});

volumeSeries.setData(
  chartCandles.map((c) => ({
    time: c.date,
    value: c.volume,
    color: c.close > c.open ? '#4caf50' : '#ff5252', // green/red bars
  }))
);
*/

// ---------------- FLOAT DISPLAY (NEW) ----------------
if (stockInfo?.floatShares) {
  const floatText = `Float: ${(stockInfo.floatShares / 1_000_000).toFixed(1)}M shares`;

  const floatLabel = document.createElement("div");
  floatLabel.style.position = "absolute";
  floatLabel.style.top = "10%";
  floatLabel.style.left = "50%";
  floatLabel.style.padding = "4px 10px";
  floatLabel.style.borderRadius = "5px";
  floatLabel.style.background = "#222";
  floatLabel.style.color = "white";
  floatLabel.style.fontSize = "12px";
  floatLabel.innerText = floatText;
chartContainerRef.current.style.position = "relative";  // REQUIRED
  chartContainerRef.current.appendChild(floatLabel);
}





  
};


//return () => chart.remove();


  }, [symbol,showMACD,showRSI,showVolume]); // 🔁 refetch if symbol changes


/*
<div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,          
      }}
    //  onClick={onClose}
    >
    </div>

    */

  return (
      <div
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
<button onClick={handle.enter}>
        Enter fullscreen
      </button>
 
</div>
<FullScreen handle={handle}>
 <div ref={chartContainerRef} style={{ marginTop: 0, width: "100%", height: "100%", position: "relative" }} />
</FullScreen>
 

      </div>
    
  );
};

/*


 <div style={{ height: "600px" }}>
      <AdvancedRealTimeChart
        symbol={symbol}
        interval="D"
        studies={["RSI@tv-basicstudies", "MACD@tv-basicstudies"]}
        autosize
        theme="light"
        container_id="tv-chart"
      />
    </div>


*/
        

export default ChartModal;

