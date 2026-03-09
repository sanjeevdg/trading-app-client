import { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function CsvGrid2() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [visibilityModel, setVisibilityModel] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/csv")
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
       valueGetter: (value, row) => {
          if (!row) return null;
          
          return row.high - row.low;
        },
        valueFormatter: ({ value }) => value?.toFixed(2),
      });

        cols.push({
          field: "body",
          headerName: "Body",
          type: "number",
          flex: 1,
       valueGetter: (value, row) => {
          if (!row) return null;
          return Math.abs(row.close - row.open);
       },
         
          valueFormatter: (value) => value?.toFixed(2),
        });

        cols.push({
        field: "pct_change",
        headerName: "% Change",
        type: "number",
        flex: 1,
        valueGetter: (value, row) => {
          if (!row) return null;
          
          return ((row.close - row.open) / row.open) * 100;
        },
        valueFormatter: ({ value }) =>
          value ? `${value.toFixed(2)}%` : "",
        cellClassName: ({ value }) =>
          value >= 0 ? "price-up" : "price-down",
      });
        const rws = data.map((row, i) => ({
          id: i,
          ...row,
        }));

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

