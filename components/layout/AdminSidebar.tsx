"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  People,
  LocalLaundryService,
  Logout,
  WbSunny,
  DarkMode,
  Store,
} from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useThemeMode } from "@/app/context/ThemeContext";
import NotificationBell from "@/components/notifications/NotificationBell";

const DRAWER_WIDTH = 248;

const menuItems = [
  { label: "Dashboard", icon: <Dashboard fontSize="small" />, path: "/admin" },
  { label: "Kelola Pesanan", icon: <Assignment fontSize="small" />, path: "/admin/orders" },
  { label: "Kelola Seller", icon: <Store fontSize="small" />, path: "/admin/sellers" },
  { label: "Data Pelanggan", icon: <People fontSize="small" />, path: "/admin/users" },
];

export default function AdminSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();

  const isDark = mode === "dark";
  const sidebarBg = isDark ? "#020617" : "#0f172a";
  const activeBg = "rgba(79,70,229,0.25)";
  const activeColor = "#818cf8";
  const hoverBg = "rgba(255,255,255,0.06)";

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: sidebarBg,
          color: "white",
          border: "none",
          boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LocalLaundryService sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.3 }}>
              Signature Laundry
            </Typography>
            <Typography variant="caption" sx={{ color: "#4f46e5", fontWeight: 600, fontSize: 10, letterSpacing: 1 }}>
              ADMIN PANEL
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ px: 1.5, pt: 2, flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{ color: "#475569", fontWeight: 700, letterSpacing: 1, px: 1.5, display: "block", mb: 1 }}
        >
          MENU
        </Typography>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => router.push(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? activeBg : "transparent",
                    border: isActive ? "1px solid rgba(79,70,229,0.3)" : "1px solid transparent",
                    "&:hover": { bgcolor: isActive ? activeBg : hoverBg },
                    transition: "all 0.15s",
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? activeColor : "#64748b",
                      minWidth: 36,
                      transition: "color 0.15s",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? activeColor : "#94a3b8",
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.07)", mb: 2 }} />

        {/* Notifications */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <NotificationBell />
        </Box>

        {/* Dark Mode Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.04)",
            mb: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            {isDark ? "Mode Gelap" : "Mode Terang"}
          </Typography>
          <Tooltip title={isDark ? "Ke Mode Terang" : "Ke Mode Gelap"}>
            <IconButton
              size="small"
              onClick={toggleMode}
              sx={{
                color: isDark ? "#fbbf24" : "#94a3b8",
                bgcolor: "rgba(255,255,255,0.06)",
                width: 28,
                height: 28,
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              {isDark ? <WbSunny sx={{ fontSize: 16 }} /> : <DarkMode sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            mb: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden", flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "#e2e8f0", fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {session?.user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#4f46e5", fontWeight: 600 }}>
              Administrator
            </Typography>
          </Box>
        </Box>

        {/* Logout */}
        <ListItemButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            borderRadius: 2,
            color: "#f87171",
            border: "1px solid rgba(248,113,113,0.15)",
            "&:hover": { bgcolor: "rgba(248,113,113,0.08)" },
            px: 1.5,
            py: 1,
            gap: 1.5,
          }}
        >
          <Logout sx={{ fontSize: 18, color: "#f87171" }} />
          <Typography variant="body2" sx={{ color: "#f87171", fontWeight: 600 }}>
            Keluar
          </Typography>
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
