import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: ["system-ui", "Tahoma", "sans-serif"].join(","),
  },
  palette: {
    mode: "light",
    primary: {
      main: "#6C5CE7", // بنفسجي فخم
    },
    secondary: {
      main: "#FDCB6E", // ذهبي ناعم
    },
    background: {
      default: "#F5F6FA",
      paper: "#FFFFFF",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        },
      },
    },
  },
});

export default theme;