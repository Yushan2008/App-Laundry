"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  Assignment,
  LocalShipping,
  CheckCircle,
  DirectionsBike,
} from "@mui/icons-material";
import SellerSidebar from "@/components/layout/SellerSidebar";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  package: { name: string };
  user: { name: string; address: string | null };
  customerLat: number | null;
  customerLng: number | null;
  deliveryFee: number | null;
  createdAt: string;
}

const STATUS_COLOR: Record<string, "warning" | "info" | "success" | "primary" | "default"> = {
  CONFIRMED: "warning",
  PICKED_UP: "info",
  READY: "success",
  OUT_FOR_DELIVERY: "primary",
  DELIVERED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Menunggu Dijemput",
  PICKED_UP: "Sudah Dijemput",
  READY: "Siap Diantar",
  OUT_FOR_DELIVERY: "Dalam Pengiriman",
  DELIVERED: "Selesai",
};

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => { setError("Gagal memuat pesanan"); setLoading(false); });
  }, []);

  const activeOrders = orders.filter((o) =>
    ["CONFIRMED", "PICKED_UP", "READY", "OUT_FOR_DELIVERY"].includes(o.status)
  );

  const stats = [
    { label: "Pesanan Aktif", value: activeOrders.length, icon: <Assignment color="primary" />, color: "primary.main" },
    { label: "Dijemput Hari Ini", value: orders.filter((o) => o.status === "PICKED_UP").length, icon: <DirectionsBike color="info" />, color: "info.main" },
    { label: "Sedang Diantar", value: orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length, icon: <LocalShipping color="warning" />, color: "warning.main" },
    { label: "Selesai Total", value: orders.filter((o) => o.status === "DELIVERED").length, icon: <CheckCircle color="success" />, color: "success.main" },
  ];

  return (
    <Box display="flex" minHeight="100vh">
      <SellerSidebar />
      <Box flex={1} p={3}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Selamat datang, {session?.user?.name}!
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Berikut ringkasan aktivitas pengiriman Anda.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Stats */}
        <Grid container spacing={2} mb={3}>
          {stats.map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Paper sx={{ p: 2.5, borderRadius: 3, textAlign: "center" }}>
                {s.icon}
                <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Active Orders */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700}>Pesanan Aktif</Typography>
            <Button variant="outlined" size="small" onClick={() => router.push("/seller/orders")}>
              Lihat Semua
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box textAlign="center" py={4}><CircularProgress /></Box>
          ) : activeOrders.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Assignment sx={{ fontSize: 48, color: "text.disabled" }} />
              <Typography color="text.secondary" mt={1}>Belum ada pesanan aktif</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {activeOrders.map((order) => (
                <Paper key={order.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{order.orderNumber}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user.name} • {order.package.name}
                      </Typography>
                      {order.customerLat && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          📍 {order.user.address || "Lokasi ditentukan di peta"}
                        </Typography>
                      )}
                    </Box>
                    <Box textAlign="right">
                      <Chip
                        size="small"
                        label={STATUS_LABEL[order.status] || order.status}
                        color={STATUS_COLOR[order.status] || "default"}
                      />
                      <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                        {order.deliveryFee != null
                          ? `Ongkir: Rp ${order.deliveryFee.toLocaleString("id-ID")}`
                          : "Ongkir gratis"}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 1.5 }}
                    onClick={() => router.push(`/seller/orders/${order.id}`)}
                  >
                    Kelola Pesanan
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
