"use client";

import {
  Box,
  Container,
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
  Paper,
} from "@mui/material";
import {
  Assignment,
  AttachMoney,
  HourglassEmpty,
  People,
  ArrowForward,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "secondary" | "success" | "error" }> = {
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
  weight: number;
  totalPrice: number;
  createdAt: string;
  package: { name: string };
  user: { name: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
  const activeOrders = orders.filter((o) => !["DELIVERED"].includes(o.status));
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard Admin
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Ringkasan aktivitas Signature Laundry hari ini
        </Typography>

        {loading ? (
          <Box textAlign="center" py={8}><CircularProgress /></Box>
        ) : (
          <>
            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { label: "Pesanan Hari Ini", value: todayOrders.length, icon: <Assignment />, color: "#3b82f6", bg: "#eff6ff" },
                { label: "Pesanan Aktif", value: activeOrders.length, icon: <HourglassEmpty />, color: "#f59e0b", bg: "#fff7ed" },
                { label: "Total Pesanan", value: orders.length, icon: <People />, color: "#8b5cf6", bg: "#f5f3ff" },
                { label: "Total Pendapatan", value: `Rp ${(totalRevenue / 1000).toFixed(0)}K`, icon: <AttachMoney />, color: "#22c55e", bg: "#f0fdf4" },
              ].map((stat) => (
                <Grid item xs={12} sm={6} md={3} key={stat.label}>
                  <Card>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ p: 1.5, bgcolor: stat.bg, borderRadius: 2, color: stat.color }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
                        <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pesanan Terbaru */}
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Pesanan Terbaru
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => router.push("/admin/orders")}
                  >
                    Lihat Semua
                  </Button>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 700 }}>No. Order</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pelanggan</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Paket</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Berat</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };
                        return (
                          <TableRow key={order.id} hover>
                            <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                              {order.orderNumber}
                            </TableCell>
                            <TableCell>{order.user.name}</TableCell>
                            <TableCell>Paket {order.package.name}</TableCell>
                            <TableCell>{order.weight} kg</TableCell>
                            <TableCell>Rp {order.totalPrice.toLocaleString("id-ID")}</TableCell>
                            <TableCell>
                              <Chip label={status.label} color={status.color} size="small" />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                              >
                                Detail
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {recentOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ color: "text.secondary" }}>
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
