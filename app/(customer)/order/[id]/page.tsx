"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { ArrowBack, Scale, LocalOffer, CalendarToday } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import StatusStepper from "@/components/order/StatusStepper";

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
  notes: string | null;
  createdAt: string;
  package: { name: string; pricePerKg: number; durationDays: number };
  user: { name: string; email: string; phone: string | null; address: string | null };
  statusHistory: { id: string; status: string; description: string | null; createdAt: string }[];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Navbar />
        <Box textAlign="center" py={8}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Alert severity="error">{error || "Pesanan tidak ditemukan"}</Alert>
        </Container>
      </Box>
    );
  }

  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };
  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + order.package.durationDays);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            variant="outlined"
            size="small"
          >
            Kembali
          </Button>
          <Box>
            <Typography variant="body2" color="text.secondary">{order.orderNumber}</Typography>
            <Typography variant="h5" fontWeight={700}>
              Detail Pesanan
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Chip label={status.label} color={status.color} sx={{ fontWeight: 700 }} />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Info Pesanan */}
          <Grid item xs={12} md={5}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Informasi Pesanan
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <LocalOffer color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Paket</Typography>
                    <Typography fontWeight={600}>Paket {order.package.name}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Scale color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Berat</Typography>
                    <Typography fontWeight={600}>{order.weight} kg</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tanggal Pesan</Typography>
                    <Typography fontWeight={600}>
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CalendarToday color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Estimasi Selesai</Typography>
                    <Typography fontWeight={600}>
                      {estimatedDate.toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </Typography>
                  </Box>
                </Box>

                {order.notes && (
                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Catatan</Typography>
                    <Typography variant="body2">{order.notes}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">Total Harga</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={700}>
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Info Pelanggan */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Info Pelanggan
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2"><strong>Nama:</strong> {order.user.name}</Typography>
                <Typography variant="body2" mt={0.5}><strong>Email:</strong> {order.user.email}</Typography>
                {order.user.phone && (
                  <Typography variant="body2" mt={0.5}><strong>HP:</strong> {order.user.phone}</Typography>
                )}
                {order.user.address && (
                  <Typography variant="body2" mt={0.5}><strong>Alamat:</strong> {order.user.address}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Tracking Status */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Tracking Status Pesanan
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <StatusStepper
                  currentStatus={order.status}
                  statusHistory={order.statusHistory}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
