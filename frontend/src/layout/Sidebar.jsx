import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, Tooltip,
} from "@mui/material";
import {
  DashboardRounded, Inventory2Rounded, ShoppingCartRounded,
  PointOfSaleRounded, ReceiptLongRounded, AssignmentReturnRounded,
  SwapHorizRounded, BarChartRounded, PeopleAltRounded,
  LockClockRounded, LogoutRounded, StorefrontRounded,
} from "@mui/icons-material";
import { hasPermission } from "../auth/permissions";
import { logLogout } from "../utils/attendance";
import { logAction } from "../utils/logs";
import { stopSessionTracking } from "../utils/session";

const SIDEBAR_WIDTH = 260;

const menu = [
  { label: "لوحة التحكم", path: "/dashboard", perm: "canViewDashboard", icon: <DashboardRounded /> },
  { label: "المنتجات", path: "/products", perm: "canViewProducts", icon: <Inventory2Rounded /> },
  { label: "المخزون", path: "/inventory", perm: "canViewInventory", icon: <ShoppingCartRounded /> },
  { label: "نقطة البيع", path: "/pos", perm: "canViewPOS", icon: <PointOfSaleRounded /> },
  { label: "مبيعاتي", path: "/sales", perm: "canViewOwnSales", icon: <ReceiptLongRounded /> },
  { label: "قائمة الفواتير", path: "/sales-list", perm: "canViewOwnSales", icon: <ReceiptLongRounded /> },
  { label: "المرتجعات", path: "/returns", perm: "canRefund", icon: <AssignmentReturnRounded /> },
  { label: "التبديلات", path: "/exchange", perm: "canExchange", icon: <SwapHorizRounded /> },
  { label: "التقارير", path: "/reports", perm: "canViewReports", icon: <BarChartRounded /> },
  { label: "الموظفين", path: "/employees", perm: "canManageEmployees", icon: <PeopleAltRounded /> },
  { label: "إغلاق الكاشير", path: "/cashier-closing", perm: "canCloseCashier", icon: <LockClockRounded /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "مستخدم";

  const roleLabels = { admin: "مدير النظام", manager: "مدير", staff: "موظف" };

  const logout = () => {
    logLogout(userId);
    logAction({ userId, action: "logout" });
    stopSessionTracking();
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.2)", borderRadius: 2 },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <StorefrontRounded sx={{ fontSize: 22, color: "white" }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, letterSpacing: 0.5 }}>
            LRR SYSTEM
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: "0.7rem" }}>
            نظام إدارة المتجر
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

      {/* User Info */}
      <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            fontSize: "0.9rem", fontWeight: 700,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: "hidden" }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {userName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: "0.7rem" }}>
            {roleLabels[role] || role}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2, mb: 1 }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {menu.map((item) => {
          if (!hasPermission(role, item.perm)) return null;
          const isActive = location.pathname === item.path;

          return (
            <Tooltip key={item.path} title="" placement="right">
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.2,
                  px: 2,
                  background: isActive
                    ? "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(29,78,216,0.2))"
                    : "transparent",
                  borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                  "&:hover": {
                    background: "rgba(255,255,255,0.07)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#3b82f6" : "rgba(255,255,255,0.6)",
                    minWidth: 36,
                    "& svg": { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "white" : "rgba(255,255,255,0.75)",
                  }}
                />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2, mt: 1 }} />

      {/* Logout */}
      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: 2,
            py: 1.2,
            px: 2,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            "&:hover": { background: "rgba(239,68,68,0.2)" },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon sx={{ color: "#ef4444", minWidth: 36, "& svg": { fontSize: 20 } }}>
            <LogoutRounded />
          </ListItemIcon>
          <ListItemText
            primary="تسجيل الخروج"
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 600, color: "#ef4444" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
