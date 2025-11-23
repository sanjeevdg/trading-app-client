import React, {useRef, useEffect,useState} from "react";
// import { AdvancedRealTimeChart  } from "react-ts-tradingview-widgets";
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

type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
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

const ChartModal: React.FC<Props> = ({ symbol,onClose  }) => {


 const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);


 const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartPatterns, setChartPatterns] = useState<Pattern[]>([]);



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
      params.append("symbols", symbol);
      params.append("type", "all");

      const res = await fetch(`https://trading-app-server-35kc.onrender.com/api/screener?${params}`);
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

  const chart = createChart(chartContainerRef.current, {
    width: chartContainerRef.current.clientWidth,
    height: 380,
  });
  chartRef.current = chart;

/*
chart.priceScale('macd').applyOptions({
  scaleMargins: { top: 0.7, bottom: 0 },
});
*/
  const candleSeries = chart.addCandlestickSeries({
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
  });

  // 👉 DO NOT CHECK length === 0
  if (chartCandles.length > 0) {
    candleSeries.setData(
      chartCandles.map((c) => ({
        time: c.date.split("T")[0],
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );
    console.log('SET DATA SUCCESS');
  }

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


// ---- ADD RSI SERIES ----
const rsiSeries = chart.addLineSeries({ color: 'purple', lineWidth: 1 });
const rsiData = calculateRSI(chartCandles);
rsiSeries.setData(rsiData);




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

macdHistogram.setData(
  macdData.map((d) => ({
    time: d.time,
    value: d.hist,
    color: d.hist >= 0 ? 'green' : 'red',
  }))
);







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

// =====================================================
    //          TOOLTIP — RSI + MACD INCLUDED
    // =====================================================
    const tooltip2 = document.createElement("div");
    tooltip2.style.position = "absolute";
    tooltip2.style.display = "none";
    tooltip2.style.pointerEvents = "none";
    tooltip2.style.background = "rgba(0, 0, 0, 0.8)";
    tooltip2.style.color = "#fff";
    tooltip2.style.padding = "6px 12px";
    tooltip2.style.borderRadius = "8px";
    tooltip2.style.fontSize = "12px";
    tooltip2.style.zIndex = "1000";

    chartContainerRef.current.appendChild(tooltip2);

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


//  return () => chart.remove();
};





  }, [symbol]); // 🔁 refetch if symbol changes




  return (
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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 10,
          width: "90%",
          height: "90%",            
        }}
      >
        
 <div ref={chartContainerRef} style={{ marginTop: 0, width: "100%", height: "100%", position: "relative" }} />

 

      </div>
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

