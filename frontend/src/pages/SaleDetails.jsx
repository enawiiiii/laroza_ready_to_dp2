import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress,
  Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button,
} from "@mui/material";
import { ArrowBackRounded, PrintRounded } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

export default function SaleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sales/${id}`);
        setSale(res.data);
      } catch (err) {
        setError("تعذر تحميل تفاصيل الفاتورة");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error || !sale) {
    return <Alert severity="error" sx={{ m: 2 }}>{error || "الفاتورة غير موجودة"}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/sales-list")} sx={{ bgcolor: "background.paper" }}>
          <ArrowBackRounded />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>تفاصيل الفاتورة</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            {sale._id}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<PrintRounded />} onClick={() => window.print()}>
          طباعة
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Info Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">الإجمالي</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {sale.totalAmount} درهم
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">الضريبة (VAT)</Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                {sale.vatAmount} درهم
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">طريقة الدفع</Typography>
              <Chip
                label={sale.paymentMethod === "cash" ? "نقداً" : sale.paymentMethod === "card" ? "بطاقة" : sale.paymentMethod}
                color={sale.paymentMethod === "cash" ? "success" : "primary"}
                sx={{ mt: 0.5 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">التاريخ</Typography>
              <Typography variant="body1" fontWeight={600}>
                {new Date(sale.createdAt).toLocaleString("ar-EG")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>المنتجات المباعة</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الكود</TableCell>
                    <TableCell>اللون</TableCell>
                    <TableCell>المقاس</TableCell>
                    <TableCell>الكمية</TableCell>
                    <TableCell>السعر</TableCell>
                    <TableCell>الإجمالي</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(sale.items || []).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Chip label={item.productCode} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{item.color}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price} درهم</TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {(item.price * item.quantity).toFixed(2)} درهم
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ minWidth: 250 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">المجموع قبل الضريبة:</Typography>
                    <Typography fontWeight={600}>{(sale.totalAmount - sale.vatAmount).toFixed(2)} درهم</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">الضريبة (5%):</Typography>
                    <Typography fontWeight={600} color="primary">{sale.vatAmount} درهم</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight={700} variant="h6">الإجمالي:</Typography>
                    <Typography fontWeight={700} variant="h6" color="success.main">{sale.totalAmount} درهم</Typography>
                  </Box>
                  {sale.cashReceived && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                        <Typography color="text.secondary">المبلغ المستلم:</Typography>
                        <Typography fontWeight={600}>{sale.cashReceived} درهم</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography color="text.secondary">الباقي:</Typography>
                        <Typography fontWeight={600} color="success.main">{sale.change} درهم</Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
