import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Sidebar from "./layout/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ProductDetails from "./pages/ProductDetails";
import Inventory from "./pages/Inventory";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import SalesList from "./pages/SalesList";
import SaleDetails from "./pages/SaleDetails";
import Returns from "./pages/Returns";
import Exchange from "./pages/Exchange";
import Reports from "./pages/Reports";
import Employees from "./pages/Employees";
import CashierClosing from "./pages/CashierClosing";
import "./App.css";

const theme = createTheme({
  direction: "rtl",
  palette: {
    mode: "light",
    primary: { main: "#1d4ed8", light: "#3b82f6", dark: "#1e40af" },
    secondary: { main: "#7c3aed" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    success: { main: "#16a34a" },
    error: { main: "#dc2626" },
    warning: { main: "#d97706" },
  },
  typography: {
    fontFamily: "'Tajawal', 'Segoe UI', Arial, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": { borderRadius: 10 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#f8fafc",
            fontWeight: 700,
            color: "#475569",
            fontSize: "0.8rem",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f8fafc" },
          "&:last-child td": { border: 0 },
        },
      },
    },
  },
});

const SIDEBAR_WIDTH = 260;

function isAuthenticated() {
  return !!localStorage.getItem("token");
}

function ProtectedLayout({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          p: { xs: 2, md: 3 },
          minHeight: "100vh",
          maxWidth: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/products" element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/products/add" element={<ProtectedLayout><AddProduct /></ProtectedLayout>} />
          <Route path="/products/edit/:id" element={<ProtectedLayout><EditProduct /></ProtectedLayout>} />
          <Route path="/products/:id" element={<ProtectedLayout><ProductDetails /></ProtectedLayout>} />
          <Route path="/product/:id" element={<ProtectedLayout><ProductDetails /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
          <Route path="/pos" element={<ProtectedLayout><POS /></ProtectedLayout>} />
          <Route path="/sales" element={<ProtectedLayout><Sales /></ProtectedLayout>} />
          <Route path="/sales-list" element={<ProtectedLayout><SalesList /></ProtectedLayout>} />
          <Route path="/sales/:id" element={<ProtectedLayout><SaleDetails /></ProtectedLayout>} />
          <Route path="/returns" element={<ProtectedLayout><Returns /></ProtectedLayout>} />
          <Route path="/exchange" element={<ProtectedLayout><Exchange /></ProtectedLayout>} />
          <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
          <Route path="/employees" element={<ProtectedLayout><Employees /></ProtectedLayout>} />
          <Route path="/cashier-closing" element={<ProtectedLayout><CashierClosing /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
