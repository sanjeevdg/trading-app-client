import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,AreaSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
  AreaData,
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
} from 'lightweight-charts';
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";

const socket = io("http://192.168.150.105:5000");

export default function MultiPaneChartWeb2() {
  const containerRef = useRef<HTMLDivElement | null>(null);
 

const chartRef = useRef<IChartApi | null>(null);
const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
/*
  const chartRef = useRef<any>(null);

const candleSeriesRef = useRef<any>(null);
const volumeSeriesRef = useRef<any>(null);
*/
  const legendSymbolRef = useRef<HTMLDivElement | null>(null);
  const legendPriceRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const seriesRef = useRef<any>({});

  const { symbol } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
//candlestick-screener.onrender.com
    //192.168.150.105:5000

    async function load() {
      try {
        const url = `https://candlestick-screener.onrender.com/api/fchart2?symbol=${symbol}`;
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;
        if (!json?.quotes?.length) {
          setNotFound(true);
          setData(null);
          return;
        }
        setData(json);
      } catch (e) {
        console.warn('Chart fetch error', e);
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
  }, [symbol]);

  /* ---------------- CREATE CHART ---------------- */
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#fafafa' },
        textColor: '#222',
        fontSize: 12,
         panes: {
            separatorColor: '#f22c3d',
            separatorHoverColor: 'rgba(255, 0, 0, 0.1)',
            // setting this to false will disable the resize of the panes by the user
            enableResize: false,
        },
      },
      grid: {
        vertLines: { color: 'rgba(0,0,0,0.05)' },
        horzLines: { color: 'rgba(0,0,0,0.05)' },
      },      
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    // ---------------- SERIES ----------------
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderVisible: false,
    },
      0);


    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '', // secondary scale
      color: "#26a69a",     
    },
      1);

    const macdLine = chart.addSeries(LineSeries, {
      color: '#2962ff',
      lineWidth: 1,
      priceScaleId: '', // secondary scale
    },2);
    const signalLine = chart.addSeries(LineSeries, {
      color: '#ff6d00',
      lineWidth: 1,
      lineStyle: 2,
      priceScaleId: '',
    },2);
    const macdHist = chart.addSeries(HistogramSeries, {
      color: '#ff8a65',
      priceScaleId: '',
    },2);

    const rsi = chart.addSeries(LineSeries, {
      color: '#8e24aa',
      lineWidth: 1,
      priceScaleId: '',
    },3);

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


    seriesRef.current = {
      candles,
      volume,
      macdLine,
      signalLine,
      macdHist,
      rsi
    };

    // ---------------- TOOLTIP ----------------
    chart.subscribeCrosshairMove((param) => {

      

      if (!param.time || !param.point) {
        tooltipRef.current!.style.display = 'none';
        return;
      }

      const candle = param.seriesData.get(candles) as CandlestickData<Time> | undefined;
      if (!candle) return;

      legendSymbolRef.current!.textContent = data?.meta?.longName || symbol;
      
      legendPriceRef.current!.textContent = candle.close.toFixed(2) + ' ' + data?.meta?.currency;

      const vol = param.seriesData.get(volume) as HistogramData<Time> | undefined;
    
      const rsiVal = param.seriesData.get(rsi) as LineData<Time> | undefined;
      const macdVal = param.seriesData.get(macdLine) as LineData<Time> | undefined;
      console.log('macdVal',macdVal);
      const sigVal = param.seriesData.get(signalLine) as LineData<Time> | undefined;
      console.log('sigVal',sigVal);

      const histVal = param.seriesData.get(macdHist) as HistogramData<Time> | undefined;
      console.log('histVal',histVal);


      let date = '';
      if (typeof param.time === 'number') {
        date = new Date(param.time * 1000).toISOString().slice(0, 10);
      } else if (typeof param.time === 'string') {
        date = param.time;
      } else {
        date = `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}`;
      }

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

      // Simple positioning inside container
      tooltipRef.current!.style.left = param.point.x + 15 + 'px';
  tooltipRef.current!.style.top = param.point.y - 80 + 'px';
  tooltipRef.current!.style.display = 'block';
/*
      const chartRect = containerRef.current!.getBoundingClientRect();
      tooltipRef.current!.style.left = Math.min(Math.max(param.point.x + 15, 0), chartRect.width - 200) + 'px';
      tooltipRef.current!.style.top = Math.min(Math.max(param.point.y, 0), chartRect.height - 120) + 'px';
      tooltipRef.current!.style.display = 'block';
      */
    });

   chartRef.current = chart;
   candleSeriesRef.current = candles;
  volumeSeriesRef.current = volume;
 
    return () => chart.remove();

  }, [data]);

  /* ---------------- SET DATA ---------------- */
  useEffect(() => {
    if (!data || !data.quotes || !seriesRef.current.candles) return;

    const { candles, volume, rsi, macdLine, signalLine, macdHist } = seriesRef.current;

    // Candles
    candles.setData(
      data.quotes.map((q: any) => ({
        time: q.date.slice(0, 10),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
      }))
    );

    // Volume
    volume.setData(
      data.quotes.map((q: any) => ({
        time: q.date.slice(0, 10),
        value: q.volume,
        color: q.close >= q.open ? '#26a69a' : '#ef5350',
      }))
    );

    // RSI
 
    rsi.setData(data.indicators.rsi);

    // MACD
    macdLine.setData(data.indicators.macd.map((m: any) => ({ time: m.time, value: m.macd })));
    signalLine.setData(data.indicators.macd.map((m: any) => ({ time: m.time, value: m.signal })));
    macdHist.setData(data.indicators.macd.map((m: any) => ({ time: m.time, value: m.hist })));

    chartRef?.current?.timeScale().fitContent();

  }, [data]);



socket.emit("subscribe", {
  symbol: symbol
});

socket.on("realtime_bar", bar => {
  candleSeriesRef?.current?.update({
    time: bar.time,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  });

  volumeSeriesRef?.current?.update({
    time: bar.time,
    value: bar.volume,
    color: bar.close >= bar.open ? 'green' : 'red'
  });

  chartRef?.current?.timeScale().scrollToRealTime();

});




  if (loading) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}><h2>Loading chart…</h2></div>;
  if (notFound) return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#fafafa', color: '#666', textAlign: 'center' }}>
      <h2>📉 Symbol not found</h2>
      <p><b>{symbol}</b> has no available market data.</p>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '80vh' }}>
      <div style={{ position: 'absolute', top: 8, left: 10, zIndex: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 6, padding: '6px 10px', display: 'flex', gap: 12, fontSize: 20, fontWeight: 600 }}>
        <div ref={legendSymbolRef} />
        <div ref={legendPriceRef} />
      </div>

      <div ref={tooltipRef} style={{ position: 'absolute', display: 'none', background: 'rgba(255,255,255,0.95)', borderRadius: 6, padding: 10, fontSize: 14, pointerEvents: 'none', zIndex: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />

      <div ref={containerRef} style={{ height: '400px' }} />
    </div>
  );
}
