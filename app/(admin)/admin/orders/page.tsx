"use client";

import {
  Box,
  Typography,
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
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
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
  package: { name: string };
  user: { name: string; phone: string | null };
}

export default function AdminOrdersPage() {
  const router = useRouter();
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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Kelola Pesanan
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Daftar semua pesanan pelanggan
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
              <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Card>
          <CardContent>
            {loading ? (
              <Box textAlign="center" py={4}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 700 }}>No. Order</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pelanggan</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>HP</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Paket</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Berat</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tanggal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => {
                      const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };
                      return (
                        <TableRow key={order.id} hover>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>{order.user.name}</TableCell>
                          <TableCell>{order.user.phone || "-"}</TableCell>
                          <TableCell>Paket {order.package.name}</TableCell>
                          <TableCell>{order.weight} kg</TableCell>
                          <TableCell>Rp {order.totalPrice.toLocaleString("id-ID")}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </TableCell>
                          <TableCell>
                            <Chip label={status.label} color={status.color} size="small" />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                            >
                              Kelola
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ color: "text.secondary", py: 4 }}>
                          Tidak ada pesanan
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
