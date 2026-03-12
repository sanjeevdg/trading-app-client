import { useWatchlist } from "../context/WatchlistContext";
import { Shredder } from "lucide-react";



export default function WatchlistPage() {
  const { watchlist, removeSymbol } = useWatchlist();

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Watchlist</h2>

      {watchlist.length === 0 && <p>No symbols in watchlist</p>}

      {watchlist.map((symbol) => (
        <div
          key={symbol}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px",
            borderBottom: "1px solid #eee"
          }}
        >
          <span>{symbol}</span>

          <button
            onClick={() => removeSymbol(symbol)}
            style={{
          padding: "4px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          cursor: "pointer",
          }}
>
<Shredder size={14} color="red" />
</button>

        </div>
      ))}
    </div>
  );
}