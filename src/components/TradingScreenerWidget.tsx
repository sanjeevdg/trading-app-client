import React, { useState } from "react";
import { Screener, ColorTheme, Locales } from "react-ts-tradingview-widgets";

interface TradingScreenerWidgetProps {
  width?: string | number;
  height?: string | number;
  colorTheme?: ColorTheme;
  locale?: Locales;
}

/**
 * A TradingView Screener component with tab switching
 * between multiple market views (Top Gainers, Top Losers, Most Actives)
 */
const TradingScreenerWidget: React.FC<TradingScreenerWidgetProps> = ({
  width = "100%",
  height = 600,
  colorTheme = "dark",
  locale = "en",
}) => {
  const [activeScreen, setActiveScreen] = useState<
    | "top_gainers"
    | "top_losers"
    | "general"
    | "ath"
    | "atl"
    | "above_52wk_high"
    | "below_52wk_low"
    | "monthly_high"
    | "monthly_low"
    | "most_volatile"
    | "overbought"
    | "oversold"
    | "gap_up"
    | "gap_down"
    | string
  >("top_gainers");

  const handleScreenChange = (screen: string) => setActiveScreen(screen);

  const tabs = [
    { label: "Top Gainers", value: "top_gainers" },
    { label: "Top Losers", value: "top_losers" },
    { label: "Most Actives", value: "most_actives" }, // custom label (not in TS)
  ];

  return (
    <div
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
        backgroundColor: colorTheme === "dark" ? "#111" : "#f8f9fa",
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          borderBottom:
            colorTheme === "dark"
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleScreenChange(tab.value)}
            style={{
              flex: 1,
              padding: "12px 0",
              cursor: "pointer",
              background:
                activeScreen === tab.value
                  ? colorTheme === "dark"
                    ? "#1e293b"
                    : "#e2e8f0"
                  : "transparent",
              color:
                activeScreen === tab.value
                  ? colorTheme === "dark"
                    ? "#fff"
                    : "#111"
                  : colorTheme === "dark"
                  ? "#ccc"
                  : "#333",
              fontWeight: 600,
              border: "none",
              outline: "none",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Screener */}
      <div
        style={{
          width: "100%",
          height: typeof height === "number" ? `${height}px` : height,
        }}
      >
        <Screener
          width="100%"
          height="100%"
          defaultScreen={activeScreen as any} // casting fixes non-listed values like "most_actives"
          colorTheme={colorTheme}
          locale={locale}
        />
      </div>
    </div>
  );
};

export default TradingScreenerWidget;
