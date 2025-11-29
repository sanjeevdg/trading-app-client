import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function LightweightMultiPaneChart({ symbol }) {
  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!symbol) return;

    async function fetchData() {
      const response = await fetch(`http://localhost:4000/api/fchart?symbol=${symbol}`);
      const data = await response.json();

      const { formattedQuotes, indicators } = data;
      const { rsi, macd } = indicators;

      // Convert data to chart format
      const candleData = formattedQuotes.map(q => ({
        time: q.date,
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
      }));

      const volumeData = formattedQuotes.map(q => ({
        time: q.date,
        value: q.volume,
      }));

   
      const rsiData = rsi.map((val, i) => ({
        time: formattedQuotes[i + (formattedQuotes.length - rsi.length)]?.date,
        value: typeof val === "number" ? val : val.value, // make sure it's a number
      }));
      const macdHistData = macd.map((v, i) => ({
        time: formattedQuotes[i].date,
        value: v.hist,
      }));

      const macdSignalData = macd.map((v, i) => ({
        time: formattedQuotes[i].date,
        value: v.signal,
      }));

      // ------------------ CHART SETUP ------------------
      if (!chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 700,
        layout: { background: { color: "#ffffff" }, textColor: "#000" },
        crosshair: { mode: 1 },
      });

      // ---------- 1. CANDLE PANE ----------
      const candleSeries = chart.addCandlestickSeries({
        priceScaleId: "main",
      });
      candleSeries.setData(candleData);

      chart.priceScale("main").applyOptions({ scaleMargins: { top: 0.02, bottom: 0.55 } });

      const rsiSeries = chart.addLineSeries({ priceScaleId: "rsi", color: "purple", lineWidth: 2 });
      // ---------- 2. RSI PANE ----------
      chart.priceScale("rsi").applyOptions({ scaleMargins: { top: 0.02, bottom: 0.25 } });
      
      rsiSeries.setData(rsiData);

      // ---------- 3. MACD PANE ----------
      const macdHistSeries = chart.addHistogramSeries({ priceScaleId: "macd", lineWidth: 2 });
      chart.priceScale("macd").applyOptions({ scaleMargins: { top: 0.5, bottom: 0.02 } });
      
      macdHistSeries.setData(macdHistData);

      const macdSignalSeries = chart.addLineSeries({ priceScaleId: "macd", color: "red", lineWidth: 2 });
      macdSignalSeries.setData(macdSignalData);

      // ---------- 4. VOLUME PANE ----------
      const volumeSeries = chart.addHistogramSeries({
        priceScaleId: "volume",
      });
      volumeSeries.setData(volumeData);
    }

    fetchData();
  }, [symbol]);

  return (
    <div
      ref={chartContainerRef}
      style={{ width: "100%", height: "700px", border: "1px solid gray" }}
    />
  );
}
/*
import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";

// Lightweight multi-pane chart component
// Usage: <LightweightMultiPaneChart symbol="AAPL" range="6mo" />
// Note: This fetches data from Yahoo Finance's public chart API (no API key).

export default function LightweightMultiPaneChart({ symbol = "AAPL", range = "6mo" }) {
  const containerRef = useRef(null);
  const candleRef = useRef(null);
  const rsiRef = useRef(null);
  const macdRef = useRef(null);
  const volRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let charts = [];

    async function fetchYahoo(symbol, range) {
      const res = await fetch(`http://localhost:4000/api/fchart?symbol=${symbol}&range=${range}`);
      const myres = await res.json();
      console.log('myres===',myres);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return myres;
    }

    function toCandleSeries(data) {
      // data: timestamps, indicators.quote[0] with open,high,low,close, volume
      const timestamps = data.timestamp || [];
      const quote = (data.indicators && data.indicators.quote && data.indicators.quote[0]) || {};
      const opens = quote.open || [];
      const highs = quote.high || [];
      const lows = quote.low || [];
      const closes = quote.close || [];
      const volumes = quote.volume || [];

      const candles = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (opens[i] == null || highs[i] == null || lows[i] == null || closes[i] == null) continue;
        const t = timestamps[i] * 1000; // ms
        candles.push({ time: Math.floor(t / 1000), open: opens[i], high: highs[i], low: lows[i], close: closes[i], volume: volumes[i] });
      }
      return candles;
    }

    function computeRSI(values, period = 14) {
      const rsi = new Array(values.length).fill(null);
      let gains = 0;
      let losses = 0;
      for (let i = 1; i <= period; i++) {
        const change = values[i] - values[i - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }
      let avgGain = gains / period;
      let avgLoss = losses / period;
      rsi[period] = 100 - 100 / (1 + avgGain / (avgLoss === 0 ? 1e-8 : avgLoss));

      for (let i = period + 1; i < values.length; i++) {
        const change = values[i] - values[i - 1];
        const gain = Math.max(change, 0);
        const loss = Math.max(-change, 0);
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        rsi[i] = 100 - 100 / (1 + avgGain / (avgLoss === 0 ? 1e-8 : avgLoss));
      }
      return rsi;
    }

    function ema(values, period) {
      const k = 2 / (period + 1);
      const out = new Array(values.length).fill(null);
      // seed with SMA
      let sum = 0;
      let start = period - 1;
      for (let i = 0; i <= start; i++) sum += values[i];
      let prev = sum / period;
      out[start] = prev;
      for (let i = start + 1; i < values.length; i++) {
        prev = values[i] * k + prev * (1 - k);
        out[i] = prev;
      }
      return out;
    }
function parseCandles(result) {
  return result.quotes.map(q => ({
    time: Math.floor(new Date(q.date).getTime() / 1000),
    open: q.open,
    high: q.high,
    low: q.low,
    close: q.close,
    volume: q.volume,
  }));
}
    function computeMACD(values, fast = 12, slow = 26, signal = 9) {
      const emaFast = ema(values, fast);
      const emaSlow = ema(values, slow);
      const macdLine = values.map((_, i) => {
        if (emaFast[i] == null || emaSlow[i] == null) return null;
        return emaFast[i] - emaSlow[i];
      });
      const signalLine = ema(macdLine.map(v => (v == null ? 0 : v)), signal);
      const hist = macdLine.map((v, i) => (v == null || signalLine[i] == null ? null : v - signalLine[i]));
      return { macdLine, signalLine, hist };
    }

    function syncTimeScales(charts) {
      // when any chart's visible range changes, propagate to others
      const subs = charts.map((c, idx) => {
        return c.timeScale().subscribeVisibleTimeRangeChange((range) => {
          if (!range) return;
          charts.forEach((other, j) => {
            if (j === idx) return;
            try {
              other.timeScale().setVisibleRange(range);
            } catch (e) {
              // ignore
            }
          });
        });
      });
      return () => subs.forEach(unsub => unsub && typeof unsub === 'function' && unsub());
    }

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchYahoo(symbol, range);
        if (cancelled) return;
    //    const res = json.chart && json.chart.result && json.chart.result[0];
        if (!res) throw new Error("no data returned");
        const candles = parseCandles(res);
        if (candles.length === 0) throw new Error("no candle data");

        // Prepare data arrays
        const closeValues = candles.map(c => c.close);
        const volumes = candles.map(c => ({ time: c.time, value: c.volume, color: c.close >= c.open ? undefined : undefined }));

        // RSI
        const rsiArr = computeRSI(closeValues, 14);
        const rsiSeries = candles.map((c, i) => ({ time: c.time, value: rsiArr[i] }));

        // MACD
        const macd = computeMACD(closeValues, 12, 26, 9);
        const macdLine = candles.map((c, i) => ({ time: c.time, value: macd.macdLine[i] }));
        const macdSignal = candles.map((c, i) => ({ time: c.time, value: macd.signalLine[i] }));
        const macdHist = candles.map((c, i) => ({ time: c.time, value: macd.hist[i] }));

        // Create DOM containers
        const root = containerRef.current;
        root.innerHTML = "";

        const topDiv = document.createElement("div");
        topDiv.style.height = "380px";
        topDiv.style.marginBottom = "8px";
        root.appendChild(topDiv);

        const indDiv = document.createElement("div");
        indDiv.style.height = "120px";
        indDiv.style.marginBottom = "8px";
        root.appendChild(indDiv);

        const macdDiv = document.createElement("div");
        macdDiv.style.height = "140px";
        macdDiv.style.marginBottom = "8px";
        root.appendChild(macdDiv);

        const volDiv = document.createElement("div");
        volDiv.style.height = "100px";
        root.appendChild(volDiv);

        // Create charts
        const candleChart = createChart(topDiv, {
          layout: { backgroundColor: "#ffffff", textColor: "#333" },
          width: topDiv.clientWidth,
          height: topDiv.clientHeight,
          crosshair: { mode: CrosshairMode.Normal },
          rightPriceScale: { visible: true, scaleMargins: { top: 0.15, bottom: 0.20 } },
        });
        const candleSeries = candleChart.addCandlestickSeries();
        candleSeries.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));

        const rsiChart = createChart(indDiv, {
          layout: { backgroundColor: "#ffffff", textColor: "#333" },
          width: indDiv.clientWidth,
          height: indDiv.clientHeight,
          rightPriceScale: { visible: false },
          leftPriceScale: { visible: true, scaleMargins: { top: 0.1, bottom: 0.1 } }
        });
        const rsiLine = rsiChart.addLineSeries({ priceLineVisible: false });
        rsiLine.setData(rsiSeries.filter(d => d.value != null));

        const macdChart = createChart(macdDiv, {
          layout: { backgroundColor: "#ffffff", textColor: "#333" },
          width: macdDiv.clientWidth,
          height: macdDiv.clientHeight,
          rightPriceScale: { visible: false }
        });
        const macdLineSeries = macdChart.addLineSeries({ priceLineVisible: false });
        const macdSignalSeries = macdChart.addLineSeries({ priceLineVisible: false });
        const macdHistSeries = macdChart.addHistogramSeries({ priceFormat: { type: 'volume' } });
        macdLineSeries.setData(macdLine.filter(d => d.value != null));
        macdSignalSeries.setData(macdSignal.filter(d => d.value != null));
        macdHistSeries.setData(macdHist.filter(d => d.value != null));

        const volChart = createChart(volDiv, {
          layout: { backgroundColor: "#ffffff", textColor: "#333" },
          width: volDiv.clientWidth,
          height: volDiv.clientHeight,
          rightPriceScale: { visible: false }
        });
        const volSeries = volChart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '' });
        volSeries.setData(volumes.map(v => ({ time: v.time, value: v.value })));

        charts = [candleChart, rsiChart, macdChart, volChart];

        // sync time ranges
        const unsubscribeSync = syncTimeScales(charts);

        // crosshair sync
        const crossSubs = charts.map((c, idx) => c.subscribeCrosshairMove((param) => {
          charts.forEach((other, j) => {
            if (j === idx) return;
            try { other.setCrosshair(param); } catch (e) {}
          });
        }));

        // resize handling
        const onResize = () => {
          charts.forEach((c, i) => {
            const parent = [topDiv, indDiv, macdDiv, volDiv][i];
            c.resize(parent.clientWidth, parent.clientHeight);
          });
        };
        window.addEventListener('resize', onResize);

        // store refs for cleanup
        candleRef.current = candleChart;
        rsiRef.current = rsiChart;
        macdRef.current = macdChart;
        volRef.current = volChart;

        setLoading(false);

        // cleanup function for this init
        return () => {
          unsubscribeSync && unsubscribeSync();
          crossSubs.forEach(un => un && typeof un === 'function' && un());
          window.removeEventListener('resize', onResize);
          charts.forEach(c => c && c.remove());
        };
      } catch (err) {
        if (cancelled) return;
        setError(err.message || String(err));
        setLoading(false);
      }
    }

    let cleanupPromise = null;
    init().then(cleaner => {
      cleanupPromise = cleaner;
    });

    return () => {
      cancelled = true;
      if (cleanupPromise && typeof cleanupPromise === 'function') cleanupPromise();
      // additional cleanup
      [candleRef.current, rsiRef.current, macdRef.current, volRef.current].forEach(c => { try { c && c.remove(); } catch (e) {} });
    };
  }, [symbol, range]);

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-lg font-semibold">{symbol.toUpperCase()}</div>
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
      <div ref={containerRef} className="w-full" />
      <div className="mt-2 text-xs text-gray-500">Data source: Yahoo Finance (unofficial)</div>
    </div>
  );
}
*/