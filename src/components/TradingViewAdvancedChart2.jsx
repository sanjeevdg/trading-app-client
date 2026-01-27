import React, { useEffect, useRef } from "react";

export default function TradingViewAdvancedChart2() {
  const tvWidget = useRef(null);

  useEffect(() => {
    const widget = new window.TradingView.widget({
      symbol: "TQQQ",
      interval: "D",
      container_id: "tv_chart",
      library_path: "/charting_library/",
      locale: "en",
      theme: "dark",
      autosize: true,
      drawings_access: { type: "black", tools: [{ name: "Trend Line" }] },
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
    });

    tvWidget.current = widget;

    widget.onChartReady(async () => {
      const res = await fetch(
        "http://10.238.120.120:5000/api/patterns?symbol=TQQQ"
      );
      const data = await res.json();

      const chart = widget.activeChart();

      data.patterns.forEach(p => {
        if (p.type === "bull_flag") {
          chart.createMultipointShape(
            [
              { time: p.start.time, price: p.start.price },
              { time: p.end.time, price: p.end.price }
            ],
            {
              shape: "trend_line",
              lock: true,
              disableSelection: true,
              overrides: {
                linecolor: "rgba(0, 200, 0, 0.9)",
                linewidth: 2
              }
            }
          );
        }
      });
    });

    return () => widget.remove();
  }, []);

  return <div id="tv_chart" style={{ height: "100vh" }} />;
}
