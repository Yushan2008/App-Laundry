"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from "@mui/material";
import {
  LocalLaundryService,
  Logout,
  History,
  Dashboard,
  AddCircleOutline,
  WbSunny,
  DarkMode,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useThemeMode } from "@/app/context/ThemeContext";

const navLinks = [
  { label: "Dashboard", icon: <Dashboard fontSize="small" />, path: "/dashboard" },
  { label: "Pesan", icon: <AddCircleOutline fontSize="small" />, path: "/order/new" },
  { label: "Riwayat", icon: <History fontSize="small" />, path: "/history" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isDark = mode === "dark";
  const isActive = (path: string) => pathname === path;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: isDark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, gap: 1 }}>
        {/* Logo */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", mr: 3 }}
          onClick={() => router.push("/dashboard")}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocalLaundryService sx={{ color: "white", fontSize: 18 }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ color: "text.primary", fontWeight: 800, letterSpacing: -0.3, display: { xs: "none", sm: "block" } }}
          >
            Signature Laundry
          </Typography>
        </Box>

        {/* Nav Links */}
        {session?.user?.role === "CUSTOMER" && (
          <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                startIcon={link.icon}
                onClick={() => router.push(link.path)}
                size="small"
                sx={{
                  color: isActive(link.path) ? "primary.main" : "text.secondary",
                  fontWeight: isActive(link.path) ? 700 : 500,
                  bgcolor: isActive(link.path)
                    ? isDark ? "rgba(79,70,229,0.15)" : "rgba(79,70,229,0.08)"
                    : "transparent",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(79,70,229,0.1)" : "rgba(79,70,229,0.06)",
                    color: "primary.main",
                  },
                  borderRadius: 2,
                  px: 1.5,
                  transition: "all 0.15s",
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Dark Mode Toggle */}
        <IconButton
          onClick={toggleMode}
          size="small"
          sx={{
            color: "text.secondary",
            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" },
            mr: 0.5,
          }}
        >
          {isDark ? <WbSunny fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>

        {/* User Menu */}
        {session ? (
          <>
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                transition: "all 0.15s",
              }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {session.user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ color: "text.primary", fontWeight: 600, display: { xs: "none", sm: "block" } }}
              >
                {session.user.name?.split(" ")[0]}
              </Typography>
              <KeyboardArrowDown fontSize="small" sx={{ color: "text.secondary" }} />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: isDark
                    ? "0 8px 30px rgba(0,0,0,0.5)"
                    : "0 8px 30px rgba(0,0,0,0.12)",
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {session.user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {session.user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={async () => { setAnchorEl(null); await signOut({ callbackUrl: "/login" }); }}
                sx={{ color: "error.main", gap: 1.5 }}
              >
                <Logout fontSize="small" />
                Keluar
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={() => router.push("/login")}
            sx={{ background: "linear-gradient(135deg, #4f46e5, #0d9488)" }}
          >
            Masuk
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
