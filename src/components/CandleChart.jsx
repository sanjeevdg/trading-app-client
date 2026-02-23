//import { createChart, CrosshairMode, ColorType } from 'lightweight-charts';
import axios from 'axios';
import { useEffect, useRef } from 'react';
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

export default function CandleChart({ symbol = "SPY", tf = "5Min" }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

const smaRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#fafafa' },
        textColor: '#222',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(0,0,0,0.05)' },
        horzLines: { color: 'rgba(0,0,0,0.05)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderVisible: false,
    });

const smaSeries = chart.addSeries(LineSeries, {
  color: '#2962ff',
  lineWidth: 2,
});

    chartRef.current = chart;
    seriesRef.current = candles;
    const sma = chart.addSeries(LineSeries, {
    color: '#2962ff',
    lineWidth: 2,
  });

  chartRef.current = chart;
  seriesRef.current = candles;
  smaRef.current = sma;

  }, []);





  useEffect(() => {
  axios
    .get("http://127.0.0.1:8000/api/bars", {
      params: { symbols: symbol, tf }
    })
    .then(res => {
      const payload = res.data.data[symbol];
      if (!payload) return;

      const tv = payload.candles;

      const candleBars = tv.t.map((t, i) => ({
        time: t,
        open: tv.o[i],
        high: tv.h[i],
        low: tv.l[i],
        close: tv.c[i],
      }));

      seriesRef.current.setData(candleBars);
      smaRef.current.setData(payload.sma20);
    })
    .catch(console.error);
}, [symbol, tf]);



  return <div ref={containerRef} style={{ height: 500 }} />;
}
