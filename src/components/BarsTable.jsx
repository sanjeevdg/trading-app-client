import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem
} from "@mui/material";

const symbolsList = ["SPY", "AAPL", "TSLA"];
const timeframes = ["1Min", "5Min", "15Min", "1Day"];

export default function BarsTable() {
  const [rows, setRows] = useState([]);
  const [symbols, setSymbols] = useState(["SPY"]);
  const [tf, setTf] = useState("5Min");

 useEffect(() => {
  axios
    .get("http://127.0.0.1:8000/api/bars", {
      params: {
        symbols: symbols.join(","),
        tf
      }
    })
    .then(res => {
      const tvData = res.data.data;
      const tableRows = [];

      Object.entries(tvData).forEach(([symbol, candles]) => {
        const len = candles.c.length;

        for (let i = Math.max(0, len - 20); i < len; i++) {
          tableRows.push({
            symbol,
            time: candles.t
              ? new Date(candles.t[i] * 1000).toLocaleString()
              : "",
            open: candles.o?.[i],
            high: candles.h?.[i],
            low: candles.l?.[i],
            close: candles.c?.[i],
            volume: candles.v?.[i]
          });
        }
      });

      setRows(tableRows.reverse());
    })
    .catch(err => console.error(err));
}, [symbols, tf]);


  return (
    <>
      {/* Controls */}
      <Select
        value={symbols[0]}
        onChange={e => setSymbols([e.target.value])}
        sx={{ m: 2 }}
      >
        {symbolsList.map(s => (
          <MenuItem key={s} value={s}>{s}</MenuItem>
        ))}
      </Select>

      <Select
        value={tf}
        onChange={e => setTf(e.target.value)}
        sx={{ m: 2 }}
      >
        {timeframes.map(t => (
          <MenuItem key={t} value={t}>{t}</MenuItem>
        ))}
      </Select>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Open</TableCell>
              <TableCell>High</TableCell>
              <TableCell>Low</TableCell>
              <TableCell>Close</TableCell>
              <TableCell>Volume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.symbol}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.open}</TableCell>
                <TableCell>{row.high}</TableCell>
                <TableCell>{row.low}</TableCell>
                <TableCell>{row.close}</TableCell>
                <TableCell>{row.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
