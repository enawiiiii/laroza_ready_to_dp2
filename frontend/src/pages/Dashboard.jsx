import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Chip, Table, TableHead, TableRow, TableCell, TableBody,
  Alert, Avatar,
} from "@mui/material";
import {
  Inventory2Rounded, ShoppingBagRounded, WarningAmberRounded,
  TrendingUpRounded, CategoryRounded,
} from "@mui/icons-material";

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color || "text.primary"}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color || "#1d4ed8"}20`, width: 52, height: 52 }}>
            <Box sx={{ color: color || "#1d4ed8", display: "flex" }}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("تعذر تحميل بيانات لوحة التحكم");
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          لوحة التحكم
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          نظرة عامة على المتجر
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي المنتجات"
            value={data?.totalProducts ?? 0}
            icon={<CategoryRounded />}
            color="#1d4ed8"
            subtitle="منتج مسجل"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="عناصر المخزون"
            value={data?.totalInventoryItems ?? 0}
            icon={<Inventory2Rounded />}
            color="#7c3aed"
            subtitle="variant في المخزون"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الكميات"
            value={data?.totalQuantity ?? 0}
            icon={<ShoppingBagRounded />}
            color="#16a34a"
            subtitle="قطعة متاحة"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="مخزون منخفض"
            value={data?.lowStock?.length ?? 0}
            icon={<WarningAmberRounded />}
            color="#d97706"
            subtitle="أقل من 5 قطع"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Low Stock */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <WarningAmberRounded sx={{ color: "#d97706" }} />
                <Typography variant="h6" fontWeight={700}>
                  تنبيه المخزون المنخفض
                </Typography>
              </Box>

              {data?.lowStock?.length === 0 ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  جميع المنتجات بمخزون كافٍ
                </Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>المنتج</TableCell>
                      <TableCell>اللون</TableCell>
                      <TableCell>المقاس</TableCell>
                      <TableCell>الكمية</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.lowStock?.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.product?.name || "—"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product?.productCode}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.variantColor}</TableCell>
                        <TableCell>{item.sizeName}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.quantity}
                            size="small"
                            color={item.quantity === 0 ? "error" : "warning"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Products */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <TrendingUpRounded sx={{ color: "#1d4ed8" }} />
                <Typography variant="h6" fontWeight={700}>
                  أحدث المنتجات
                </Typography>
              </Box>

              {data?.latestProducts?.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={3}>
                  لا توجد منتجات بعد
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>اسم المنتج</TableCell>
                      <TableCell>الكود</TableCell>
                      <TableCell>السعر</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.latestProducts?.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{p.brand}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={p.productCode} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {p.price} درهم
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
