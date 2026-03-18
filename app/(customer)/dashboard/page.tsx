"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AddCircleOutline, Assignment, CheckCircle, HourglassEmpty } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import OrderCard from "@/components/order/OrderCard";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number;
  totalPrice: number;
  createdAt: string;
  package: { name: string; durationDays: number };
}

export default function DashboardPage() {
  const { data: session } = useSession();
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

  const activeOrders = orders.filter((o) => o.status !== "DELIVERED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Greeting */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            Halo, {session?.user?.name?.split(" ")[0]}!
          </Typography>
          <Typography color="text.secondary">
            Kelola pesanan laundry Anda dengan mudah
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "#eff6ff", borderRadius: 2 }}>
                  <Assignment sx={{ color: "#3b82f6" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{orders.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Pesanan</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "#fff7ed", borderRadius: 2 }}>
                  <HourglassEmpty sx={{ color: "#f59e0b" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{activeOrders.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Pesanan Aktif</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                  <CheckCircle sx={{ color: "#22c55e" }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{completedOrders.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Selesai</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA */}
        <Card sx={{ mb: 4, background: "linear-gradient(135deg, #1e40af, #7c3aed)", color: "white" }}>
          <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Siap Cuci Baju?
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Pesan sekarang, pakaian bersih sesuai jadwal
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={() => router.push("/order/new")}
              sx={{ bgcolor: "white", color: "primary.dark", "&:hover": { bgcolor: "#f1f5f9" }, whiteSpace: "nowrap" }}
            >
              Pesan Sekarang
            </Button>
          </CardContent>
        </Card>

        {/* Pesanan Aktif */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Pesanan Aktif
        </Typography>
        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : activeOrders.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Belum ada pesanan aktif. Yuk, buat pesanan pertamamu!
          </Alert>
        ) : (
          activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </Container>
    </Box>
  );
}
