import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";


   export default function TradeOrderModal({
  show,
  onClose,
  symbol,
  side = "buy",
  onSubmit
}) {
  /* ======================
     FORM STATE
  ====================== */
  const [qty, setQty] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");

  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [stopPrice, setStopPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");

  /* ======================
     UI STATE
  ====================== */
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  /* ======================
     RESET ON CLOSE
  ====================== */
  useEffect(() => {
    if (!show) {
      setQty(1);
      setOrderType("market");
      setLimitPrice("");
      setUseStopLoss(false);
      setUseTakeProfit(false);
      setStopPrice("");
      setTakeProfitPrice("");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [show]);

  /* ======================
     SUBMIT HANDLER
  ====================== */
  const handleSubmit = async () => {
    setStatus("loading");
    setErrorMsg("");

    const payload = {
      symbol,
      side,
      qty: Number(qty),
      type: orderType,
      ...(orderType === "limit" && { limit_price: limitPrice }),
      ...(useStopLoss && { stop_price: stopPrice }),
      ...(useTakeProfit && { take_profit_price: takeProfitPrice })
    };

    try {
      const result = await onSubmit(payload);

      if (
        result?.success ||
        ["accepted", "filled", "partially_filled"].includes(
          result?.data?.status
        )
      ) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result?.error || "Order rejected");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Order failed");
    }
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {side.toUpperCase()} {symbol}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Quantity */}
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              disabled={status === "loading"}
            />
          </Form.Group>

          {/* Order Type */}
          <Form.Group className="mb-3">
            <Form.Label>Order Type</Form.Label>
            <Form.Select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={status === "loading"}
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
            </Form.Select>
          </Form.Group>

          {/* Limit Price */}
          {orderType === "limit" && (
            <Form.Group className="mb-3">
              <Form.Label>Limit Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                disabled={status === "loading"}
              />
            </Form.Group>
          )}

          {/* Stop Loss */}
          <Form.Check
            type="switch"
            className="mb-3"
            label="Add Stop Loss"
            checked={useStopLoss}
            onChange={(e) => setUseStopLoss(e.target.checked)}
            disabled={status === "loading"}
          />

          {useStopLoss && (
            <Form.Group className="mb-3">
              <Form.Label>Stop Loss Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                disabled={status === "loading"}
              />
            </Form.Group>
          )}

          {/* Take Profit */}
          <Form.Check
            type="switch"
            className="mb-3"
            label="Add Take Profit"
            checked={useTakeProfit}
            onChange={(e) => setUseTakeProfit(e.target.checked)}
            disabled={status === "loading"}
          />

          {useTakeProfit && (
            <Form.Group className="mb-3">
              <Form.Label>Take Profit Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                disabled={status === "loading"}
              />
            </Form.Group>
          )}
        </Form>

        {/* SUCCESS */}
        {status === "success" && (
          <Alert variant="success" className="mt-3">
            ✅ Order accepted successfully
          </Alert>
        )}

        {/* ERROR */}
        {status === "error" && (
          <Alert variant="danger" className="mt-3">
            ❌ {errorMsg}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={status === "loading"}>
          Close
        </Button>

        <Button
          variant={side === "buy" ? "success" : "danger"}
          onClick={handleSubmit}
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Spinner animation="border" size="sm" /> Placing…
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}