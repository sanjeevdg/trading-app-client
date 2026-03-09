import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function CsvGrid2() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [visibilityModel, setVisibilityModel] = useState({});

//candlestick-screener.onrender.com

  useEffect(() => {

const preferredOrder = [
  "timestamp",
  "symbol",
  "open",
  "high",
  "low",
  "close",
  "pct_change",
  "range",
  "body",
  "volume",
  "ROC",
  "Histogram",
  "MACD",
  "Signal",
  "ADX",
  "C-O"
];
//127.0.0.1:8000
    fetch("https://candlestick-screener.onrender.com/api/csv")
      .then((res) => res.json())
      .then((data) => {

        const cols = Object.keys(data[0]).map((field) => {

          const base = {
            field,
            headerName: field,
            flex: 1,
          };

          // format numeric values
          if (typeof data[0][field] === "number") {
            base.type = "number";
            base.valueFormatter = (v) =>
              v.value?.toFixed ? v.value.toFixed(2) : v.value;
          }

          // price coloring
          if (["open","high","low","close"].includes(field)) {
            base.cellClassName = (params) => {
                const prev = params.api.getRow(params.id - 1)?.close;

                if (!prev) return "";

                return params.value >= prev ? "price-up" : "price-down";
              };
          }

          return base;
        });
        cols.push({
        field: "range",
        headerName: "Range",
        type: "number",
        flex: 1,
       
        valueFormatter: ({ value }) => value?.toFixed(2),
      });

        cols.push({
          field: "body",
          headerName: "Body",
          type: "number",
          flex: 1,
        
          valueFormatter: (value) => value?.toFixed(2),
        });

        cols.push({
        field: "pct_change",
        headerName: "% Change",
        type: "number",
        flex: 1,
        valueFormatter: (value) =>
          value != null ? `${value.toFixed(2)}%` : "",
        cellClassName: (params) =>
          params.value >= 0 ? "price-up" : "price-down",
      });
        const rws = data.map((row, i) => {
        const open = Number(row.open);
        const close = Number(row.close);
        const high = Number(row.high);
        const low = Number(row.low);

        return {
          id: i,
          ...row,

          range:
            !isNaN(high) && !isNaN(low)
              ? high - low
              : null,

          pct_change:
            !isNaN(open) && !isNaN(close) && open !== 0
              ? ((close - open) / open) * 100
              : null,

          body:
            !isNaN(open) && !isNaN(close)
              ? Math.abs(close - open)
              : null,
        };
      });
        cols.sort((a, b) => {
        const aIndex = preferredOrder.indexOf(a.field);
        const bIndex = preferredOrder.indexOf(b.field);

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
        });
        setColumns(cols);
        setRows(rws);
      });
  }, []);

  return (
    <div style={{ height: 650, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[25, 50, 100]}
        columnVisibilityModel={visibilityModel}
        onColumnVisibilityModelChange={(model) => setVisibilityModel(model)}
        disableRowSelectionOnClick
        initialState={{
          columns: {
      columnVisibilityModel: {
        ATR_14: false,
        ADX: false,
      },
    },
     pinnedColumns: { left: ["timestamp"] },
        }}
        sx={{
  "& .MuiDataGrid-cell.price-up": {
    color: "#16a34a",
    fontWeight: 600,
  },
  "& .MuiDataGrid-cell.price-down": {
    color: "#dc2626",
    fontWeight: 600,
  }
}}
      />
    </div>
  );
}

