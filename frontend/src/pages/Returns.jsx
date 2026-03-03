import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, TextField, Card, CardContent, Grid,
  CircularProgress, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Alert, InputAdornment,
} from "@mui/material";
import { SearchRounded, AssignmentReturnRounded } from "@mui/icons-material";

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/returns");
        setReturns((res.data || []).reverse());
      } catch (err) {
        console.error("Error loading returns:", err);
        if (err.response?.status === 404) {
          setReturns([]);
        } else {
          setError("تعذر تحميل بيانات المرتجعات");
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = returns.filter((r) => {
    const term = search.toLowerCase();
    return (
      r._id?.toLowerCase().includes(term) ||
      r.saleId?.toString().toLowerCase().includes(term) ||
      r.reason?.toLowerCase().includes(term)
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>المرتجعات</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          سجل جميع عمليات الإرجاع
        </Typography>
      </Box>

      <TextField
        placeholder="بحث برقم العملية أو السبب..."
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
            <AssignmentReturnRounded sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary" variant="h6">لا توجد مرتجعات</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((r) => (
            <Grid item xs={12} md={6} key={r._id}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">رقم العملية</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {r._id}
                      </Typography>
                    </Box>
                    <Chip
                      label={r.type === "exchange" ? "تبديل" : "إرجاع"}
                      color={r.type === "exchange" ? "warning" : "error"}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">المبلغ المُسترد</Typography>
                      <Typography variant="h6" fontWeight={700} color="error.main">
                        {r.refundAmount} درهم
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">التاريخ</Typography>
                      <Typography variant="body2">
                        {new Date(r.createdAt).toLocaleString("ar-EG")}
                      </Typography>
                    </Box>
                  </Box>

                  {r.reason && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">السبب: </Typography>
                      <Typography variant="body2">{r.reason}</Typography>
                    </Box>
                  )}

                  {r.itemsReturned?.length > 0 && (
                    <>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                        المنتجات المُرجعة
                      </Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>الكود</TableCell>
                            <TableCell>اللون</TableCell>
                            <TableCell>المقاس</TableCell>
                            <TableCell>الكمية</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {r.itemsReturned.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell>{item.productCode}</TableCell>
                              <TableCell>{item.color}</TableCell>
                              <TableCell>{item.size}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
