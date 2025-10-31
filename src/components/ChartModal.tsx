import React from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

interface Props {
  symbol: string;
  onClose: () => void;
  }

const ChartModal: React.FC<Props> = ({ symbol, onClose  }) => {




  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 10,
          width: "90%",
          height: "80%",
        }}
      >
       
        <AdvancedRealTimeChart
          theme="light"
          symbol={symbol}
          autosize
          studies={["RSI@tv-basicstudies", "MACD@tv-basicstudies"]}
          interval="D"
        />

      </div>
    </div>
  );
};

export default ChartModal;

