// MultiPaneChart.js
import React, { useRef, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const defaultHtml = require('./chart.html'); // if bundling the file with app (Android assets / iOS resource). See note below.

export default function MultiPaneChart({ backendUrl, symbol = 'AAPL', style }) {
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);

const htmStr = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0" />
  <title>Lightweight Charts - Multi Pane</title>
  <style>
    html,body,#container{height:100%;margin:0;padding:0;background:#fff;}
    #container{display:flex;flex-direction:column;height:100vh;}
    #chart{flex:1; position:relative;}
    /* small legend area */
    .legend { position:absolute; top:8px; left:8px; background: rgba(255,255,255,0.9);
             padding:6px 8px; border-radius:6px; font-family: Arial, sans-serif; font-size:12px; z-index:10;}
  </style>
</head>
<body>
  <div id="chart">
    <div class="legend" id="legend">Loading...</div>
    <div id="containerDiv" style="width:100%; height:100%;"></div>
  </div>

  <!-- lightweight-charts v5 standalone -->
  <script src="https://unpkg.com/lightweight-charts@5.0.1/dist/lightweight-charts.standalone.production.js"></script>

  <script>
    (function () {
      const { createChart, CandlestickSeries, HistogramSeries, LineSeries } = window.LightweightCharts;

      const chartOptions = {
        layout: {
          textColor: '#222',
          background: { type: 'solid', color: '#ffffff' },
          panes: {
            separatorColor: '#e6e6e6',
            separatorHoverColor: '#cfcfcf',
            enableResize: true
          }
        },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false, timeVisible: true },
        crosshair: { horzLine: { visible: true }, vertLine: { visible: true } },
      };

      const chart = createChart(document.getElementById('containerDiv'), chartOptions);

      // Series placeholders
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#4caf50', downColor: '#f44336', borderVisible: false, wickUpColor: '#4caf50', wickDownColor: '#f44336'
      }, 0);

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: { top: 0.85, bottom: 0 },
      }, 1);

      // macd: histogram (hist) on same pane + lines for macd & signal
      const macdHist = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: { top: 0.3, bottom: 0.7 }
      }, 2);
      const macdLine = chart.addSeries(LineSeries, { lineWidth: 1 }, 2);
      const macdSignal = chart.addSeries(LineSeries, { lineWidth: 1, lineStyle: 2 }, 2);

      // rsi
      const rsiLine = chart.addSeries(LineSeries, { lineWidth: 1 }, 3);

      // small legend update
      const legendEl = document.getElementById('legend');

      // helpers to convert date/time -> lightweight-charts time format (YYYY-MM-DD)
      function isoToDateStr(iso) {
        if (!iso) return iso;
        // prefer YYYY-MM-DD if daily
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return iso;
        // get YYYY-MM-DD in user's timezone-agnostic manner
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }

      // main updater: accepts the JSON you posted (meta, quotes[], indicators, ai)
      function updateFromBackend(json) {
        if (typeof json === 'string') {
          try { json = JSON.parse(json); } catch (e) { console.error('Invalid JSON', e); return; }
        }

        const meta = json.meta || {};
        const quotes = json.quotes || [];
        const indicators = json.indicators || {};
        const macdArr = indicators.macd || [];
        const rsiArr = indicators.rsi || [];

        // Prepare candle data
        const candleData = quotes.map(q => ({
          time: isoToDateStr(q.date),
          open: Number(q.open),
          high: Number(q.high),
          low: Number(q.low),
          close: Number(q.close)
        })).filter(d => d.time != null);

        // Volume data: color by candle up/down
        const volumeData = quotes.map(q => {
          const time = isoToDateStr(q.date);
          const open = Number(q.open), close = Number(q.close);
          const value = Number(q.volume) || 0;
          return {
            time,
            value,
            color: (close >= open) ? 'rgba(76,175,80,0.7)' : 'rgba(244,67,54,0.7)'
          };
        }).filter(d => d.time != null);

        // MACD data: hist, macd, signal arrays in indicators.macd
        // indicators.macd is expected as [{time: "YYYY-MM-DD", hist:..., signal:..., macd:...}, ...]
        const macdHistData = macdArr.map(m => ({ time: m.time, value: m.hist }));
        const macdLineData = macdArr.map(m => ({ time: m.time, value: m.macd }));
        const macdSignalData = macdArr.map(m => ({ time: m.time, value: m.signal }));

        // RSI data: indicators.rsi is expected as [{time:"YYYY-MM-DD", value: ...}, ...]
        const rsiData = rsiArr.map(r => ({ time: r.time, value: r.value }));

        // set data (series on separate panes)
        candleSeries.setData(candleData);
        volumeSeries.setData(volumeData);
        macdHist.setData(macdHistData);
        macdLine.setData(macdLineData);
        macdSignal.setData(macdSignalData);
        rsiLine.setData(rsiData);

        // set pane sizes (optional: adjust)
        try {
          const panes = chart.panes();
          if (panes.length >= 4) {
            // give candle the largest space
            panes[0].setHeight(Math.floor(window.innerHeight * 0.55));
            panes[1].setHeight(Math.floor(window.innerHeight * 0.12));
            panes[2].setHeight(Math.floor(window.innerHeight * 0.16));
            panes[3].setHeight(Math.floor(window.innerHeight * 0.16));
          }
        } catch (e) { /* ignore in older builds */ }

        // update legend
        legendEl.textContent = ` + ${meta.shortName || meta.symbol || ''} + ` • Price:`+ ${meta.regularMarketPrice ?? ''} ${meta.currency ?? ''} +`;
      }

      // Receive messages from React Native WebView
      function handleMessage(ev) {
        // ev may be MessageEvent or a plain object with data in .data
        const payload = ev && ev.data ? ev.data : ev;
        if (!payload) return;
        // If RN sends a stringified JSON, parse it. Also handle wrapper objects.
        let parsed = payload;
        if (typeof payload === 'string') {
          try { parsed = JSON.parse(payload); } catch (e) { /* not json: ignore */ }
        } else if (payload && payload.nativeEvent && payload.nativeEvent.data) {
          try { parsed = JSON.parse(payload.nativeEvent.data); } catch(e) { parsed = payload.nativeEvent.data; }
        }
        // if object contains type: 'init' or type:'update'
        if (parsed && (parsed.type === 'init' || parsed.type === 'update') && parsed.payload) {
          updateFromBackend(parsed.payload);
        } else {
          // fallback: treat entire object as payload
          updateFromBackend(parsed);
        }
      }

      // Android (document)
      document.addEventListener('message', handleMessage, false);
      // iOS (window)
      window.addEventListener('message', handleMessage, false);

      // also expose a global function so RN can inject: window.receiveMessage(...)
      window.receiveMessage = handleMessage;

      // small initial sample text on load
      legendEl.textContent = 'Waiting for data from app...';

      // expose a convenience for debugging from the page console
      window._chart = chart;
    })();
  </script>
</body>
</html>
` 




  useEffect(() => {
    // fetch data from backend and post to webview
    async function fetchAndSend() {
      try {
        const url = backendUrl + (backendUrl.includes('?') ? '&' : '?') + 'symbol=' + encodeURIComponent(symbol);
        const resp = await fetch(url);
        const payload = await resp.json();

        const message = JSON.stringify({ type: 'init', payload });

        // react-native-webview exposes postMessage method on the ref
        if (webviewRef.current && typeof webviewRef.current.postMessage === 'function') {
          // small timeout to ensure webview ready (optional)
          setTimeout(() => {
            webviewRef.current.postMessage(message);
            setLoading(false);
          }, 250); // can be 0; 250ms helps ensure DOM ready
        }
      } catch (err) {
        console.warn('MultiPaneChart fetch error', err);
        setLoading(false);
      }
    }

    fetchAndSend();
  }, [backendUrl, symbol]);

  // If you prefer to embed the HTML string instead of bundling, you can use { html: `...` } in source
  // For local file bundling, set up as required by react-native-webview docs
  return (
    <View style={[styles.container, style]}>
      {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="small" />}
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        // If you bundled chart.html into the app's assets:
        source={Platform.OS === 'android' ? { uri: 'file:///android_asset/chart.html' } : defaultHtml}
        // If you want to use an inline HTML string instead:
        // source={{ html: YOUR_HTML_STRING }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="always"
        style={styles.webview}
        onMessage={(event) => {
          // messages from webview (if needed). Right now chart doesn't post messages back.
          // console.log('Message from chart:', event.nativeEvent.data);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
