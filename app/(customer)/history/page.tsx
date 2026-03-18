"use client";

import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
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
  weight: number;
  totalPrice: number;
  createdAt: string;
  package: { name: string; durationDays: number };
}

export default function HistoryPage() {
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Riwayat Pesanan
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Semua pesanan laundry yang pernah Anda buat
        </Typography>

        {/* Filter */}
        <Box sx={{ mb: 3, overflowX: "auto" }}>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, val) => setFilter(val ?? "")}
            size="small"
          >
            {STATUS_FILTERS.map((f) => (
              <ToggleButton key={f.value} value={f.value}>
                {f.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Alert severity="info">
            Tidak ada pesanan{filter ? " dengan status ini" : ""}.
          </Alert>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </Container>
    </Box>
  );
}
