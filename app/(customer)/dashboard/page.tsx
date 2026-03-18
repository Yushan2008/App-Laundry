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
  useTheme,
} from "@mui/material";
import {
  AddCircleOutline,
  Assignment,
  CheckCircle,
  HourglassEmpty,
  ArrowForward,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import OrderCard from "@/components/order/OrderCard";
import { useThemeMode } from "@/app/context/ThemeContext";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  totalPrice: number | null;
  createdAt: string;
  package: { name: string; durationDays: number };
}

const statCards = (total: number, active: number, done: number) => [
  {
    label: "Total Pesanan",
    value: total,
    icon: <Assignment />,
    color: "#4f46e5",
    bg: "rgba(79,70,229,0.12)",
    gradient: "linear-gradient(135deg, #4f46e5, #818cf8)",
  },
  {
    label: "Pesanan Aktif",
    value: active,
    icon: <HourglassEmpty />,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  },
  {
    label: "Selesai",
    value: done,
    icon: <CheckCircle />,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
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

  const activeOrders = orders.filter((o) => o.status !== "DELIVERED");
  const completedOrders = orders.filter((o) => o.status === "DELIVERED");
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const stats = statCards(orders.length, activeOrders.length, completedOrders.length);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />

      {/* Header Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0d9488 100%)",
          py: 5,
          px: { xs: 2, md: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
            Halo, {firstName}! 👋
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}>
            Kelola pesanan laundry Anda dengan mudah dan cepat
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => router.push("/order/new")}
            sx={{
              bgcolor: "white",
              color: "#4f46e5",
              fontWeight: 700,
              "&:hover": { bgcolor: "#f1f5f9" },
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            Pesan Laundry Baru
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Card sx={{ overflow: "visible" }}>
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      background: stat.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      flexShrink: 0,
                      boxShadow: `0 4px 16px ${stat.bg}`,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Active Orders */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Pesanan Aktif
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeOrders.length} pesanan sedang diproses
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => router.push("/history")}
            sx={{ color: "primary.main" }}
          >
            Lihat Semua
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : activeOrders.length === 0 ? (
          <Card
            sx={{
              textAlign: "center",
              py: 6,
              border: `2px dashed ${theme.palette.divider}`,
              boxShadow: "none",
              bgcolor: "transparent",
            }}
          >
            <LocalLaundryServiceIcon />
            <Typography variant="h6" fontWeight={600} color="text.secondary" mt={2}>
              Belum ada pesanan aktif
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              Yuk, buat pesanan laundry pertamamu!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={() => router.push("/order/new")}
              sx={{
                background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              }}
            >
              Pesan Sekarang
            </Button>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

// Inline icon component for empty state
function LocalLaundryServiceIcon() {
  return (
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "rgba(79,70,229,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
      }}
    >
      <Assignment sx={{ fontSize: 32, color: "primary.main", opacity: 0.6 }} />
    </Box>
  );
}
