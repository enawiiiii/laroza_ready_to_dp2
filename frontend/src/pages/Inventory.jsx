import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, TextField, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, CircularProgress, Alert, InputAdornment,
} from "@mui/material";
import { SearchRounded, Inventory2Rounded } from "@mui/icons-material";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/inventory");
        setItems(res.data || []);
      } catch (err) {
        console.error("Error loading inventory:", err);
        setError("تعذر تحميل بيانات المخزون");
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(term) ||
      item.product?.productCode?.toLowerCase().includes(term) ||
      item.variantColor?.toLowerCase().includes(term) ||
      item.sizeName?.toLowerCase().includes(term)
    );
  });

  const getQtyColor = (qty) => {
    if (qty === 0) return "error";
    if (qty < 5) return "warning";
    return "success";
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>المخزون</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {items.length} عنصر في المخزون
        </Typography>
      </Box>

      <TextField
        placeholder="بحث بالاسم أو الكود أو اللون أو المقاس..."
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded color="action" />
            </InputAdornment>
          ),
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Inventory2Rounded sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary" variant="h6">لا توجد عناصر مطابقة</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المنتج</TableCell>
                <TableCell>الكود</TableCell>
                <TableCell>اللون</TableCell>
                <TableCell>المقاس</TableCell>
                <TableCell>الكمية</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.product?.name || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.product?.brand}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.product?.productCode || "—"} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{item.variantColor}</TableCell>
                  <TableCell>{item.sizeName}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={700}>
                      {item.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.quantity === 0 ? "نفذ" : item.quantity < 5 ? "منخفض" : "متاح"}
                      color={getQtyColor(item.quantity)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}
