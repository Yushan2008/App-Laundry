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
  useTheme,
} from "@mui/material";
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
  package: { name: string };
  user: { name: string; phone: string | null };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const isDark = mode === "dark";

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

  useEffect(() => { fetchOrders(filter); }, [filter]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Kelola Pesanan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daftar semua pesanan pelanggan — update status pesanan di sini
          </Typography>
        </Box>

        {/* Filter Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
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

        <Card>
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
                      {["No. Order", "Pelanggan", "No. HP", "Paket", "Berat", "Total", "Tanggal", "Status", "Aksi"].map((h) => (
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
                    {orders.map((order) => {
                      const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };
                      return (
                        <TableRow
                          key={order.id}
                          hover
                          sx={{
                            "&:hover": {
                              bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(79,70,229,0.02)",
                            },
                          }}
                        >
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 11, color: "text.secondary", px: 2 }}>
                            {order.orderNumber}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "text.primary", px: 2 }}>
                            {order.user.name}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", px: 2 }}>
                            {order.user.phone || "-"}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", px: 2 }}>
                            Paket {order.package.name}
                          </TableCell>
                          <TableCell sx={{ color: order.weight ? "text.secondary" : "text.disabled", fontStyle: order.weight ? "normal" : "italic", px: 2 }}>
                            {order.weight ? `${order.weight} kg` : "Belum ditimbang"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, px: 2 }}>
                            {order.totalPrice ? (
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                Rp {order.totalPrice.toLocaleString("id-ID")}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                Menunggu...
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ color: "text.secondary", fontSize: 12, px: 2 }}>
                            {new Date(order.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell sx={{ px: 2 }}>
                            <Chip label={status.label} color={status.color} size="small" />
                          </TableCell>
                          <TableCell sx={{ px: 2 }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => router.push(`/admin/orders/${order.id}`)}
                              sx={{
                                background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                                fontSize: 12,
                                py: 0.5,
                                px: 1.5,
                              }}
                            >
                              Kelola
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: "text.disabled" }}>
                          Tidak ada pesanan{filter ? " dengan status ini" : ""}
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
