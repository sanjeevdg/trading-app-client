import { createChart, CandlestickSeries,
  HistogramSeries,
  LineSeries,AreaSeries,
  ColorType,
  IChartApi,IPaneApi,
  ISeriesApi,
  AreaData,
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
  Time, } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';


type IndicatorMap = Record<string, LineData<Time>[]>;

type ChartApiResponse = {
  candles: any[];
  volume: any[];
  indicators?: IndicatorMap;
};

const indicators = ['RSI', 'SMA', 'EMA', 'MACD'];

export default function StockChart() {




  const chartContainerRef = useRef(null);
  const [indicator, setIndicator] = useState('SMA');

const INDICATORS = ["SMA", "EMA","RSI"] as const;

const OVERLAY_INDICATORS = ["SMA", "EMA"];
const PANE_INDICATOR = "RSI";



const [activeIndicators, setActiveIndicators] = useState<string[]>(['SMA']);

const [tf, setTf] = useState('5m');
const timeframes = ["1m", "5m", "15m"];
const chartRef = useRef<IChartApi | null>(null);
const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
const overlaySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
const indicatorSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
const pricePaneRef = useRef<IPaneApi<Time> | null>(null);
const overlaySeriesMapRef = useRef<Record<string, ISeriesApi<'Line'>>>({});





const { symbol } = useParams();

//console.log('indicator==',indicator);
  useEffect(() => {

if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
       height: 500,
       layout: {
        background: { color: '#ffffff' },
        textColor: '#000000',
        panes: {
            separatorColor: '#f5f5f5',
            separatorHoverColor: '#00ff00',
            enableResize: true,
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },

    });

  //  const pricePane = chart.addPane();
//const volumePane = chart.addPane();
//volumePane.setHeight(120);
//const indicatorPane = chart.addPane();
//indicatorPane.setHeight(140);

//{ height: 120 }
//{ height: 140 }
    // Candlestick
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

const overlaySeries = chart.addSeries(LineSeries, {
      color: '#ff0066',
      lineWidth: 2,
    });


    // Volume (Histogram) — *paneIndex: 1 creates a second pane*
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '', // no price scale
      color: '#26a69a',
    });

    // Indicator (Line) — separate pane
    const indicatorSeries = chart.addSeries(LineSeries, {
      color: '#ff6600',
      lineWidth: 2,
    });

const pricePane = chart.panes()[0];
    
    volumeSeries.moveToPane(1);
    indicatorSeries.moveToPane(2);

/*
candleSeries.priceScale().applyOptions({
  scaleMargins: { top: 0.05, bottom: 0.25 },
});

// Volume pane
volumeSeries.priceScale().applyOptions({
  scaleMargins: { top: 0.7, bottom: 0.05 },
});
*/

    fetch(`http://127.0.0.1:5000/api/chart?symbol=${symbol}&indicators=${indicator}`)
      .then(res => res.json())
      .then(data => {
        console.log('my-chart-data==',data);
        candleSeries.setData(data.candles);
        volumeSeries.setData(data.volume);
        Object.keys(overlaySeriesMapRef.current).forEach(name => {
      if (!activeIndicators.includes(name)) {
        overlaySeriesMapRef.current[name].setData([]);
      }
    });
      if (!activeIndicators.includes("RSI")) {
  indicatorSeriesRef.current?.setData([]);
  }
        const indicators = data.indicators as IndicatorMap | undefined;
      
if (!indicators) return;

Object.entries(indicators).forEach(([name, series]) => {
  if (OVERLAY_INDICATORS.includes(name)) {
    // ✅ SMA / EMA overlay
    getOverlaySeries(name).setData(series);
    //chartRef.current?.removePane(2);
  }

  if (name === "RSI") {
    // ✅ RSI goes to indicator pane
    indicatorSeriesRef.current?.setData(series);
  }
});

     //   indicatorSeries.setData(data.indicators);
      });




    chart.timeScale().fitContent();


   chartRef.current = chart;
   pricePaneRef.current = pricePane;
   candleSeriesRef.current = candleSeries;
  volumeSeriesRef.current = volumeSeries;
overlaySeriesRef.current = overlaySeries;
indicatorSeriesRef.current = indicatorSeries;


    return () => chart.remove();
  }, [symbol, activeIndicators, tf]);


function getOverlaySeries(name: string) {
  if (!overlaySeriesMapRef.current[name]) {
    overlaySeriesMapRef.current[name] =
      pricePaneRef.current!.addSeries(LineSeries, {
        lineWidth: 2,
        color: name === "SMA" ? "#3b82f6" : "#f97316",
      });
  }
  return overlaySeriesMapRef.current[name];
}




//http://127.0.0.1:5000/api/chart?symbol=NVDA&indicator=EMA&tf=5m

useEffect(() => {
  if (!activeIndicators) return;
// || !chartRef.current
  const controller = new AbortController();

  async function loadIndicator() {
     const query = activeIndicators.join(",");
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/chart?symbol=${symbol}&indicators=${query}&tf=${tf}`,
        { signal: controller.signal }
      );

      const data = await res.json();

      console.log('refetchdata===',data);

      // ---------- PRICE ----------
      candleSeriesRef.current?.setData(data.candles);

      // ---------- VOLUME ----------
      volumeSeriesRef.current?.setData(data.volume);

      

      Object.keys(overlaySeriesMapRef.current).forEach(name => {
      if (!activeIndicators.includes(name)) {
        overlaySeriesMapRef.current[name].setData([]);
      }
    });
      if (!activeIndicators.includes("RSI")) {
  indicatorSeriesRef.current?.setData([]);
  }
      const indicators = data.indicators as IndicatorMap | undefined;
if (!indicators) return;

Object.entries(indicators).forEach(([name, series]) => {
  if (OVERLAY_INDICATORS.includes(name)) {
    // ✅ SMA / EMA overlay
    getOverlaySeries(name).setData(series);
    chartRef.current?.removePane(2);
  //  chart.removePane(2);
  }

  if (name === "RSI") {
    // ✅ RSI goes to indicator pane
    indicatorSeriesRef.current?.setData(series);
  }
});


/*
    // Set active indicators
    Object.entries(data.indicators || {}).forEach(([name, series]) => {
      getOverlaySeries(name).setData(series);
    });
*/

     // ---------- OVERLAY vs PANE ----------
/*
      if (indicator === 'SMA' || indicator === 'EMA') {
        overlaySeriesRef.current?.setData(data.indicatorSeries);
        indicatorSeriesRef.current?.setData([]); // hide RSI pane
        chartRef.current?.removePane(2);

      } else {
        overlaySeriesRef.current?.setData([]);   // hide overlay
        indicatorSeriesRef.current?.setData(data.indicatorSeries);
      }
*/
      // ---------- FINAL STEP ----------
      chartRef.current?.timeScale().fitContent();
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        console.error('Indicator fetch failed', e);
      }
    }
  }

  loadIndicator();

  return () => controller.abort();
}, [activeIndicators, symbol,tf]);



/*

      <select
        value={indicator}
        onChange={(e) => setIndicator(e.target.value)}
        style={{ marginBottom: 10 }}
      >
        {indicators.map(i => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
      */

  return (
    <>
      <div style={{display:'lex',flexDirection:'row'}} >
      

{INDICATORS.map(ind => (
  <label key={ind}>
    <input
      type="checkbox"
      checked={activeIndicators.includes(ind)}
      onChange={() =>
        setActiveIndicators(prev =>
          prev.includes(ind)
            ? prev.filter(i => i !== ind)
            : [...prev, ind]
        )
      }
    />
    {ind}
  </label>
))}


<select value={tf} onChange={e => setTf(e.target.value)}>
  {timeframes.map(t => (
    <option key={t} value={t}>{t}</option>
  ))}
</select>
</div>
      <div ref={chartContainerRef} />
    </>
  );
}
