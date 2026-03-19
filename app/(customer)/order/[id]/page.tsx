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
  Cancel,
  HourglassTop,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import StatusStepper from "@/components/order/StatusStepper";
import { useThemeMode } from "@/app/context/ThemeContext";
import dynamic from "next/dynamic";
import io from "socket.io-client";

const LiveTrackingMap = dynamic(
  () => import("@/components/map/LiveTrackingMap"),
  { ssr: false, loading: () => <CircularProgress /> }
);

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "default" | "warning" | "info" | "primary" | "secondary" | "success" | "error"; dot: string }
> = {
  PENDING: { label: "Menunggu", color: "warning", dot: "#f59e0b" },
  CONFIRMED: { label: "Dikonfirmasi", color: "secondary", dot: "#8b5cf6" },
  PICKED_UP: { label: "Dijemput", color: "info", dot: "#3b82f6" },
  PROCESSING: { label: "Diproses", color: "info", dot: "#06b6d4" },
  WASHING: { label: "Dicuci", color: "primary", dot: "#4f46e5" },
  DRYING: { label: "Disetrika", color: "secondary", dot: "#0d9488" },
  READY: { label: "Siap Diambil", color: "success", dot: "#10b981" },
  OUT_FOR_DELIVERY: { label: "Dalam Pengiriman", color: "warning", dot: "#f97316" },
  DELIVERED: { label: "Selesai", color: "default", dot: "#64748b" },
  CANCELLED: { label: "Dibatalkan", color: "error", dot: "#ef4444" },
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  weightProofUrl: string | null;
  totalPrice: number | null;
  deliveryFee: number | null;
  customerLat: number | null;
  customerLng: number | null;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  package: { name: string; pricePerKg: number; durationDays: number };
  user: { name: string; email: string; phone: string | null; address: string | null };
  seller: { name: string; phone: string | null } | null;
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
  const [sellerPos, setSellerPos] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

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

    // Connect Socket.io untuk lacak seller
    socketRef.current = io();
    socketRef.current.emit("track-order", id);
    socketRef.current.on("seller-location", (pos: { lat: number; lng: number }) => {
      setSellerPos(pos);
    });

    return () => { socketRef.current?.disconnect(); };
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

        {/* Banner Dibatalkan */}
        {order.status === "CANCELLED" && (
          <Alert
            severity="error"
            icon={<Cancel />}
            sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
          >
            <Typography variant="body2" fontWeight={700} mb={order.cancelReason ? 0.5 : 0}>
              Pesanan ini telah dibatalkan oleh admin.
            </Typography>
            {order.cancelReason && (
              <Typography variant="caption" display="block">
                Alasan: {order.cancelReason}
              </Typography>
            )}
          </Alert>
        )}

        {/* Banner Menunggu Berat */}
        {!order.weight && !["PENDING", "CANCELLED"].includes(order.status) && (
          <Alert severity="warning" icon={<HourglassTop />} sx={{ mb: 3, borderRadius: 2 }}>
            Seller sedang dalam proses menjemput dan menimbang cucian Anda. Harga total akan dikonfirmasi setelah penimbangan selesai.
          </Alert>
        )}

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
                  value={order.weight ? `${order.weight} kg` : "Menunggu konfirmasi berat dari seller"}
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
                {order.totalPrice ? (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Laundry ({order.weight} kg × Rp {order.package.pricePerKg.toLocaleString("id-ID")})
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>Rp {order.totalPrice.toLocaleString("id-ID")}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Ongkir</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {order.deliveryFee != null
                          ? order.deliveryFee === 0 ? "Gratis" : `Rp ${order.deliveryFee.toLocaleString("id-ID")}`
                          : "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body1" fontWeight={700} color="text.primary">Total Harga</Typography>
                      <Typography variant="h5" color="primary.main" fontWeight={800}>
                        Rp {(order.totalPrice + (order.deliveryFee ?? 0)).toLocaleString("id-ID")}
                      </Typography>
                    </Box>
                  </>
                ) : order.status === "CANCELLED" ? (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body1" fontWeight={700} color="text.primary">Total Harga</Typography>
                    <Typography variant="body2" color="error" fontWeight={600}>Pesanan dibatalkan</Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(234,179,8,0.08)" : "#fefce8",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <HourglassTop sx={{ fontSize: 18, color: "warning.main" }} />
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="warning.dark">
                        Menunggu konfirmasi berat dari seller
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Harga akan ditampilkan setelah seller menimbang cucian
                      </Typography>
                    </Box>
                  </Box>
                )}
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

                {/* Peta tracking real-time saat seller menuju/mengantarkan */}
                {(order.status === "OUT_FOR_DELIVERY" || order.status === "CONFIRMED") && order.customerLat && order.customerLng && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="warning.main">
                      🛵 Seller sedang dalam perjalanan — lacak di bawah ini
                    </Typography>
                    {order.seller && (
                      <Typography variant="caption" color="text.secondary" mb={1} display="block">
                        Seller: {order.seller.name} {order.seller.phone && `• ${order.seller.phone}`}
                      </Typography>
                    )}
                    <LiveTrackingMap
                      customerLat={order.customerLat}
                      customerLng={order.customerLng}
                      sellerLat={sellerPos?.lat}
                      sellerLng={sellerPos?.lng}
                      mode="customer"
                    />
                    {!sellerPos && (
                      <Typography variant="caption" color="text.secondary" mt={1} display="block">
                        Menunggu seller membagikan lokasi...
                      </Typography>
                    )}
                  </Box>
                )}

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
