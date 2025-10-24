import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

export default function CandlestickChart({ candles }: { candles: any[] }) {
  return (
    <div style={{ height: "400px" }}>
      <AdvancedRealTimeChart
        symbol="NASDAQ:AAPL"
        theme="light"
        autosize
        hide_top_toolbar={false}
      />
    </div>
  );
}
