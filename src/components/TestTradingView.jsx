import TradingViewAdvancedChart from "./TradingViewAdvancedChart.jsx";

function TestTradingView() {
  return (
    <div style={{ height: "100vh" }}>
      <TradingViewAdvancedChart
        symbol="NASDAQ:MSFT"
        interval="5"
        theme="dark"
      />
    </div>
  );
}

export default TestTradingView;