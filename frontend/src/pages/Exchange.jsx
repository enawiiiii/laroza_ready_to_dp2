import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, TextField, Card, CardContent, Grid,
  CircularProgress, Table, TableHead, TableRow, TableCell,
  TableBody, Chip, Alert, InputAdornment, Divider,
} from "@mui/material";
import { SearchRounded, SwapHorizRounded } from "@mui/icons-material";

export default function Exchange() {
  const [exchanges, setExchanges] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // Exchanges are stored as Returns with type="exchange"
        const res = await api.get("/returns");
        const allReturns = res.data || [];
        const exchangeOnly = allReturns.filter((r) => r.type === "exchange");
        setExchanges(exchangeOnly.reverse());
      } catch (err) {
        console.error("Error loading exchanges:", err);
        if (err.response?.status === 404) {
          setExchanges([]);
        } else {
          setError("تعذر تحميل بيانات التبديلات");
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = exchanges.filter((ex) => {
    const term = search.toLowerCase();
    return (
      ex._id?.toLowerCase().includes(term) ||
      ex.reason?.toLowerCase().includes(term)
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>التبديلات</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          سجل جميع عمليات التبديل
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
            <SwapHorizRounded sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary" variant="h6">لا توجد تبديلات</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((ex) => (
            <Grid item xs={12} md={6} key={ex._id}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">رقم العملية</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {ex._id}
                      </Typography>
                    </Box>
                    <Chip label="تبديل" color="warning" size="small" />
                  </Box>

                  <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">فارق المبلغ</Typography>
                      <Typography variant="h6" fontWeight={700} color="warning.main">
                        {ex.refundAmount} درهم
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">التاريخ</Typography>
                      <Typography variant="body2">
                        {new Date(ex.createdAt).toLocaleString("ar-EG")}
                      </Typography>
                    </Box>
                  </Box>

                  {ex.reason && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">السبب: </Typography>
                      <Typography variant="body2">{ex.reason}</Typography>
                    </Box>
                  )}

                  {ex.itemsReturned?.length > 0 && (
                    <>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>المنتجات القديمة (المُرجعة)</Typography>
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
                          {ex.itemsReturned.map((item, i) => (
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

                  {ex.itemsGiven?.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>المنتجات الجديدة (المُعطاة)</Typography>
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
                          {ex.itemsGiven.map((item, i) => (
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
