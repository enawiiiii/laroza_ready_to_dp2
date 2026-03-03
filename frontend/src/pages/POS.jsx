import { useState, useEffect, useRef, useMemo } from "react";
import api from "../api";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Chip,
  Stack,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";

// إضافات الصلاحيات واللوق
import { hasPermission } from "../auth/permissions";
import { logAction } from "../utils/logs";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 3,
  p: 3,
};

export default function POS() {
  const [variants, setVariants] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [saleType, setSaleType] = useState("inStore");
  const [paymentType, setPaymentType] = useState("cash");
  const [source, setSource] = useState("whatsapp");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Modal لاختيار الكمية
  const [openModal, setOpenModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  // بيانات المستخدم والصلاحيات
  const employeeId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  // Override للخصم
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overridePhone, setOverridePhone] = useState("");
  const [overridePassword, setOverridePassword] = useState("");
  const [overrideTarget, setOverrideTarget] = useState(null); // { index, newPrice, discountPercent }

  // تحميل الـ variants
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/inventory/variants");
      const vars = res.data || [];
      setVariants(vars);

      const map = {};
      vars.forEach((v) => {
        if (!map[v.productCode]) {
          map[v.productCode] = {
            productCode: v.productCode,
            name: v.productName || v.productCode,
          };
        }
      });
      setProductsMap(map);
    };
    load();
  }, []);

  // تنظيف الكاميرا عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.stop();
          codeReaderRef.current.resetReader();
        } catch (e) {
          console.log("Cleanup camera error:", e);
        }
      }
    };
  }, []);

  const openVariantModal = (variant) => {
    setSelectedVariant(variant);
    setModalQty(1);
    setOpenModal(true);
  };

  const closeVariantModal = () => {
    setOpenModal(false);
    setSelectedVariant(null);
    setModalQty(1);
  };

  const getMaxDiscountPercentForRole = () => {
    if (role === "admin") return 100;
    if (role === "manager") return 30;
    return 10; // staff
  };

  const addVariantToCart = (variant, quantity = 1) => {
    if (!variant) return;

    const qty = Math.max(1, Number(quantity) || 1);

    // حماية المخزون
    if (typeof variant.stock !== "undefined" && qty > variant.stock) {
      alert("الكمية المطلوبة أكبر من المخزون المتاح");
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.variantId === variant._id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;

        if (
          typeof variant.stock !== "undefined" &&
          newQty > variant.stock
        ) {
          alert("الكمية المطلوبة أكبر من المخزون المتاح");
          return prev;
        }

        const oldQty = updated[existingIndex].quantity;
        updated[existingIndex].quantity = newQty;

        logAction({
          userId: employeeId,
          action: "sale_item_qty_increase",
          details: {
            variantId: variant._id,
            productCode: variant.productCode,
          },
          oldValue: { quantity: oldQty },
          newValue: { quantity: newQty },
        });

        return updated;
      }

      const newItem = {
        variantId: variant._id,
        productCode: variant.productCode,
        color: variant.color,
        size: variant.size,
        originalPrice: variant.price,
        discountedPrice: variant.price,
        quantity: qty,
      };

      logAction({
        userId: employeeId,
        action: "sale_item_add",
        details: {
          variantId: variant._id,
          productCode: variant.productCode,
        },
        newValue: newItem,
      });

      return [...prev, newItem];
    });
  };

  const addByBarcode = (code) => {
    const value = code || barcode;
    if (!value) return;

    const variant = variants.find((v) => v.barcode === value);
    if (!variant) {
      alert("لم يتم العثور على منتج بهذا الباركود");
      return;
    }

    addVariantToCart(variant, 1);
    setBarcode("");
  };

  const startCameraScan = async () => {
    try {
      setScanning(true);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices =
        await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = videoInputDevices[0]?.deviceId;

      await codeReader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            addByBarcode(text);
            stopCameraScan();
          }
        }
      );
    } catch (e) {
      console.error(e);
      alert("خطأ في تشغيل الكاميرا");
      setScanning(false);
    }
  };

  const stopCameraScan = async () => {
    setScanning(false);
    if (codeReaderRef.current) {
      try {
        await codeReaderRef.current.stop();
        codeReaderRef.current.resetReader();
      } catch (e) {
        console.log("Camera stop error:", e);
      }
      codeReaderRef.current = null;
    }
  };

  const updateDiscount = (index, value) => {
    const num = Number(value) || 0;

    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      if (!hasPermission(role, "canGiveDiscount")) {
        alert("ليست لديك صلاحية لتعديل السعر بعد الخصم");
        return prev;
      }

      if (num > item.originalPrice) {
        return prev;
      }

      const discountPercent =
        ((item.originalPrice - num) / item.originalPrice) * 100;
      const maxAllowed = getMaxDiscountPercentForRole();

      if (discountPercent <= maxAllowed) {
        const oldPrice = item.discountedPrice;
        item.discountedPrice = num;

        logAction({
          userId: employeeId,
          action: "sale_item_discount_change",
          details: {
            variantId: item.variantId,
            productCode: item.productCode,
          },
          oldValue: { discountedPrice: oldPrice },
          newValue: { discountedPrice: num },
        });

        return updated;
      }

      // يحتاج Override
      setOverrideTarget({
        index,
        newPrice: num,
        discountPercent: Math.round(discountPercent),
      });
      setOverrideOpen(true);
      return prev;
    });
  };

  const handleOverrideConfirm = async () => {
    if (!overrideTarget) return;
    if (!overridePhone || !overridePassword) {
      alert("الرجاء إدخال بيانات المدير");
      return;
    }

    setOverrideLoading(true);
    try {
      const res = await api.post("/auth/login", {
        phone: overridePhone,
        password: overridePassword,
      });

      const approver = res.data.user;
      if (
        !approver ||
        (approver.role !== "manager" && approver.role !== "admin")
      ) {
        alert("هذا المستخدم لا يملك صلاحية الموافقة");
        setOverrideLoading(false);
        return;
      }

      setCart((prev) => {
        const updated = [...prev];
        const item = updated[overrideTarget.index];
        if (!item) return prev;

        const oldPrice = item.discountedPrice;
        item.discountedPrice = overrideTarget.newPrice;

        logAction({
          userId: employeeId,
          action: "sale_item_discount_override",
          details: {
            variantId: item.variantId,
            productCode: item.productCode,
            approverId: approver._id,
            approverName: approver.name,
            discountPercent: overrideTarget.discountPercent,
          },
          oldValue: { discountedPrice: oldPrice },
          newValue: { discountedPrice: overrideTarget.newPrice },
        });

        return updated;
      });

      setOverrideOpen(false);
      setOverrideTarget(null);
      setOverridePhone("");
      setOverridePassword("");
    } catch (err) {
      console.error("Override error:", err);
      alert("فشل التحقق من بيانات المدير");
    }
    setOverrideLoading(false);
  };

  const updateQuantity = (index, value) => {
    const qty = Math.max(1, Number(value) || 1);

    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      const variant = variants.find((v) => v._id === item.variantId);
      if (
        variant &&
        typeof variant.stock !== "undefined" &&
        qty > variant.stock
      ) {
        alert("الكمية المطلوبة أكبر من المخزون المتاح");
        return prev;
      }

      const oldQty = item.quantity;
      item.quantity = qty;

      logAction({
        userId: employeeId,
        action: "sale_item_qty_change",
        details: {
          variantId: item.variantId,
          productCode: item.productCode,
        },
        oldValue: { quantity: oldQty },
        newValue: { quantity: qty },
      });

      return updated;
    });
  };

  const removeItem = (index) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];

      if (item) {
        logAction({
          userId: employeeId,
          action: "sale_item_remove",
          details: {
            variantId: item.variantId,
            productCode: item.productCode,
          },
          oldValue: item,
        });
      }

      updated.splice(index, 1);
      return updated;
    });
  };

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.discountedPrice * i.quantity, 0),
    [cart]
  );

  const vat = useMemo(
    () => (paymentType === "visa" ? subtotal * 0.05 : 0),
    [paymentType, subtotal]
  );

  const total = useMemo(() => subtotal + vat, [subtotal, vat]);

  const saveSale = async () => {
    if (!hasPermission(role, "canMakeSale")) {
      alert("ليست لديك صلاحية لإتمام عملية البيع");
      return;
    }

    if (!customerName || !customerPhone) {
      alert("اسم ورقم العميل مطلوبان");
      return;
    }

    if (saleType === "online" && (!customerAddress || !trackingNumber)) {
      alert("العنوان ورقم التتبع مطلوبان للبيع أونلاين");
      return;
    }

    if (!cart.length) {
      alert("السلة فارغة");
      return;
    }

    const body = {
      type: saleType,
      source: saleType === "online" ? source : null,
      paymentType,
      customerName,
      customerPhone,
      customerAddress: saleType === "online" ? customerAddress : null,
      trackingNumber: saleType === "online" ? trackingNumber : null,
      items: cart,
      vatAmount: vat,
      totalAmount: total,
      createdBy: employeeId || null,
    };

    try {
      const res = await api.post("/sales", body);

      logAction({
        userId: employeeId,
        action: "sale_created",
        details: { saleId: res.data._id },
        newValue: body,
      });

      alert("تم حفظ عملية البيع، رقم العملية: " + res.data._id);

      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setTrackingNumber("");
    } catch (err) {
      console.error("Error saving sale:", err);
      alert("حدث خطأ أثناء حفظ عملية البيع");
    }
  };

  const filteredVariants = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return variants;

    return variants.filter((v) => {
      const name =
        productsMap[v.productCode]?.name?.toLowerCase() || "";
      return (
        v.productCode.toLowerCase().includes(term) ||
        v.color.toLowerCase().includes(term) ||
        v.size.toLowerCase().includes(term) ||
        name.includes(term)
      );
    });
  }, [variants, productsMap, search]);

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {/* المنتجات */}
      <Box sx={{ width: "45%" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              نقطة البيع — المنتجات
            </Typography>

            <TextField
              label="بحث"
              fullWidth
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 1.5 }}
            />

            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                label="باركود"
                size="small"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && addByBarcode()
                }
                sx={{ flex: 1 }}
              />

              <Button variant="contained" onClick={() => addByBarcode()}>
                إدخال
              </Button>

              <Button
                variant="outlined"
                color={scanning ? "error" : "primary"}
                onClick={scanning ? stopCameraScan : startCameraScan}
              >
                {scanning ? "إيقاف الكاميرا" : "سكان بالكاميرا"}
              </Button>
            </Stack>

            {scanning && (
              <Box
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #ddd",
                }}
              >
                <video
                  ref={videoRef}
                  style={{ width: "100%" }}
                  autoPlay
                  muted
                  playsInline
                />
              </Box>
            )}

            <Grid container spacing={2}>
              {filteredVariants.map((v) => (
                <Grid item xs={6} key={v._id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      cursor: "pointer",
                      "&:hover": { boxShadow: 4 },
                    }}
                    onClick={() => openVariantModal(v)}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                      >
                        {productsMap[v.productCode]?.name ||
                          v.productCode}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        الكود: {v.productCode}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        اللون: {v.color}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        المقاس: {v.size}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mt: 1, fontWeight: 600 }}
                      >
                        السعر: {v.price} درهم
                      </Typography>

                      {typeof v.stock !== "undefined" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          المخزون: {v.stock}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* السلة */}
      <Box sx={{ width: "30%" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              السلة
            </Typography>

            {cart.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                لا توجد عناصر في السلة.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>المنتج</TableCell>
                    <TableCell>الكمية</TableCell>
                    <TableCell>السعر</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {item.productCode}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.color} — {item.size}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                        >
                          الأصل: {item.originalPrice} / بعد الخصم:{" "}
                          {item.discountedPrice}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(i, e.target.value)
                          }
                          sx={{ width: 70, mb: 0.5 }}
                        />

                        <TextField
                          type="number"
                          size="small"
                          label="سعر بعد الخصم"
                          value={item.discountedPrice}
                          onChange={(e) =>
                            updateDiscount(i, e.target.value)
                          }
                          sx={{ width: 120 }}
                        />
                      </TableCell>

                      <TableCell>
                        {item.discountedPrice * item.quantity}
                      </TableCell>

                      <TableCell>
                        <Button
                          color="error"
                          size="small"
                          onClick={() => removeItem(i)}
                        >
                          حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2">
              الإجمالي الفرعي: {subtotal.toFixed(2)} درهم
            </Typography>
            <Typography variant="subtitle2">
              VAT: {vat.toFixed(2)} درهم
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 1, fontWeight: 700 }}
            >
              الإجمالي النهائي: {total.toFixed(2)} درهم
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* بيانات العميل والدفع */}
      <Box sx={{ width: "25%" }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                نوع البيع والدفع
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>نوع البيع</InputLabel>
                <Select
                  value={saleType}
                  label="نوع البيع"
                  onChange={(e) => setSaleType(e.target.value)}
                >
                  <MenuItem value="inStore">داخل المعرض</MenuItem>
                  <MenuItem value="online">أونلاين</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                <InputLabel>طريقة الدفع</InputLabel>
                <Select
                  value={paymentType}
                  label="طريقة الدفع"
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <MenuItem value="cash">كاش</MenuItem>
                  <MenuItem value="visa">بطاقة</MenuItem>
                  <MenuItem value="cod">دفع عند الاستلام</MenuItem>
                  <MenuItem value="bankTransfer">
                    تحويل بنكي
                  </MenuItem>
                </Select>
              </FormControl>

              {saleType === "online" && (
                <FormControl
                  fullWidth
                  size="small"
                  sx={{ mb: 1.5 }}
                >
                  <InputLabel>المصدر</InputLabel>
                  <Select
                    value={source}
                    label="المصدر"
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <MenuItem value="whatsapp">واتساب</MenuItem>
                    <MenuItem value="instagram">إنستغرام</MenuItem>
                  </Select>
                </FormControl>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                بيانات العميل
              </Typography>

              <TextField
                label="اسم العميل"
                fullWidth
                size="small"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{ mb: 1.5 }}
              />

              <TextField
                label="رقم الجوال"
                fullWidth
                size="small"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                sx={{ mb: 1.5 }}
              />

              {saleType === "online" && (
                <>
                  <TextField
                    label="العنوان"
                    fullWidth
                    size="small"
                    value={customerAddress}
                    onChange={(e) =>
                      setCustomerAddress(e.target.value)
                    }
                    sx={{ mb: 1.5 }}
                  />

                  <TextField
                    label="رقم التتبع"
                    fullWidth
                    size="small"
                    value={trackingNumber}
                    onChange={(e) =>
                      setTrackingNumber(e.target.value)
                    }
                    sx={{ mb: 1.5 }}
                  />
                </>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 1.5, py: 1.2 }}
                onClick={saveSale}
              >
                إتمام البيع
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Modal لاختيار الكمية قبل الإضافة */}
      <Modal open={openModal} onClose={closeVariantModal}>
        <Paper sx={modalStyle}>
          {selectedVariant && (
            <>
              <Typography variant="h6" gutterBottom>
                إضافة للسلة
              </Typography>

              <Typography variant="subtitle1" fontWeight={600}>
                {productsMap[selectedVariant.productCode]?.name ||
                  selectedVariant.productCode}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                الكود: {selectedVariant.productCode}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip
                  label={`اللون: ${selectedVariant.color}`}
                />
                <Chip
                  label={`المقاس: ${selectedVariant.size}`}
                />
              </Stack>

              <Typography sx={{ mt: 2 }}>
                السعر: {selectedVariant.price} درهم
              </Typography>

              {typeof selectedVariant.stock !== "undefined" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  المخزون المتاح: {selectedVariant.stock}
                </Typography>
              )}

              <TextField
                label="الكمية"
                type="number"
                size="small"
                value={modalQty}
                onChange={(e) =>
                  setModalQty(Number(e.target.value) || 1)
                }
                sx={{ mt: 2, width: 120 }}
              />

              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mt: 3, justifyContent: "flex-end" }}
              >
                <Button onClick={closeVariantModal}>إلغاء</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    addVariantToCart(selectedVariant, modalQty);
                    closeVariantModal();
                  }}
                >
                  إضافة للسلة
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      </Modal>

      {/* Modal Override للخصم العالي */}
      <Modal
        open={overrideOpen}
        onClose={() => !overrideLoading && setOverrideOpen(false)}
      >
        <Paper sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            موافقة مدير على خصم عالي
          </Typography>

          {overrideTarget && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              نسبة الخصم المطلوبة تقريبًا:{" "}
              {overrideTarget.discountPercent}%
            </Typography>
          )}

          <TextField
            fullWidth
            size="small"
            label="رقم جوال المدير"
            sx={{ mb: 1.5 }}
            value={overridePhone}
            onChange={(e) => setOverridePhone(e.target.value)}
          />

          <TextField
            fullWidth
            size="small"
            label="كلمة مرور المدير"
            type="password"
            sx={{ mb: 2 }}
            value={overridePassword}
            onChange={(e) => setOverridePassword(e.target.value)}
          />

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              onClick={() =>
                !overrideLoading && setOverrideOpen(false)
              }
              disabled={overrideLoading}
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              onClick={handleOverrideConfirm}
              disabled={overrideLoading}
            >
              {overrideLoading ? (
                <CircularProgress size={20} />
              ) : (
                "تأكيد"
              )}
            </Button>
          </Stack>
        </Paper>
      </Modal>
    </Box>
  );
}