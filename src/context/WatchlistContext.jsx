import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);

  // load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("watchlist");
    if (stored) setWatchlist(JSON.parse(stored));
  }, []);

  // save to localStorage
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const addSymbol = (symbol) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  };

    const addMultiple = (symbols) => {
    setWatchlist((prev) => {
      const merged = new Set([...prev, ...symbols]);
      return Array.from(merged);
    });
  };
  
    const clearWatchlist = () => {
    setWatchlist([]);
  };

  const removeSymbol = (symbol) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  return (
    <WatchlistContext.Provider
      value={{ 
            watchlist, 
            addSymbol, 
            addMultiple, 
            removeSymbol, 
            clearWatchlist 
          }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}