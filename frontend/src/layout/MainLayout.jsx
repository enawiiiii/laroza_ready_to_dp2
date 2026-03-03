import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory2";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ReplayIcon from "@mui/icons-material/Replay";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { label: "لوحة التحكم", icon: <DashboardIcon />, path: "/" },
  { label: "نقطة البيع", icon: <PointOfSaleIcon />, path: "/pos" },
  { label: "المنتجات", icon: <ShoppingBagIcon />, path: "/products" },
  { label: "المخزون", icon: <InventoryIcon />, path: "/inventory" },
  { label: "الموظفين", icon: <PeopleIcon />, path: "/employees" },
  { label: "المبيعات", icon: <ReceiptLongIcon />, path: "/sales" },
  { label: "المرتجعات", icon: <ReplayIcon />, path: "/returns-list" },
];

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", direction: "rtl" }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          background: "linear-gradient(90deg, #6C5CE7, #A363D9)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap component="div">
            نظام نقاط البيع
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            مرحباً، {localStorage.getItem("username") || "موظف"}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#1E1E2F",
            color: "#fff",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  mx: 1,
                  "&.Mui-selected": {
                    background: "rgba(255,255,255,0.12)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}