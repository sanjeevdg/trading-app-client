import React, { useEffect, useRef,useState } from 'react';
import {
   createChart,
  CandlestickSeries,
  HistogramSeries,
  Time,
  CandlestickData,
  HistogramData,
  SeriesMarker,
  createSeriesMarkers,
} from 'lightweight-charts';
import { useParams } from "react-router-dom";

type Pattern = {
  name: string;
  type: 'bullish' | 'bearish';
  date: string;
};

type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type BackendResponse = {
  symbol: string;
  patterns: Pattern[];
  candles: Candle[];
};


const PatternCandleChart: React.FC = ({
  
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
const markersRef = useRef<any>(null);

const [data,setData] = useState<any>([]);
const [force, setForce] = useState(false);
const { symbol } = useParams();

const height = 500;

useEffect(() => {
  if (!symbol) return;

  let cancelled = false;
//trading-app-server-35kc.onrender.com
//192.168.150.105:4000
  async function load() {
    try {
      const url = `https://trading-app-server-35kc.onrender.com/api/screener?symbols=`+ symbol + `&type=all`;
      const res = await fetch(url);
      const json = await res.json();

      if (cancelled) return;
      console.log('server returned>>>',json);
      setData(json[0]);
    } catch (e) {
      console.warn('chart fetch error', e);
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, [symbol,force]);



  useEffect(() => {
    if ((data.length ===0) || !containerRef.current) return;

    // --- Create chart ---
    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#000',
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    // --- Candlestick series ---
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });







    // --- Candle data ---
    const candleData: CandlestickData<Time>[] =
      data.candles.map((c:any) => ({
        time: c.date as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

    candleSeries.setData(candleData);

   // --- Create markers controller (v5) ---
    markersRef.current = createSeriesMarkers(candleSeries);

    const markers: SeriesMarker<Time>[] = data.patterns.map((p:any) => ({
      time: p.date as Time,
      position: p.type === 'bullish' ? 'belowBar' : 'aboveBar',
      color: p.type === 'bullish' ? '#2ecc71' : '#e74c3c',
      shape: p.type === 'bullish' ? 'arrowUp' : 'arrowDown',
      text: p.name,
    }));

    markersRef.current.setMarkers(markers);


/* =======================
       Volume pane (Histogram)
       ======================= */
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume', // 👈 creates new pane
      priceFormat: {
        type: 'volume',
      },
    });

    // Hide price scale for volume
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      visible: false,
    });

    const volumeData: HistogramData<Time>[] = data.candles.map((c:any) => ({
      time: c.date as Time,
      value: c.volume,
      color: c.close >= c.open ? '#26a69a' : '#ef5350',
    }));

    volumeSeries.setData(volumeData);





    chart.timeScale().fitContent();

    const resize = () => {
      chart.applyOptions({
        width: containerRef.current!.clientWidth,
      });
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    //  markersRef?.current?.remove();
      chart.remove();
    };
  }, [data, height]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height }}
    />
  );
};

export default PatternCandleChart;
