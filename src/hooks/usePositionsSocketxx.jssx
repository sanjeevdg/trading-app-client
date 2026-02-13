import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function usePositionsSocket(setPositions) {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to backend Socket.IO
    //localhost:4000
    socketRef.current = io("https://trading-app-server-35kc.onrender.com", {
      transports: ["websocket"],
    });

    // Receive full refreshed positions list
    socketRef.current.on("positions:update", (positions) => {
      // Defensive sanitization (Alpaca sometimes sends strings)
      const clean = positions.map(p => ({
        ...p,
        qty: Number(p.qty),
        avg_entry_price: Number(p.avg_entry_price),
        current_price: Number(p.current_price),
        unrealized_pl: Number(p.unrealized_pl),
      }));

      setPositions(clean);
    });

    socketRef.current.on("connect", () => {
      console.log("🟢 Positions socket connected");
    });

    socketRef.current.on("disconnect", () => {
      console.log("🔴 Positions socket disconnected");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [setPositions]);
}
