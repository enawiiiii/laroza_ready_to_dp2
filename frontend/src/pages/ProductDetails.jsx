import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress,
  Alert, Table, TableHead, TableRow, TableCell, TableBody, Button,
  IconButton,
} from "@mui/material";
import { ArrowBackRounded, EditRounded } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { hasPermission } from "../auth/permissions";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, iRes] = await Promise.allSettled([
          api.get('/products/' + id),
          api.get('/inventory/product/' + id),
        ]);
        if (pRes.status === "fulfilled") setProduct(pRes.value.data);
        else setError("تعذر تحميل بيانات المنتج");
        if (iRes.status === "fulfilled") setInventory(iRes.value.data || []);
      } catch (err) {
        setError("حدث خطأ");
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

  if (error || !product) {
    return <Alert severity="error" sx={{ m: 2 }}>{error || "المنتج غير موجود"}</Alert>;
  }

  const imageUrl = product.image
    ? product.image.startsWith("http") ? product.image : "http://localhost:5000" + product.image
    : "https://via.placeholder.com/400x300?text=No+Image";

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/products")} sx={{ bgcolor: "background.paper" }}>
          <ArrowBackRounded />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>{product.name}</Typography>
          <Typography variant="body2" color="text.secondary">{product.brand}</Typography>
        </Box>
        {hasPermission(role, "canEditProducts") && (
          <Button
            variant="contained"
            startIcon={<EditRounded />}
            onClick={() => navigate('/products/edit/' + id)}
          >
            تعديل
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <Box
              component="img"
              src={imageUrl}
              alt={product.name}
              sx={{ width: "100%", height: 300, objectFit: "cover", borderRadius: "16px 16px 0 0" }}
            />
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">الكود</Typography>
                  <Chip label={product.productCode} size="small" color="primary" sx={{ display: "block", mt: 0.5 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">الفئة</Typography>
                  <Typography variant="body2" fontWeight={600}>{product.category || "—"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">سعر البيع</Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">{product.price} درهم</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>المخزون حسب اللون والمقاس</Typography>
              {inventory.length === 0 ? (
                <Alert severity="info">لا توجد بيانات مخزون لهذا المنتج</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>اللون</TableCell>
                      <TableCell>المقاس</TableCell>
                      <TableCell>الكمية</TableCell>
                      <TableCell>الحالة</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.variantColor}</TableCell>
                        <TableCell>{item.sizeName}</TableCell>
                        <TableCell>
                          <Typography fontWeight={700}>{item.quantity}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.quantity === 0 ? "نفذ" : item.quantity < 5 ? "منخفض" : "متاح"}
                            color={item.quantity === 0 ? "error" : item.quantity < 5 ? "warning" : "success"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {product.variants && product.variants.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>الألوان المتاحة</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {product.variants.map((v, i) => (
                    <Chip key={i} label={v.color} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
