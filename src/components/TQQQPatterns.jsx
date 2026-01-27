import { useEffect, useState } from "react";

export default function TQQQPatterns() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
///api/tqqq/patterns
  const imgUrl =
    "https://candlestick-screener.onrender.com/api/tqqq/patterns?t=" + Date.now();
//http://localhost:5000/api/tqqq/patterns?ts=${Date.now()}
  return (
    <div style={{ width: 900 }}>
      <h3>TQQQ Pattern Map (Server Rendered)</h3>

      {loading && <div>Loading chart…</div>}
      {error && <div style={{ color: "red" }}>Failed to load chart</div>}

      <img
        src={imgUrl}
        alt="TQQQ pattern chart"
        style={{ width: "100%", border: "1px solid #ccc" }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
