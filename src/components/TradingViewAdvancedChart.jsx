import { useEffect, useRef } from "react";

const TradingViewAdvancedChart = ({
  symbol = "NASDAQ:AAPL",
  interval = "15",
  theme = "dark",
  locale = "en",
  autosize = true,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget (important for React re-renders)
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      /* global TradingView */
      new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme,
        style: "1",
        locale,
        toolbar_bg: "#1e1e1e",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        studies_overrides: {},
        autosize,
      });
    };

    containerRef.current.appendChild(script);

    return () => {
      containerRef.current.innerHTML = "";
    };
  }, [symbol, interval, theme, locale, autosize]);

  return (
    <div
      id="tv_advanced_chart"
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default TradingViewAdvancedChart;
