import { useWatchlist } from "../context/WatchlistContext";
import { Shredder,Plus } from "lucide-react";


export default function WatchlistButton({ symbol }) {
  const { watchlist, addSymbol, removeSymbol } = useWatchlist();

  const isSaved = watchlist.includes(symbol);

  const toggle = () => {
    if (isSaved) removeSymbol(symbol);
    else addSymbol(symbol);
  };

  return (
    <button
          onClick={toggle}
    style={{
    padding: "4px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    cursor: "pointer",
  }}
>
{isSaved ? <Shredder size={14} color="red" /> : <Plus size={14} color="green" />}  
</button>

  );
}