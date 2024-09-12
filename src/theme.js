"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2a2a2a",
    },
    secondary: {
      main: "#dc004e",
    },

    mode: "light",
  },
  // components: {
  //   MuiPaper: {
  //     styleOverrides: {
  //       root: {
  //         backgroundColor: "#a8a8a8",
  //       },
  //     },
  //   },
  // },
});

export default theme;
