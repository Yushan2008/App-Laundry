"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Chip,
  useTheme,
} from "@mui/material";
import { People } from "@mui/icons-material";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useThemeMode } from "@/app/context/ThemeContext";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

const AVATAR_COLORS = [
  "linear-gradient(135deg, #4f46e5, #818cf8)",
  "linear-gradient(135deg, #0d9488, #2dd4bf)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  "linear-gradient(135deg, #ef4444, #f87171)",
  "linear-gradient(135deg, #10b981, #34d399)",
];

export default function AdminUsersPage() {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = mode === "dark";

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "rgba(79,70,229,0.1)",
                color: "primary.main",
              }}
            >
              <People fontSize="small" />
            </Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Data Pelanggan
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Semua pelanggan yang terdaftar di Signature Laundry
          </Typography>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: 2.5,
              bgcolor: isDark ? "rgba(79,70,229,0.12)" : "rgba(79,70,229,0.06)",
              border: `1px solid rgba(79,70,229,0.2)`,
            }}
          >
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {users.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Total Pelanggan
            </Typography>
          </Box>
        </Box>

        <Card sx={{ overflow: "hidden" }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <CircularProgress sx={{ color: "primary.main" }} />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {["Pelanggan", "Email", "No. HP", "Alamat", "Pesanan", "Bergabung"].map((h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            fontSize: 12,
                            letterSpacing: 0.5,
                            bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                            borderBottom: `2px solid ${theme.palette.divider}`,
                            py: 2,
                            px: 2,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          "&:hover": {
                            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(79,70,229,0.02)",
                          },
                        }}
                      >
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                background: AVATAR_COLORS[index % AVATAR_COLORS.length],
                                fontSize: 14,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {user.name[0].toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: 13, px: 2 }}>
                          {user.email}
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: 13, px: 2 }}>
                          {user.phone || (
                            <Typography variant="caption" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ px: 2, maxWidth: 180 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
                          >
                            {user.address || (
                              <Typography component="span" variant="caption" color="text.disabled">
                                —
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 2 }}>
                          <Chip
                            label={`${user._count?.orders || 0} pesanan`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: isDark ? "rgba(79,70,229,0.15)" : "rgba(79,70,229,0.08)",
                              color: "primary.main",
                              border: "1px solid rgba(79,70,229,0.2)",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "text.secondary", fontSize: 12, px: 2 }}>
                          {new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.disabled" }}>
                          Belum ada pelanggan terdaftar
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
