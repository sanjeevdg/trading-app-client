import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Dashboard.css";


//import {usePositionsSocket} from '../hooks/usePositionsSocket';
//import {useLivePrices} from '../hooks/useLivePrices';
import { Modal, Button, Form } from "react-bootstrap";


//localhost:4000
const API = "https://trading-app-server-35kc.onrender.com/api";

export default function AlpacaDashboard() {
  const [assets, setAssets] = useState([]);
 // const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

const [positions, setPositions] = useState([]);

const [account,setAccount] = useState([]);


//usePositionsSocket(setPositions);


  const loadAll = async () => {
    const [a, p, o, b] = await Promise.all([
      axios.get(`${API}/assets`),
      axios.get(`${API}/positions`),
      axios.get(`${API}/orders`),
      axios.get(`${API}/account`)
    ]);
    setAssets(a.data);
    setPositions(p.data);
    setOrders(o.data);
    setAccount(b.data);
    
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const placeOrder = async (symbol, side) => {
    await axios.post(`${API}/order`, {
      symbol,
      qty: 1,
      side
    });
    loadAll();
  };

 
  if (loading) return <p>Loading dashboard…</p>;

  return (
    <div className="container">
      <h2>📊 Alpaca Trading Dashboard</h2>

   {/*   <AssetsTable assets={assets} onTrade={placeOrder} /> */}
      <AccountTable account={account} />
      <PositionsTable positions={positions} />
      <OrdersTable orders={orders} />
    </div>
  );
}

/* =========================
   ASSETS
========================= */
function AssetsTable({ assets, onTrade }) {
  return (
    <>
      <h4>Assets</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Exchange</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(a => (
            <tr key={a.symbol}>
              <td><b>{a.symbol}</b></td>
              <td>{a.name}</td>
              <td>{a.exchange}</td>
              <td>
                <button className="btn btn-buy" onClick={() => onTrade(a.symbol, "buy")}>
                  Buy
                </button>
                <button className="btn btn-sell" onClick={() => onTrade(a.symbol, "sell")}>
                  Sell
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function AccountTable({ account }) {
  return (
    <>
      <h4>My Account</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Status</th><td><b>{account.status}</b></td>
          </tr><tr>
            <th>Cash</th><td><b>{account.cash}</b></td>
            </tr><tr>
            <th>Equity</th><td>{account.equity}</td>
            </tr><tr>
            <th>Buying Power</th><td>{account.buying_power}</td>
            </tr><tr>
            <th>Portfolio Value</th><td>{account.portfolio_value}</td>
          </tr>
          
        </thead>
        <tbody>
          
            
              
              
              
              
            
          
        </tbody>
      </table>
    </>
  );
}

/* =========================
   POSITIONS
========================= */
function PositionsTable({ positions }) {

const [prices, setPrices] = useState({});

const [popupMsg, setPopupMsg] = useState("");
const [popupType, setPopupType] = useState(""); // "success" | "error"
const [showPopup, setShowPopup] = useState(false);


   // useLivePrices(setPrices, positions);

const closePosition = async (symbol) => {
  try {
    const res = await axios.delete(`${API}/positions/${symbol}`);

    setPopupMsg(res.data?.message || `Position ${symbol} closed successfully`);
    setPopupType("success");
    setShowPopup(true);

  //  loadAll();
  } catch (err) {
    setPopupMsg(
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to close position"
    );
    setPopupType("error");
    setShowPopup(true);
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
            <th>Avg Entry</th>
            <th>Price</th>
            <th>P/L</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 && (
            <tr><td colSpan="6" className="center">No positions</td></tr>
          )}

          {positions.map(p => {
  const livePrice = prices[p.symbol] ?? Number(p.current_price);
  const qty = Number(p.qty);
  const avg = Number(p.avg_entry_price);

  const pl = (livePrice - avg) * qty;

  return (
    <tr key={p.symbol}>
      <td><b>{p.symbol}</b></td>
      <td>{qty}</td>
      <td>{avg.toFixed(2)}</td>
      <td>{livePrice.toFixed(2)}</td>
      <td style={{color:pl >= 0 ? '#2e7d32':'#c62828' }}>
        {pl.toFixed(2)}
      </td>
      <td>
        <button
          className="btn btn-danger"
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
      <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>
      {popupType === "success" ? "Success" : "Error"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <div
      className={`alert ${
        popupType === "success" ? "alert-success" : "alert-danger"
      }`}
    >
      {popupMsg}
    </div>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowPopup(false)}>
      OK
    </Button>
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
            <tr><td colSpan="6" className="center">No orders</td></tr>
          )}

          {orders.map(o => (
            <tr key={o.id}>
              <td><b>{o.symbol}</b></td>
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
