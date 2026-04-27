import { useEffect, useState } from "react";
import axios from "axios";


const API_BASE = import.meta.env.VITE_API_URL;

export default function TQQQPatterns() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgUrl, setImgUrl] = useState(null);
///api/tqqq/patterns

useEffect(() => {
  async function loadImg() {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(
        `${API_BASE}/api/tqqq/patterns?t=${Date.now()}`,
        { responseType: "blob" }
      );

      const imageUrl = URL.createObjectURL(res.data);
      setImgUrl(imageUrl);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  loadImg();
}, []);


  // const imgUrl =    ;
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
