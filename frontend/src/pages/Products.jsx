import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  TextField, Button, CircularProgress, Chip, InputAdornment, Alert,
} from "@mui/material";
import { SearchRounded, AddRounded, EditRounded, VisibilityRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "../auth/permissions";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("تعذر تحميل المنتجات");
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.productCode?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>المنتجات</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {products.length} منتج مسجل
          </Typography>
        </Box>
        {hasPermission(role, "canEditProducts") && (
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/products/add")}
            sx={{ px: 3 }}
          >
            إضافة منتج
          </Button>
        )}
      </Box>

      {/* Search */}
      <TextField
        placeholder="بحث بالاسم أو الكود أو الشركة..."
        fullWidth
        size="medium"
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
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography color="text.secondary" variant="h6">لا توجد منتجات مطابقة</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p._id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height={200}
                  image={
                    p.image?.startsWith("http")
                      ? p.image
                      : p.image
                      ? `http://localhost:5000${p.image}`
                      : "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  alt={p.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flex: 1, p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {p.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {p.brand}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
                    <Chip label={p.productCode} size="small" variant="outlined" color="primary" />
                    {p.category && (
                      <Chip label={p.category} size="small" variant="outlined" />
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="primary" sx={{ mt: 1.5 }}>
                    {p.price} درهم
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityRounded />}
                    onClick={() => navigate(`/products/${p._id}`)}
                    fullWidth
                  >
                    التفاصيل
                  </Button>
                  {hasPermission(role, "canEditProducts") && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditRounded />}
                      onClick={() => navigate(`/products/edit/${p._id}`)}
                      fullWidth
                    >
                      تعديل
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
