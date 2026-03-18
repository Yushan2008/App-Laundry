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
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  Update,
  Person,
  Email,
  Phone,
  Home,
  LocalOffer,
  Scale,
  Receipt,
  Save,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import StatusStepper from "@/components/order/StatusStepper";
import { useThemeMode } from "@/app/context/ThemeContext";

const STATUS_LIST = [
  { value: "PENDING", label: "Menunggu" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "WASHING", label: "Sedang Dicuci" },
  { value: "DRYING", label: "Pengeringan & Setrika" },
  { value: "READY", label: "Siap Diambil" },
  { value: "DELIVERED", label: "Selesai / Diambil" },
];

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

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  package: { name: string; pricePerKg: number; durationDays: number };
  user: { name: string; email: string; phone: string | null; address: string | null };
  statusHistory: { id: string; status: string; description: string | null; createdAt: string }[];
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
      <Box sx={{ color: "primary.main", mt: 0.1, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [description, setDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Weight input state
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const isDark = mode === "dark";
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const fetchOrder = () => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setOrder(data.order);
          setNewStatus(data.order.status);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data pesanan. Silakan refresh halaman.");
        setLoading(false);
      });
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleSaveWeight = async () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) {
      setError("Berat harus lebih dari 0 kg");
      return;
    }
    setSavingWeight(true);
    setError("");
    setSuccessMsg("");

    const res = await fetch(`/api/orders/${id}/weight`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: w }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal menyimpan berat");
    } else {
      setSuccessMsg(`Berat ${w} kg berhasil disimpan. Total: Rp ${data.order.totalPrice?.toLocaleString("id-ID")}`);
      setOrder(data.order);
      setWeightInput("");
    }
    setSavingWeight(false);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) {
      setError("Pilih status yang berbeda dari status saat ini");
      return;
    }
    setUpdating(true);
    setError("");
    setSuccessMsg("");

    const res = await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, description }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal update status");
      setUpdating(false);
    } else {
      setSuccessMsg(`Status berhasil diperbarui ke "${STATUS_LIST.find(s => s.value === newStatus)?.label}"`);
      setDescription("");
      setUpdating(false);
      fetchOrder(); // refetch untuk pastikan data lengkap
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress sx={{ color: "primary.main" }} />
        </Box>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>Pesanan tidak ditemukan</Alert>
        </Box>
      </Box>
    );
  }

  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            variant="outlined"
            size="small"
            sx={{ borderColor: "divider", color: "text.secondary", flexShrink: 0 }}
          >
            Kembali
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace" fontWeight={600}>
              {order.orderNumber}
            </Typography>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Detail & Kelola Pesanan
            </Typography>
          </Box>
          <Chip label={status.label} color={status.color} sx={{ fontWeight: 700, alignSelf: "center" }} />
          <Button
            startIcon={<Receipt />}
            onClick={() => router.push(`/admin/orders/${order.id}/nota`)}
            variant="contained"
            size="small"
            sx={{
              background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              fontWeight: 700,
              flexShrink: 0,
              alignSelf: "center",
              "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
            }}
          >
            Lihat Nota
          </Button>
        </Box>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg("")}>
            {successMsg}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left — Info + Update */}
          <Grid item xs={12} md={5}>
            {/* Order Info */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                  Info Pesanan
                </Typography>
                <Divider sx={{ mb: 2.5 }} />
                <InfoRow icon={<LocalOffer fontSize="small" />} label="Paket" value={`Paket ${order.package.name}`} />
                <InfoRow
                  icon={<Scale fontSize="small" />}
                  label="Berat"
                  value={order.weight ? `${order.weight} kg` : "Belum ditimbang"}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">Harga/kg</Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Rp {order.package.pricePerKg.toLocaleString("id-ID")}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography fontWeight={700} color="text.primary">Total</Typography>
                  {order.totalPrice ? (
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      Rp {order.totalPrice.toLocaleString("id-ID")}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic" fontWeight={600}>
                      Menunggu input berat
                    </Typography>
                  )}
                </Box>
                {order.notes && (
                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                      CATATAN PELANGGAN
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {order.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                  Info Pelanggan
                </Typography>
                <Divider sx={{ mb: 2.5 }} />
                <InfoRow icon={<Person fontSize="small" />} label="Nama" value={order.user.name} />
                <InfoRow icon={<Email fontSize="small" />} label="Email" value={order.user.email} />
                {order.user.phone && (
                  <InfoRow icon={<Phone fontSize="small" />} label="No. HP" value={order.user.phone} />
                )}
                {order.user.address && (
                  <InfoRow icon={<Home fontSize="small" />} label="Alamat" value={order.user.address} />
                )}
              </CardContent>
            </Card>

            {/* Input Berat — tampil hanya jika belum ditimbang */}
            {!order.weight && (
              <Card
                sx={{
                  mb: 2.5,
                  border: `2px solid`,
                  borderColor: "warning.main",
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    px: 3,
                    py: 2,
                    borderRadius: "10px 10px 0 0",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="white">
                    Input Berat Cucian
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
                    Total harga akan dihitung otomatis setelah berat diisi
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <TextField
                      label="Berat (kg)"
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      inputProps={{ min: 0.1, step: 0.1 }}
                      placeholder="Contoh: 3.5"
                      size="small"
                      sx={{ flex: 1 }}
                      helperText={
                        weightInput
                          ? `Estimasi: Rp ${Math.round(order.package.pricePerKg * parseFloat(weightInput || "0")).toLocaleString("id-ID")}`
                          : "Masukkan berat hasil timbangan"
                      }
                    />
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveWeight}
                      disabled={savingWeight || !weightInput}
                      sx={{
                        mt: 0.5,
                        py: 1,
                        fontWeight: 700,
                        bgcolor: "#f59e0b",
                        "&:hover": { bgcolor: "#d97706" },
                        "&:disabled": { bgcolor: "action.disabledBackground" },
                        flexShrink: 0,
                      }}
                    >
                      {savingWeight ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Update Status */}
            <Card
              sx={{
                border: `2px solid`,
                borderColor: "primary.main",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                  px: 3,
                  py: 2,
                  borderRadius: "10px 10px 0 0",
                }}
              >
                <Typography variant="h6" fontWeight={700} color="white">
                  Update Status Pesanan
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
                  Status saat ini: <strong>{STATUS_LIST.find(s => s.value === order.status)?.label}</strong>
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel>Status Baru</InputLabel>
                  <Select
                    value={newStatus}
                    label="Status Baru"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {STATUS_LIST.map((s) => (
                      <MenuItem key={s.value} value={s.value} disabled={s.value === order.status}>
                        {s.label} {s.value === order.status && "(saat ini)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Catatan Update (opsional)"
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Cucian sedang dalam proses pencucian"
                  sx={{ mb: 2.5 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Update />}
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === order.status}
                  sx={{
                    py: 1.4,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                    "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
                    "&:disabled": { background: theme.palette.action.disabledBackground },
                  }}
                >
                  {updating ? "Memperbarui..." : "Perbarui Status"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right — Timeline */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                  Timeline Status Pesanan
                </Typography>
                <Divider sx={{ mb: 3 }} />
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
