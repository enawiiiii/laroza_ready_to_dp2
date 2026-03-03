import React, { useState } from "react";
import api from "../api";
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid,
  Divider, IconButton, Alert, CircularProgress,
} from "@mui/material";
import { AddRounded, DeleteRounded, ArrowBackRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const FIXED_SIZES = ["38", "40", "42", "44", "46", "48", "50", "52", "54", "56"];

export default function AddProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [productCode, setProductCode] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addVariant = () => {
    setVariants([...variants, { color: "", sizes: FIXED_SIZES.map((s) => ({ sizeName: s, quantity: 0 })), customSize: "", customQty: 0 }]);
  };

  const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const updateSizeQty = (vi, si, qty) => {
    const updated = [...variants];
    updated[vi].sizes[si].quantity = Number(qty) || 0;
    setVariants(updated);
  };

  const submitProduct = async () => {
    setError(""); setSuccess("");
    if (variants.length === 0) { setError("أضف لوناً واحداً على الأقل"); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("productCode", productCode);
    formData.append("category", category);
    formData.append("price", price);
    if (imageFile) formData.append("image", imageFile);
    else formData.append("imageUrl", imageUrl);
    const formattedVariants = variants.map((v) => {
      const sizes = [...v.sizes];
      if (v.customSize && Number(v.customQty) > 0) sizes.push({ sizeName: v.customSize, quantity: Number(v.customQty) });
      return { color: v.color, sizes };
    });
    formData.append("variants", JSON.stringify(formattedVariants));
    try {
      await api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setTimeout(() => navigate("/products"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إضافة المنتج");
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate("/products")} sx={{ bgcolor: "background.paper" }}><ArrowBackRounded /></IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>إضافة منتج جديد</Typography>
          <Typography variant="body2" color="text.secondary">أدخل بيانات المنتج والمتغيرات</Typography>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>البيانات الأساسية</Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}><TextField label="اسم المنتج *" fullWidth value={name} onChange={(e) => setName(e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="اسم الشركة *" fullWidth value={brand} onChange={(e) => setBrand(e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="كود المنتج *" fullWidth value={productCode} onChange={(e) => setProductCode(e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="الفئة (اختياري)" fullWidth value={category} onChange={(e) => setCategory(e.target.value)} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="سعر البيع *" type="number" fullWidth value={price} onChange={(e) => setPrice(e.target.value)} /></Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>صورة المنتج</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5 }}>
                    {imageFile ? imageFile.name : "اختر صورة من الجهاز"}
                    <input type="file" accept="image/*" hidden onChange={(e) => { setImageFile(e.target.files[0]); setImageUrl(""); }} />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="أو رابط الصورة" fullWidth value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }} />
                </Grid>
              </Grid>
              {(imageFile || imageUrl) && (
                <Box sx={{ mt: 2 }}>
                  <img src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} alt="preview" style={{ maxHeight: 150, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>الألوان والمقاسات</Typography>
                <Button variant="contained" size="small" startIcon={<AddRounded />} onClick={addVariant}>إضافة لون</Button>
              </Box>
              {variants.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}><Typography variant="body2">لم تُضف أي لون بعد</Typography></Box>
              ) : (
                variants.map((v, i) => (
                  <Card key={i} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                        <TextField label="اللون" size="small" value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} sx={{ flex: 1, mr: 1 }} />
                        <IconButton color="error" size="small" onClick={() => removeVariant(i)}><DeleteRounded fontSize="small" /></IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>المقاسات الثابتة</Typography>
                      <Grid container spacing={1}>
                        {v.sizes.map((s, si) => (
                          <Grid item xs={6} key={si}>
                            <TextField label={s.sizeName} type="number" size="small" fullWidth value={s.quantity} onChange={(e) => updateSizeQty(i, si, e.target.value)} inputProps={{ min: 0 }} />
                          </Grid>
                        ))}
                      </Grid>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>مقاس إضافي</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}><TextField label="المقاس" size="small" fullWidth value={v.customSize} onChange={(e) => updateVariant(i, "customSize", e.target.value)} /></Grid>
                        <Grid item xs={6}><TextField label="الكمية" type="number" size="small" fullWidth value={v.customQty} onChange={(e) => updateVariant(i, "customQty", e.target.value)} inputProps={{ min: 0 }} /></Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={() => navigate("/products")} disabled={loading}>إلغاء</Button>
        <Button variant="contained" size="large" onClick={submitProduct} disabled={loading} sx={{ px: 4 }}>
          {loading ? <CircularProgress size={22} color="inherit" /> : "حفظ المنتج"}
        </Button>
      </Box>
    </Box>
  );
}
