import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useLivePrices(setPrices, positions) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:4000");

    socketRef.current.on("price:update", ({ symbol, price }) => {
      setPrices(prev => ({
        ...prev,
        [symbol]: price,
      }));
    });

    return () => socketRef.current.disconnect();
  }, [setPrices]);

  // Subscribe to symbols
  useEffect(() => {
    if (!socketRef.current) return;

    const symbols = positions.map(p => p.symbol);
    socketRef.current.emit("symbols:subscribe", symbols);
  }, [positions]);
}
