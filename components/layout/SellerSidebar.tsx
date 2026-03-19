"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Dashboard,
  ListAlt,
  Person,
  Logout,
  DarkMode,
  LightMode,
  LocalLaundryService,
} from "@mui/icons-material";
import { useThemeMode } from "@/app/context/ThemeContext";
import NotificationBell from "@/components/notifications/NotificationBell";

const MENU = [
  { label: "Dashboard", icon: <Dashboard />, href: "/seller" },
  { label: "Pesanan Saya", icon: <ListAlt />, href: "/seller/orders" },
  { label: "Profil Usaha", icon: <Person />, href: "/seller/profile" },
];

export default function SellerSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const [available, setAvailable] = useState(true);

  const handleToggleAvailability = async () => {
    const next = !available;
    setAvailable(next);
    await fetch(`/api/sellers/${session?.user?.id}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: next }),
    });
  };

  return (
    <Box
      sx={{
        width: 240,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalLaundryService color="primary" />
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          Seller Panel
        </Typography>
      </Box>
      <Divider />

      {/* User info */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
          {session?.user?.name?.[0]}
        </Avatar>
        <Box flex={1} overflow="hidden">
          <Typography variant="body2" fontWeight={600} noWrap>
            {session?.user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Seller
          </Typography>
        </Box>
        <NotificationBell />
      </Box>
      <Divider />

      {/* Availability toggle */}
      <Box px={2} py={1.5}>
        <FormControlLabel
          control={
            <Switch
              checked={available}
              onChange={handleToggleAvailability}
              color="success"
              size="small"
            />
          }
          label={
            <Typography variant="caption" fontWeight={500} color={available ? "success.main" : "text.secondary"}>
              {available ? "Tersedia" : "Tidak Tersedia"}
            </Typography>
          }
        />
      </Box>
      <Divider />

      {/* Menu */}
      <List sx={{ flex: 1, py: 1 }}>
        {MENU.map((item) => {
          const active = pathname === item.href || (item.href !== "/seller" && pathname.startsWith(item.href));
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => router.push(item.href)}
                sx={{ borderRadius: 2, mx: 1, my: 0.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: "body2", fontWeight: active ? 700 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title={mode === "dark" ? "Mode Terang" : "Mode Gelap"}>
          <IconButton size="small" onClick={toggleMode}>
            {mode === "dark" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Box flex={1} />
        <Tooltip title="Keluar">
          <IconButton size="small" onClick={() => signOut({ callbackUrl: "/login" })}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
