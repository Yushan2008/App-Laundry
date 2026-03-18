"use client";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import {
  Assignment,
  AttachMoney,
  HourglassEmpty,
  People,
  ArrowForward,
  TrendingUp,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useThemeMode } from "@/app/context/ThemeContext";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "primary" | "secondary" | "success" | "error" }
> = {
  PENDING: { label: "Menunggu", color: "warning" },
  PROCESSING: { label: "Diproses", color: "info" },
  WASHING: { label: "Dicuci", color: "primary" },
  DRYING: { label: "Disetrika", color: "secondary" },
  READY: { label: "Siap Diambil", color: "success" },
  DELIVERED: { label: "Selesai", color: "default" },
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  totalPrice: number | null;
  createdAt: string;
  package: { name: string };
  user: { name: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = mode === "dark";

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const activeOrders = orders.filter((o) => o.status !== "DELIVERED");
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: "Pesanan Hari Ini",
      value: todayOrders.length,
      icon: <Assignment />,
      gradient: "linear-gradient(135deg, #4f46e5, #818cf8)",
      shadow: "rgba(79,70,229,0.3)",
    },
    {
      label: "Pesanan Aktif",
      value: activeOrders.length,
      icon: <HourglassEmpty />,
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      shadow: "rgba(245,158,11,0.3)",
    },
    {
      label: "Total Pesanan",
      value: orders.length,
      icon: <People />,
      gradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
      shadow: "rgba(13,148,136,0.3)",
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${(totalRevenue / 1000).toFixed(0)}K`,
      icon: <AttachMoney />,
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      shadow: "rgba(16,185,129,0.3)",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Dashboard Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ringkasan aktivitas Signature Laundry — {new Date().toLocaleDateString("id-ID", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : (
          <>
            {/* Stats Grid */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              {stats.map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Card>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: stat.gradient,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            boxShadow: `0 4px 16px ${stat.shadow}`,
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <TrendingUp sx={{ color: "success.main", fontSize: 18 }} />
                      </Box>
                      <Typography variant="h4" fontWeight={800} color="text.primary">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Orders Table */}
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Pesanan Terbaru
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      5 pesanan terakhir masuk
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => router.push("/admin/orders")}
                    sx={{ color: "primary.main" }}
                  >
                    Lihat Semua
                  </Button>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {["No. Order", "Pelanggan", "Paket", "Berat", "Total", "Status", "Aksi"].map((h) => (
                          <TableCell
                            key={h}
                            sx={{
                              fontWeight: 700,
                              color: "text.secondary",
                              fontSize: 12,
                              letterSpacing: 0.5,
                              borderBottom: `2px solid ${theme.palette.divider}`,
                              pb: 1.5,
                            }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };
                        return (
                          <TableRow
                            key={order.id}
                            hover
                            sx={{ "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(79,70,229,0.02)" } }}
                          >
                            <TableCell sx={{ fontFamily: "monospace", fontSize: 11, color: "text.secondary" }}>
                              {order.orderNumber}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                              {order.user.name}
                            </TableCell>
                            <TableCell sx={{ color: "text.secondary" }}>
                              Paket {order.package.name}
                            </TableCell>
                            <TableCell sx={{ color: order.weight ? "text.secondary" : "text.disabled", fontStyle: order.weight ? "normal" : "italic" }}>
                              {order.weight ? `${order.weight} kg` : "-"}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: order.totalPrice ? "text.primary" : "text.disabled", fontStyle: order.totalPrice ? "normal" : "italic" }}>
                              {order.totalPrice ? `Rp ${order.totalPrice.toLocaleString("id-ID")}` : "Menunggu..."}
                            </TableCell>
                            <TableCell>
                              <Chip label={status.label} color={status.color} size="small" />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                sx={{ borderColor: "divider", color: "primary.main", fontSize: 12 }}
                              >
                                Kelola
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {recentOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.disabled" }}>
                            Belum ada pesanan
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
}
