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
} from "@mui/material";
import {
  LocalLaundryService,
  AccountCircle,
  Logout,
  History,
  Dashboard,
  AddCircleOutline,
} from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await signOut({ callbackUrl: "/login" });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: "white", color: "text.primary" }}>
      <Toolbar>
        <LocalLaundryService sx={{ color: "primary.main", mr: 1 }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 0, color: "primary.main", fontWeight: 700, mr: 4 }}
        >
          Signature Laundry
        </Typography>

        {session && session.user.role === "CUSTOMER" && (
          <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
            <Button
              startIcon={<Dashboard />}
              onClick={() => router.push("/dashboard")}
              variant={isActive("/dashboard") ? "contained" : "text"}
              size="small"
            >
              Dashboard
            </Button>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={() => router.push("/order/new")}
              variant={isActive("/order/new") ? "contained" : "text"}
              size="small"
            >
              Pesan
            </Button>
            <Button
              startIcon={<History />}
              onClick={() => router.push("/history")}
              variant={isActive("/history") ? "contained" : "text"}
              size="small"
            >
              Riwayat
            </Button>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {session ? (
          <>
            <Typography variant="body2" sx={{ mr: 1, color: "text.secondary" }}>
              {session.user.name}
            </Typography>
            <IconButton onClick={handleMenu} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
                {session.user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {session.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.user.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Keluar
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button variant="contained" onClick={() => router.push("/login")}>
            Masuk
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
