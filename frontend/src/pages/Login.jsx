import { useState } from "react";
import api, { setAuthToken } from "../api";
import { Box, Card, CardContent, TextField, Typography, Button, CircularProgress, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, StorefrontRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { logLogin } from "../utils/attendance";
import { logAction } from "../utils/logs";
import { startSessionTracking } from "../utils/session";
import { roles } from "../auth/roles";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const login = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      const { token, user } = res.data;

      setAuthToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id || user.username);
      localStorage.setItem("userName", user.username);
      localStorage.setItem("role", user.role);

      const userPermissions = roles[user.role] || {};
      localStorage.setItem("permissions", JSON.stringify(userPermissions));

      logLogin(user._id || user.username);
      logAction({ userId: user._id || user.username, action: "login", details: { username: user.username } });
      startSessionTracking();

      if (user.role === "admin" || user.role === "manager") {
        navigate("/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 400) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else {
        setError("حدث خطأ في الاتصال بالخادم. تأكد من تشغيل الـ backend.");
      }
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a237e, #0d47a1)",
            p: 4,
            textAlign: "center",
            color: "white",
          }}
        >
          <StorefrontRounded sx={{ fontSize: 56, mb: 1, opacity: 0.95 }} />
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: 1 }}>
            LRR SYSTEM
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            نظام إدارة المتجر
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: "center", fontWeight: 600, color: "text.primary" }}>
            تسجيل الدخول
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={login}>
            <TextField
              label="اسم المستخدم"
              fullWidth
              size="medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2.5 }}
              autoComplete="username"
              autoFocus
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />

            <TextField
              label="كلمة المرور"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #1a237e, #0d47a1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0d47a1, #1565c0)",
                },
                "&:disabled": {
                  background: "#ccc",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "دخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
