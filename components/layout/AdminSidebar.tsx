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
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  People,
  LocalLaundryService,
  Logout,
} from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

const DRAWER_WIDTH = 240;

const menuItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/admin" },
  { label: "Kelola Pesanan", icon: <Assignment />, path: "/admin/orders" },
  { label: "Data Pelanggan", icon: <People />, path: "/admin/users" },
];

export default function AdminSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#1e293b",
          color: "white",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalLaundryService sx={{ color: "#60a5fa" }} />
        <Typography variant="h6" sx={{ color: "white", fontWeight: 700, fontSize: 15 }}>
          Signature Laundry
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ px: 2, color: "#94a3b8", mb: 1 }}>
        ADMIN PANEL
      </Typography>
      <Divider sx={{ borderColor: "#334155" }} />

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? "#3b82f6" : "transparent",
                  "&:hover": { bgcolor: isActive ? "#2563eb" : "#334155" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "white" : "#94a3b8", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "white" : "#cbd5e1",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#334155" }} />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#3b82f6", fontSize: 14 }}>
            {session?.user?.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: "white", fontWeight: 600, lineHeight: 1.2 }}>
              {session?.user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Admin
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            borderRadius: 2,
            color: "#f87171",
            "&:hover": { bgcolor: "#334155" },
            px: 1,
          }}
        >
          <ListItemIcon sx={{ color: "#f87171", minWidth: 32 }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Keluar"
            primaryTypographyProps={{ fontSize: 14, color: "#f87171" }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
