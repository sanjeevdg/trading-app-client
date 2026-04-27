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

// convert anything to array
function toArray(input) {
  if (!input) return [];

  if (Array.isArray(input)) return input;

  return input
    .split(/[\s,]+/) // split by comma, space, newline
    .map(s => s.trim())
    .filter(Boolean);
}


// strip exchanges from many tickers
export function stripExchanges(input) {
  const arr = toArray(input);
  return arr.map(getSymbol);
}


// return only exchanges
export function extractExchanges(input) {
  const arr = toArray(input);
  return arr.map(getExchange);
}


// return parsed objects
export function parseTickers(input) {
  const arr = toArray(input);
  return arr.map(parseTicker);
}
