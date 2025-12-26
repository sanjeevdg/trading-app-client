import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";

const AlpacaTopGainers = () => {
  const [gainers, setGainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/alpaca-top-gainers")
      .then((res) => {
        setGainers(res.data.gainers);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load gainers");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div>
      <h3>📈 Top Gainers</h3>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price ($)</th>
            <th>Change %</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {gainers.map((stock) => (
            <tr key={stock.symbol}>
              <td>{stock.symbol}</td>
              <td>{stock.price?.toFixed(2)}</td>
              <td className="text-success">
                {stock.change_percent?.toFixed(2)}%
              </td>
              <td>{stock.volume?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AlpacaTopGainers;
