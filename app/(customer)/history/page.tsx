"use client";

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Chip,
  useTheme,
} from "@mui/material";
import { History, SearchOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import OrderCard from "@/components/order/OrderCard";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "WASHING", label: "Dicuci" },
  { value: "DRYING", label: "Disetrika" },
  { value: "READY", label: "Siap Diambil" },
  { value: "DELIVERED", label: "Selesai" },
];

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  totalPrice: number | null;
  createdAt: string;
  package: { name: string; durationDays: number };
}

export default function HistoryPage() {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchOrders = (status: string) => {
    setLoading(true);
    const url = status ? `/api/orders?status=${status}` : "/api/orders";
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />

      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)",
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
              }}
            >
              <History sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="white">
                Riwayat Pesanan
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                Semua pesanan laundry yang pernah Anda buat
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Filter Chips */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            mb: 3,
          }}
        >
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              onClick={() => setFilter(f.value)}
              variant={filter === f.value ? "filled" : "outlined"}
              color={filter === f.value ? "primary" : "default"}
              sx={{
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                ...(filter !== f.value && {
                  borderColor: theme.palette.divider,
                  color: "text.secondary",
                }),
              }}
            />
          ))}
        </Box>

        {/* Results */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ color: "primary.main" }} />
          </Box>
        ) : orders.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <SearchOff sx={{ fontSize: 52, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
              Tidak ada pesanan
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {filter ? `Tidak ada pesanan dengan status "${STATUS_FILTERS.find(f => f.value === filter)?.label}"` : "Belum ada pesanan laundry"}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Menampilkan {orders.length} pesanan
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
