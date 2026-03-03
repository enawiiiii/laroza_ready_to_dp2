import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, TextField, Card, CardContent, Grid,
  CircularProgress, Alert,
} from "@mui/material";
import {
  TrendingUpRounded, AssignmentReturnRounded, SwapHorizRounded,
} from "@mui/icons-material";

function SummaryCard({ title, value, subtitle, icon, color }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            <Typography variant="h4" fontWeight={700} color={color || "text.primary"} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          <Box sx={{ color: color || "primary.main", opacity: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, rRes] = await Promise.allSettled([
          api.get("/sales"),
          api.get("/returns"),
        ]);

        if (sRes.status === "fulfilled") setSales((sRes.value.data || []).reverse());
        if (rRes.status === "fulfilled") setReturnsList((rRes.value.data || []).reverse());
      } catch (err) {
        setError("تعذر تحميل بيانات التقارير");
      }
      setLoading(false);
    };
    load();
  }, []);

  const filterByDate = (list) => {
    return list.filter((item) => {
      const date = new Date(item.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate + "T23:59:59") : null;
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });
  };

  const filteredSales = filterByDate(sales);
  const filteredReturns = filterByDate(returnsList);
  const filteredExchanges = filteredReturns.filter((r) => r.type === "exchange");
  const filteredReturnOnly = filteredReturns.filter((r) => r.type === "return");

  const totalSales = filteredSales.reduce((s, x) => s + (x.totalAmount || 0), 0);
  const totalVAT = filteredSales.reduce((s, x) => s + (x.vatAmount || 0), 0);
  const totalReturns = filteredReturnOnly.reduce((s, x) => s + (x.refundAmount || 0), 0);
  const totalExchanges = filteredExchanges.reduce((s, x) => s + (x.refundAmount || 0), 0);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>التقارير</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          ملخص المبيعات والمرتجعات والتبديلات
        </Typography>
      </Box>

      {/* Date Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>تصفية بالتاريخ</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="من تاريخ"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="إلى تاريخ"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <>
          {/* Financial Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="إجمالي المبيعات"
                value={`${totalSales.toFixed(2)} درهم`}
                subtitle={`${filteredSales.length} عملية بيع`}
                icon={<TrendingUpRounded sx={{ fontSize: 40 }} />}
                color="#16a34a"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="إجمالي الضريبة (VAT)"
                value={`${totalVAT.toFixed(2)} درهم`}
                subtitle="5% من المبيعات"
                icon={<TrendingUpRounded sx={{ fontSize: 40 }} />}
                color="#1d4ed8"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="إجمالي المرتجعات"
                value={`${totalReturns.toFixed(2)} درهم`}
                subtitle={`${filteredReturnOnly.length} عملية إرجاع`}
                icon={<AssignmentReturnRounded sx={{ fontSize: 40 }} />}
                color="#dc2626"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="إجمالي التبديلات"
                value={`${totalExchanges.toFixed(2)} درهم`}
                subtitle={`${filteredExchanges.length} عملية تبديل`}
                icon={<SwapHorizRounded sx={{ fontSize: 40 }} />}
                color="#d97706"
              />
            </Grid>
          </Grid>

          {/* Count Summary */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>ملخص العمليات</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: "center", p: 2, bgcolor: "success.50", borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="success.main">
                      {filteredSales.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">عملية بيع</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: "center", p: 2, bgcolor: "error.50", borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="error.main">
                      {filteredReturnOnly.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">عملية إرجاع</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: "center", p: 2, bgcolor: "warning.50", borderRadius: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="warning.main">
                      {filteredExchanges.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">عملية تبديل</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
