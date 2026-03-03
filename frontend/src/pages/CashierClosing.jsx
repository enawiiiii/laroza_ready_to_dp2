import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Divider, CircularProgress, Alert, Grid, Chip,
} from "@mui/material";
import {
  LockClockRounded, LockOpenRounded, AccessTimeRounded,
} from "@mui/icons-material";

export default function CashierClosing() {
  const employeeId = localStorage.getItem("userId");

  const [session, setSession] = useState(null);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSession = async () => {
    try {
      const res = await api.get(`/cashier/current/${employeeId}`);
      setSession(res.data);
    } catch (err) {
      console.error("Error loading session:", err);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadSession();
  }, []);

  const openShift = async () => {
    setError(""); setSuccess("");
    if (!openingCash) { setError("الرجاء إدخال مبلغ بداية الشفت"); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/cashier/open", {
        employeeId,
        openingCash: Number(openingCash),
      });
      setSession(res.data);
      setSuccess("تم فتح الشفت بنجاح");
      setOpeningCash("");
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء فتح الشفت");
    }
    setSubmitting(false);
  };

  const closeShift = async () => {
    setError(""); setSuccess("");
    if (!closingCash) { setError("الرجاء إدخال مبلغ نهاية الشفت"); return; }
    if (!window.confirm("هل أنت متأكد من إغلاق الشفت؟")) return;
    setSubmitting(true);
    try {
      await api.post("/cashier/close", {
        employeeId,
        closingCash: Number(closingCash),
      });
      setSuccess("تم إغلاق الشفت بنجاح");
      setSession(null);
      setClosingCash("");
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إغلاق الشفت");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>إدارة الشفت</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          فتح وإغلاق شفت الكاشير
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container justifyContent="center">
        <Grid item xs={12} sm={10} md={7} lg={5}>
          {!session ? (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <LockOpenRounded sx={{ fontSize: 56, color: "success.main", mb: 1 }} />
                  <Typography variant="h5" fontWeight={700}>فتح شفت جديد</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    لا يوجد شفت مفتوح حالياً
                  </Typography>
                </Box>
                <TextField
                  label="مبلغ بداية الشفت (درهم)"
                  fullWidth
                  type="number"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  sx={{ mb: 3 }}
                  inputProps={{ min: 0 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  color="success"
                  onClick={openShift}
                  disabled={submitting}
                  sx={{ py: 1.5 }}
                >
                  {submitting ? <CircularProgress size={22} color="inherit" /> : "فتح الشفت"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                  <LockClockRounded sx={{ fontSize: 56, color: "primary.main", mb: 1 }} />
                  <Typography variant="h5" fontWeight={700}>الشفت مفتوح</Typography>
                  <Chip
                    icon={<AccessTimeRounded />}
                    label={`منذ: ${new Date(session.openingTime).toLocaleString("ar-EG")}`}
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    مبلغ بداية الشفت
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {session.openingCash} درهم
                  </Typography>
                </Box>

                <TextField
                  label="مبلغ نهاية الشفت (درهم)"
                  fullWidth
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  sx={{ mb: 3 }}
                  inputProps={{ min: 0 }}
                />

                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  size="large"
                  onClick={closeShift}
                  disabled={submitting}
                  sx={{ py: 1.5 }}
                >
                  {submitting ? <CircularProgress size={22} color="inherit" /> : "إغلاق الشفت"}
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
