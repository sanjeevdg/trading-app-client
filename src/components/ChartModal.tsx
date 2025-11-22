import React, {useRef, useEffect,useState} from "react";
// import { AdvancedRealTimeChart  } from "react-ts-tradingview-widgets";
import { createChart, ColorType } from "lightweight-charts";

type Pattern = {
  name: string;
  type: "bullish" | "bearish" | "neutral";
  date: string;
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

const ChartModal: React.FC<Props> = ({ symbol,onClose  }) => {


 const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);


 const [chartCandles, setChartCandles] = useState<Candle[]>([]);
  const [chartPatterns, setChartPatterns] = useState<Pattern[]>([]);



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
  //  chartRef.current.remove();
  }

  const chart = createChart(chartContainerRef.current, {
    width: chartContainerRef.current.clientWidth,
    height: 420,
  });
  chartRef.current = chart;

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

