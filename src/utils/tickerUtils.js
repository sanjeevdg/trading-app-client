// returns TSLA from NASDAQ:TSLA
export function getSymbol(ticker) {
  if (!ticker) return "";
  return ticker.split(":").pop();
}

// returns NASDAQ from NASDAQ:TSLA
export function getExchange(ticker) {
  if (!ticker) return "";
  return ticker.includes(":") ? ticker.split(":")[0] : "";
}

// returns normalized object
export function parseTicker(ticker) {
  if (!ticker) return { exchange: "", symbol: "" };

  const parts = ticker.split(":");

  if (parts.length === 2) {
    return {
      exchange: parts[0],
      symbol: parts[1],
    };
  }

  return {
    exchange: "",
    symbol: ticker,
  };
}
