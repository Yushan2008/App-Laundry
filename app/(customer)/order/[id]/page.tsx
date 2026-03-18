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
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  Scale,
  LocalOffer,
  CalendarToday,
  Person,
  Email,
  Phone,
  Home,
  Receipt,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import StatusStepper from "@/components/order/StatusStepper";
import { useThemeMode } from "@/app/context/ThemeContext";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "primary" | "secondary" | "success" | "error"; dot: string }
> = {
  PENDING: { label: "Menunggu", color: "warning", dot: "#f59e0b" },
  PROCESSING: { label: "Diproses", color: "info", dot: "#3b82f6" },
  WASHING: { label: "Dicuci", color: "primary", dot: "#4f46e5" },
  DRYING: { label: "Disetrika", color: "secondary", dot: "#0d9488" },
  READY: { label: "Siap Diambil", color: "success", dot: "#10b981" },
  DELIVERED: { label: "Selesai", color: "default", dot: "#64748b" },
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2.5 }}>
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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isDark = mode === "dark";
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data pesanan. Silakan refresh halaman.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />
        <Box sx={{ textAlign: "center", py: 10 }}>
          <CircularProgress sx={{ color: "primary.main" }} />
        </Box>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error || "Pesanan tidak ditemukan"}
          </Alert>
        </Container>
      </Box>
    );
  }

  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default", dot: "#64748b" };
  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + order.package.durationDays);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
              Detail Pesanan
            </Typography>
          </Box>
          <Chip
            label={status.label}
            color={status.color}
            sx={{ fontWeight: 700, alignSelf: "center" }}
          />
          <Button
            startIcon={<Receipt />}
            onClick={() => router.push(`/order/${order.id}/nota`)}
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

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={5}>
            {/* Order Info Card */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                  Informasi Pesanan
                </Typography>
                <Divider sx={{ mb: 2.5 }} />

                <InfoRow
                  icon={<LocalOffer fontSize="small" />}
                  label="Paket"
                  value={`Paket ${order.package.name}`}
                />
                <InfoRow
                  icon={<Scale fontSize="small" />}
                  label="Berat Cucian"
                  value={order.weight ? `${order.weight} kg` : "Belum ditimbang"}
                />
                <InfoRow
                  icon={<CalendarToday fontSize="small" />}
                  label="Tanggal Pesan"
                  value={new Date(order.createdAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  icon={<CalendarToday fontSize="small" />}
                  label="Estimasi Selesai"
                  value={estimatedDate.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />

                {order.notes && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                      border: `1px solid ${theme.palette.divider}`,
                      mb: 2.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                      CATATAN
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {order.notes}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    Total Harga
                  </Typography>
                  {order.totalPrice ? (
                    <Typography variant="h5" color="primary.main" fontWeight={800}>
                      Rp {order.totalPrice.toLocaleString("id-ID")}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic" fontWeight={600}>
                      Menunggu konfirmasi admin...
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Customer Info Card */}
            <Card>
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
          </Grid>

          {/* Right Column — Tracking */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: status.dot,
                      boxShadow: `0 0 8px ${status.dot}`,
                      animation: order.status !== "DELIVERED" ? "pulse 2s infinite" : "none",
                      "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.4 },
                        "100%": { opacity: 1 },
                      },
                    }}
                  />
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Tracking Status Pesanan
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
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
