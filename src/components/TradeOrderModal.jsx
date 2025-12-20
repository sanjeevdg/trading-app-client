import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

// Usage:
// <TradeOrderModal
//   show={show}
//   onClose={() => setShow(false)}
//   symbol="AAPL"
//   side="buy"
//   onSubmit={(order) => fetch('/api/place-order', { method:'POST', body: JSON.stringify(order) })}
// />

export default function TradeOrderModal({ show, onClose, symbol, side = "buy", onSubmit }) {
  const [qty, setQty] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  

  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [stopPrice, setStopPrice] = useState("");

  const [takeProfitPrice,setTakeProfitPrice] = useState("");

  const [errorMessage, setErrorMessage] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async () => {
  const orderPayload = {
    symbol,
    side,
    qty: Number(qty),
    type: orderType,
    ...(orderType === "limit" && { limit_price: Number(limitPrice) }),
    ...(useStopLoss || useTakeProfit
      ? {
          order_class: "bracket",
          ...(useStopLoss && {
            stop_loss: { stop_price: Number(stopPrice) },
          }),
          ...(useTakeProfit && {
            take_profit: { limit_price: Number(takeProfitPrice) },
          }),
        }
      : {}),
  };

  try {
    await placeOrder(orderPayload);
    onSubmit?.(orderPayload);
    onClose(); // ✅ close only on success
  } catch (err) {
    setErrorMessage(err.message); // ✅ stay open
  }
};


const placeOrder = async (payload) => {
  try {
    setIsSubmitting(true);
    setErrorMessage("");
//192.168.150.105:4000
    const res = await axios.post(
      "https://trading-app-server-35kc.onrender.com/api/order",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data; // success
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Order failed";
    throw new Error(msg);
  } finally {
    setIsSubmitting(false);
  }
};




  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{side.toUpperCase()} {symbol}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Order Type</Form.Label>
            <Form.Select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="market">Market</option>
              <option value="limit">Limit</option>
            </Form.Select>
          </Form.Group>

          {orderType === "limit" && (
            <Form.Group className="mb-3">
              <Form.Label>Limit Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </Form.Group>
          )}

          <Form.Check
            type="switch"
            className="mb-3"
            label="Add Stop Loss"
            checked={useStopLoss}
            onChange={(e) => setUseStopLoss(e.target.checked)}
          />

          {useStopLoss && (
            <Form.Group className="mb-3">
              <Form.Label>Stop Loss Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
              />
            </Form.Group>
          )}

          <Form.Check
            type="switch"
            className="mb-3"
            label="Add Take Profit"
            checked={useTakeProfit}
            onChange={(e) => setUseTakeProfit(e.target.checked)}
          />

          {useTakeProfit && (
            <Form.Group className="mb-3">
              <Form.Label>Take Profit Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
              />
            </Form.Group>
          )}
{errorMessage && (
  <div className="alert alert-danger py-2">
    {errorMessage}
  </div>
)}
        </Form>

      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
       <Button
  variant={side === "buy" ? "success" : "danger"}
  onClick={handleSubmit}
  disabled={isSubmitting}
>
  {isSubmitting ? "Placing..." : "Place Order"}
</Button>
      </Modal.Footer>
    </Modal>
  );
}
