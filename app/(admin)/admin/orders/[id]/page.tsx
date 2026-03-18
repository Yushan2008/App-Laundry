"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { ArrowBack, Update } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import StatusStepper from "@/components/order/StatusStepper";

const STATUS_LIST = [
  { value: "PENDING", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "WASHING", label: "Sedang Dicuci" },
  { value: "DRYING", label: "Pengeringan & Setrika" },
  { value: "READY", label: "Siap Diambil" },
  { value: "DELIVERED", label: "Selesai / Diambil" },
];

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

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [description, setDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setOrder(data.order);
          setNewStatus(data.order.status);
        }
        setLoading(false);
      });
  };

  useEffect(() => { fetchOrder(); }, [params.id]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) {
      setError("Pilih status yang berbeda");
      return;
    }
    setUpdating(true);
    setError("");
    setSuccessMsg("");

    const res = await fetch(`/api/orders/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, description }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal update status");
    } else {
      setSuccessMsg("Status berhasil diperbarui");
      setDescription("");
      setOrder(data.order);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Alert severity="error">Pesanan tidak ditemukan</Alert>
        </Box>
      </Box>
    );
  }

  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => router.back()} variant="outlined" size="small">
            Kembali
          </Button>
          <Box>
            <Typography variant="body2" color="text.secondary">{order.orderNumber}</Typography>
            <Typography variant="h5" fontWeight={700}>Detail Pesanan</Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Chip label={status.label} color={status.color} sx={{ fontWeight: 700 }} />
          </Box>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Info Pesanan + Update Status */}
          <Grid item xs={12} md={5}>
            {/* Info Pesanan */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Info Pesanan</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="text.secondary">Paket</Typography>
                  <Typography fontWeight={600}>Paket {order.package.name}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="text.secondary">Berat</Typography>
                  <Typography fontWeight={600}>{order.weight} kg</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="text.secondary">Harga/kg</Typography>
                  <Typography fontWeight={600}>Rp {order.package.pricePerKg.toLocaleString("id-ID")}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontWeight={700}>Total</Typography>
                  <Typography fontWeight={700} color="primary.main">
                    Rp {order.totalPrice.toLocaleString("id-ID")}
                  </Typography>
                </Box>
                {order.notes && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Catatan Pelanggan</Typography>
                    <Typography variant="body2">{order.notes}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Info Pelanggan */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Info Pelanggan</Typography>
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

            {/* Update Status */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Update Status</Typography>
                <Divider sx={{ mb: 2 }} />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status Baru</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status Baru"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {STATUS_LIST.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Catatan (opsional)"
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Cucian sedang dalam proses pencucian"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Update />}
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === order.status}
                >
                  {updating ? "Memperbarui..." : "Perbarui Status"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Tracking Timeline */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Timeline Status</Typography>
                <Divider sx={{ mb: 2 }} />
                <StatusStepper
                  currentStatus={order.status}
                  statusHistory={order.statusHistory}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
