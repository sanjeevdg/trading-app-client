import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import "../styles/Dashboard.css";

const API = "https://candlestick-screener.onrender.com/api";
//http://10.39.27.120:8000/api
//https://candlestick-screener.onrender.com/api
// for local dev:
// const API = "http://localhost:4000/api";

export default function AlpacaDashboard() {
  const [assets, setAssets] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const [a, p, o, acc] = await Promise.all([
        axios.get(`${API}/assets`),
        axios.get(`${API}/positions`),
        axios.get(`${API}/orders`),
        axios.get(`${API}/account`)
      ]);

      setAssets(a.data);
      setPositions(p.data);
      setOrders(o.data);
      setAccount(acc.data);
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const placeOrder = async (symbol, side) => {
    await axios.post(`${API}/order`, { symbol, qty: 1, side });
    loadAll();
  };

  if (loading) return <p>Loading dashboard…</p>;

  return (
    <div className="container">
      <h2>📊 Alpaca Trading Dashboard</h2>

      <AccountTable account={account} />
      <PositionsTable positions={positions} reload={loadAll} />
      <OrdersTable orders={orders} />
    </div>
  );
}

/* =========================
   ACCOUNT
========================= */
function AccountTable({ account }) {
  if (!account) return null;

  return (
    <>
      <h4>Account</h4>
      <table className="table">
        <tbody>
          <tr><th>Status</th><td>{account.status}</td></tr>
          <tr><th>Cash</th><td>${account.cash}</td></tr>
          <tr><th>Equity</th><td>${account.equity}</td></tr>
          <tr><th>Buying Power</th><td>${account.buying_power}</td></tr>
          <tr><th>Portfolio Value</th><td>${account.portfolio_value}</td></tr>
        </tbody>
      </table>
    </>
  );
}

/* =========================
   POSITIONS
========================= */
function PositionsTable({ positions, reload }) {
  const [popup, setPopup] = useState(null);

  const closePosition = async (symbol) => {
    try {
      const res = await axios.delete(`${API}/positions/${symbol}`);
      setPopup({ type: "success", msg: res.data.message });
      reload();
    } catch (err) {
      setPopup({
        type: "error",
        msg: err.response?.data?.error || "Failed to close position"
      });
    }
  };

  return (
    <>
      <h4>Positions</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Avg</th>
            <th>Price</th>
            <th>P/L</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 && (
            <tr><td colSpan="6">No open positions</td></tr>
          )}

          {positions.map(p => {
            const qty = Number(p.qty);
            const avg = Number(p.avg_entry_price);
            const price = Number(p.current_price);
            const pl = (price - avg) * qty;

            return (
              <tr key={p.symbol}>
                <td><b>{p.symbol}</b></td>
                <td>{qty}</td>
                <td>{avg.toFixed(2)}</td>
                <td>{price.toFixed(2)}</td>
                <td style={{ color: pl >= 0 ? "green" : "red" }}>
                  {pl.toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => closePosition(p.symbol)}
                  >
                    Close
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal show={!!popup} onHide={() => setPopup(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {popup?.type === "success" ? "Success" : "Error"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={`alert alert-${popup?.type}`}>
            {popup?.msg}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setPopup(null)}>OK</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

/* =========================
   ORDERS
========================= */
function OrdersTable({ orders }) {
  return (
    <>
      <h4>Orders</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Side</th>
            <th>Qty</th>
            <th>Type</th>
            <th>Status</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr><td colSpan="6">No orders</td></tr>
          )}

          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.symbol}</td>
              <td className={o.side === "buy" ? "up" : "down"}>
                {o.side.toUpperCase()}
              </td>
              <td>{o.qty}</td>
              <td>{o.type}</td>
              <td>{o.status}</td>
              <td>{new Date(o.submitted_at).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
