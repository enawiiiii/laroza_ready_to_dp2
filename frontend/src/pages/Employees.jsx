import { useEffect, useState } from "react";
import api from "../api";
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField,
  Table, TableHead, TableRow, TableCell, TableBody, Chip,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Select, InputLabel, FormControl,
  IconButton, InputAdornment,
} from "@mui/material";
import {
  AddRounded, DeleteRounded, SearchRounded, PeopleRounded,
} from "@mui/icons-material";

const ROLES = ["admin", "manager", "cashier"];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "cashier" });
  const [saving, setSaving] = useState(false);

  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data || []);
    } catch (err) {
      setError("تعذر تحميل بيانات الموظفين");
    }
    setLoading(false);
  };

  useEffect(() => { loadEmployees(); }, []);

  const handleAdd = async () => {
    setError("");
    if (!form.name || !form.username || !form.password) {
      setError("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }
    setSaving(true);
    try {
      await api.post("/employees", form);
      setSuccess("تم إضافة الموظف بنجاح");
      setOpen(false);
      setForm({ name: "", username: "", password: "", role: "cashier" });
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء إضافة الموظف");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    try {
      await api.delete(`/employees/${id}`);
      setSuccess("تم حذف الموظف");
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  const getRoleColor = (role) => {
    if (role === "admin") return "error";
    if (role === "manager") return "warning";
    return "primary";
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "مدير عام";
    if (role === "manager") return "مشرف";
    return "كاشير";
  };

  const filtered = employees.filter((e) => {
    const term = search.toLowerCase();
    return e.name?.toLowerCase().includes(term) || e.username?.toLowerCase().includes(term);
  });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>الموظفون</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {employees.length} موظف مسجل
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={() => setOpen(true)}>
          إضافة موظف
        </Button>
      </Box>

      <TextField
        placeholder="بحث بالاسم أو اسم المستخدم..."
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

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <PeopleRounded sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary" variant="h6">لا يوجد موظفون</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>اسم المستخدم</TableCell>
                <TableCell>الدور</TableCell>
                <TableCell>تاريخ الإضافة</TableCell>
                <TableCell align="center">إجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{emp.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{emp.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getRoleLabel(emp.role)} color={getRoleColor(emp.role)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(emp.createdAt).toLocaleDateString("ar-EG")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="error" size="small" onClick={() => handleDelete(emp._id)}>
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>إضافة موظف جديد</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField label="الاسم الكامل *" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="اسم المستخدم *" fullWidth value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="كلمة المرور *" type="password" fullWidth value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>الدور</InputLabel>
                <Select value={form.role} label="الدور" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>{r === "admin" ? "مدير عام" : r === "manager" ? "مشرف" : "كاشير"}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>إلغاء</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
