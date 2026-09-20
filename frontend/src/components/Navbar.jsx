import React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useNavigate } from "react-router-dom";
import SignOut from "./SignOut";
import { useThemeMode } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", mb: { xs: 3, md: 5 } }}
    >
      <Toolbar sx={{ maxWidth: 1440, width: "100%", mx: "auto" }}>
        <Typography
          variant="h6"
          onClick={() => navigate("/")}
          sx={{
            ml: 1,
            cursor: "pointer",
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          PLAYON<span style={{ color: "#e2774d" }}>.</span>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" alignItems="center">
          <Tooltip title={mode === "dark" ? "Use light mode" : "Use dark mode"}>
            {/*<IconButton onClick={toggleMode} aria-label="Toggle color mode">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>*/}
          </Tooltip>
          <SignOut />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
