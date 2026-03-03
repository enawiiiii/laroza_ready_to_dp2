import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, TextField, Card,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, CircularProgress, Alert, InputAdornment, Button,
} from "@mui/material";
import { SearchRounded, ReceiptRounded, VisibilityRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/sales");
        setSales((res.data || []).reverse());
      } catch (err) {
        setError("تعذر تحميل قائمة الفواتير");
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = sales.filter((s) => {
    const term = search.toLowerCase();
    return (
      s._id?.toLowerCase().includes(term) ||
      s.cashierName?.toLowerCase().includes(term)
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>قائمة الفواتير</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {sales.length} فاتورة
        </Typography>
      </Box>

      <TextField
        placeholder="بحث برقم الفاتورة أو اسم الكاشير..."
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
        <Card sx={{ textAlign: "center", py: 6 }}>
          <ReceiptRounded sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary" variant="h6">لا توجد فواتير</Typography>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>رقم الفاتورة</TableCell>
                <TableCell>الكاشير</TableCell>
                <TableCell>الإجمالي</TableCell>
                <TableCell>طريقة الدفع</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell align="center">تفاصيل</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                      {s._id}
                    </Typography>
                  </TableCell>
                  <TableCell>{s.cashierName || "—"}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="success.main">
                      {s.totalAmount} درهم
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.paymentMethod === "cash" ? "نقداً" : s.paymentMethod === "card" ? "بطاقة" : s.paymentMethod || "—"}
                      size="small"
                      color={s.paymentMethod === "cash" ? "success" : "primary"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(s.createdAt).toLocaleString("ar-EG")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityRounded />}
                      onClick={() => navigate(`/sales/${s._id}`)}
                    >
                      عرض
                    </Button>
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
