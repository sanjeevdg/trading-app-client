import React, { useEffect, useRef,useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,HistogramData,
  LineSeries,LineData,
  CrosshairMode,ColorType, CandlestickData,
  Time,
} from 'lightweight-charts';

import { useParams } from "react-router-dom";

export default function MultiPaneChartWeb({}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const legendSymbolRef = useRef<HTMLDivElement | null>(null);
  const legendPriceRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<any>(null);

  const [data, setData] = useState<any>([]);

  const seriesRef = useRef<any>({});

const { symbol } = useParams();
const encoded = encodeURIComponent(`${symbol}`);
console.log('entered tv chrt comp',symbol);
const [force, setForce] = useState(true);

const [loading, setLoading] = useState(true);
const [notFound, setNotFound] = useState(false);

useEffect(() => {
  if (!symbol) return;

  let cancelled = false;
//192.168.150.105:4000
  //trading-app-server-35kc.onrender.com
  async function load() {
    try {
      const url = `https://trading-app-server-35kc.onrender.com/api/fchart2?symbol=${symbol}`;
      const res = await fetch(url);
      const json = await res.json();

      if (cancelled) return;
      console.log('server returned>>>',json);
       if (
        !json ||
        !json.quotes ||
        !Array.isArray(json.quotes) ||
        json.quotes.length === 0
      ) {
        setNotFound(true);
        setData(null);
        return;
      }
      setData(json);
    }  catch (e) {
      console.warn("chart fetch error", e);
      setNotFound(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, [symbol,force]);





  useEffect(() => {



    if (!containerRef.current) return;

    /* ---------------- CHART ---------------- */
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#fafafa' },
        textColor: '#222',
        fontSize: 14,
      },
      grid: {
        vertLines: { color: 'rgba(0,0,0,0.05)' },
        horzLines: { color: 'rgba(0,0,0,0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    /* ---------------- SERIES ---------------- */

    // Pane 0 – Candles
    const candles = chart.addSeries(
      CandlestickSeries,
      {
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        borderVisible: false,
      },
      0
    );

    // Pane 1 – Volume
   const volume = chart.addSeries(
  HistogramSeries,
  {
    priceFormat: { type: 'volume' },
    priceScaleId: '',
  },
  1
);
   volume.priceScale().applyOptions({
  scaleMargins: {
    top: 0.85,
    bottom: 0,
  },
});
  
    // Pane 2 – MACD
 const macdHist = chart.addSeries(
  HistogramSeries,
  { priceScaleId: '' },
  2
);

macdHist.priceScale().applyOptions({
  scaleMargins: {
    top: 0.25,
    bottom: 0.6,
  },
});

    const macdLine = chart.addSeries(LineSeries, { lineWidth: 1 }, 2);
    const signalLine = chart.addSeries(
      LineSeries,
      { lineWidth: 1, lineStyle: 2 },
      2
    );

    // Pane 3 – RSI
    const rsi = chart.addSeries(LineSeries, { lineWidth: 1 }, 3);

    seriesRef.current = {
      candles,
      volume,
      macdHist,
      macdLine,
      signalLine,
      rsi,
    };



// Candles (main pane)
candles.priceScale().applyOptions({
  scaleMargins: { top: 0.05, bottom: 0.25 },
});

// Volume pane
volume.priceScale().applyOptions({
  scaleMargins: { top: 0.7, bottom: 0.05 },
});

// MACD pane
macdHist.priceScale().applyOptions({
  scaleMargins: { top: 0.55, bottom: 0.10 },
});

// RSI pane
rsi.priceScale().applyOptions({
  scaleMargins: { top: 0.55, bottom: 0.10 },
});

    /* ---------------- PANE HEIGHTS ---------------- */
    const h = containerRef.current.clientHeight;






  //  chart.setRowHeight(0, Math.floor(h * 0.55));
  //  chart.setRowHeight(1, Math.floor(h * 0.12));
  //  chart.setRowHeight(2, Math.floor(h * 0.16));
  //  chart.setRowHeight(3, Math.floor(h * 0.17));

    /* ---------------- TOOLTIP ---------------- */
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        tooltipRef.current!.style.display = 'none';
        return;
      }

//      const candle = param.seriesData.get(candles);
      const candle = param.seriesData.get(candles) as CandlestickData<Time> | undefined;

      if (!candle) return;

      legendPriceRef.current!.textContent =
        candle.close.toFixed(2) + ' ' + data?.meta?.currency;

     let date = '';

if (typeof param.time === 'string') {
  date = param.time;
} else if (typeof param.time === 'number') {
  date = new Date(param.time * 1000)
    .toISOString()
    .slice(0, 10);
} else {
  // BusinessDay
  date = `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}`;
}
      
const vol = param.seriesData.get(volume) as HistogramData<Time> | undefined;
  const rsiVal = param.seriesData.get(rsi) as LineData<Time> | undefined;
  const macdVal = param.seriesData.get(macdLine) as LineData<Time> | undefined;
  const sigVal = param.seriesData.get(signalLine) as LineData<Time> | undefined;
  const histVal = param.seriesData.get(macdHist) as HistogramData<Time> | undefined;

/*      const vol = param.seriesData.get(volume);
      const rsiVal = param.seriesData.get(rsi);
      const macdVal = param.seriesData.get(macdLine);
      const sigVal = param.seriesData.get(signalLine);
      const histVal = param.seriesData.get(macdHist);
*/
      legendPriceRef.current!.textContent =
    candle.close.toFixed(2) + ' ' + data?.meta?.currency;

  tooltipRef.current!.innerHTML = `
    <b>${date}</b><hr/>
    <b>OHLC</b><br/>
    O: ${candle.open.toFixed(2)}<br/>
    H: ${candle.high.toFixed(2)}<br/>
    L: ${candle.low.toFixed(2)}<br/>
    C: ${candle.close.toFixed(2)}<br/>
    <hr/>
    <b>Volume</b>: ${vol?.value ?? '-'}<br/>
    <b>RSI</b>: ${rsiVal?.value?.toFixed(2) ?? '-'}<br/>
    <hr/>
    <b>MACD</b><br/>
    MACD: ${macdVal?.value?.toFixed(2) ?? '-'}<br/>
    Signal: ${sigVal?.value?.toFixed(2) ?? '-'}<br/>
    Hist: ${histVal?.value?.toFixed(2) ?? '-'}
  `;

  tooltipRef.current!.style.left = param.point.x + 15 + 'px';
  tooltipRef.current!.style.top = param.point.y + 'px';
  tooltipRef.current!.style.display = 'block';

    });

    return () => chart.remove();
  }, []);

  /* ---------------- DATA ---------------- */
  useEffect(() => {
    

 //   if ((data.length===0) || !seriesRef.current.candles) return;
    if (
  !data ||
  !data.quotes ||
  data.quotes.length === 0 ||
  !seriesRef.current.candles
) {
  return;
}

if (!data.indicators) return;

console.log('data===',seriesRef.current.candles);

    legendSymbolRef.current!.textContent =
      data?.meta?.longName || data?.meta?.symbol;
    legendPriceRef.current!.textContent =
      data?.meta?.regularMarketPrice.toFixed(2) +
      ' ' +
      data?.meta?.currency;

console.log('candles', data.quotes.length);
console.log('rsi', data.indicators?.rsi?.length);
console.log('macd', data.indicators?.macd?.length);


    seriesRef.current.candles.setData(
      data?.quotes?.map((q: any) => ({
        time: q.date.slice(0, 10),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
      }))
    );

    seriesRef.current.volume.setData(
      data?.quotes?.map((q: any) => ({
        time: q.date.slice(0, 10),
        value: q.volume,
        color: q.close >= q.open ? '#26a69a' : '#ef5350',
      }))
    );

    seriesRef.current.rsi.setData(data.indicators.rsi);

    seriesRef.current.macdLine.setData(
      data.indicators.macd.map((m: any) => ({
        time: m.time,
        value: m.macd,
      }))
    );

    seriesRef.current.signalLine.setData(
      data.indicators.macd.map((m: any) => ({
        time: m.time,
        value: m.signal,
      }))
    );

    seriesRef.current.macdHist.setData(
      data.indicators.macd.map((m: any) => ({
        time: m.time,
        value: m.hist,
      }))
    );

    chartRef.current.timeScale().fitContent();
  }, [data]);


if (loading) {
  return (
    <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
      <h2>Loading chart…</h2>
    </div>
  );
}

if (notFound) {
  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#fafafa",
        color: "#666",
        textAlign: "center",
      }}
    >
      <div>
        <h2>📉 Symbol not found</h2>
        <p>
          <b>{symbol}</b> has no available market data.
        </p>
      </div>
    </div>
  );
}


  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 6,
          padding: '6px 10px',
          display: 'flex',
          gap: 12,
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        <div ref={legendSymbolRef} />
        <div ref={legendPriceRef} />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          display: 'none',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 6,
          padding: 10,
          fontSize: 14,
          pointerEvents: 'none',
          zIndex: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      />

      {/* Chart */}
      <div ref={containerRef} style={{ height: '600px' }} />
    </div>
  );
}
