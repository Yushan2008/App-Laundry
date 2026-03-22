"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box, Typography, Paper, Button, Chip, CircularProgress, Alert,
  Divider, Grid, TextField, InputAdornment,
} from "@mui/material";
import {
  ArrowBack, DirectionsBike, CheckCircle, LocalShipping, Person,
  Phone, LocationOn, Inventory, Scale, PhotoCamera, MyLocation,
  Navigation,
} from "@mui/icons-material";
import SellerSidebar from "@/components/layout/SellerSidebar";
import io from "socket.io-client";
import dynamic from "next/dynamic";

const LiveTrackingMap = dynamic(
  () => import("@/components/map/LiveTrackingMap"),
  { ssr: false, loading: () => <Box height={300} display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box> }
);

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  package: { name: string; pricePerKg: number };
  user: { name: string; email: string; phone: string | null; address: string | null };
  customerLat: number | null;
  customerLng: number | null;
  deliveryFee: number | null;
  weight: number | null;
  weightProofUrl: string | null;
  totalPrice: number | null;
  notes: string | null;
  cancelReason: string | null;
  sellerId: string | null;
}

// Status yang membutuhkan GPS aktif
const GPS_STATUSES = ["CONFIRMED", "PICKED_UP", "OUT_FOR_DELIVERY"];

// Urutan status → tombol berikutnya
const NEXT_STATUS: Record<string, string> = {
  CONFIRMED: "PICKED_UP",
  PROCESSING: "WASHING",
  WASHING: "DRYING",
  DRYING: "READY",
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Tersedia", CONFIRMED: "Dikonfirmasi", PICKED_UP: "Dijemput",
  PROCESSING: "Diproses", WASHING: "Dicuci", DRYING: "Dikeringkan",
  READY: "Siap Antar", OUT_FOR_DELIVERY: "Diantarkan", DELIVERED: "Selesai", CANCELLED: "Dibatalkan",
};
const STATUS_COLOR: Record<string, "warning" | "info" | "success" | "primary" | "default" | "error" | "secondary"> = {
  PENDING: "warning", CONFIRMED: "warning", PICKED_UP: "info", PROCESSING: "secondary",
  WASHING: "primary", DRYING: "secondary", READY: "success", OUT_FOR_DELIVERY: "warning",
  DELIVERED: "default", CANCELLED: "error",
};

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // GPS Tracking
  const [tracking, setTracking] = useState(false);
  const [sellerPos, setSellerPos] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const watchRef = useRef<number | null>(null);

  // Weight confirmation
  const [weightInput, setWeightInput] = useState("");
  const [weightProofUrl, setWeightProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmingWeight, setConfirmingWeight] = useState(false);

  const fetchOrder = useCallback(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => { setOrder(d.order); setLoading(false); })
      .catch(() => { setError("Gagal memuat pesanan"); setLoading(false); });
  }, [id]);

  // Mulai tracking GPS & kirim ke Socket.io + simpan ke DB
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setError("Browser tidak mendukung geolocation"); return; }
    if (watchRef.current) return; // Sudah tracking
    setTracking(true);

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setSellerPos({ lat, lng });

        // Kirim via Socket.io (real-time ke customer)
        socketRef.current?.emit("location-update", { orderId: id, lat, lng });

        // Simpan ke DB (fallback polling untuk customer)
        if (session?.user?.id) {
          fetch(`/api/sellers/${session.user.id}/location`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });
        }
      },
      (err) => {
        console.error("GPS error:", err);
        setError("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi diaktifkan.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, [id, session?.user?.id]);

  const stopTracking = useCallback(() => {
    setTracking(false);
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchOrder();

    // Inisialisasi Socket.io
    const socket = io({ transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect_error", () => {
      // Socket.io tidak tersedia — mode polling saja (sudah di-handle di customer page)
    });

    return () => {
      socket.disconnect();
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [fetchOrder]);

  // Auto-start GPS jika pesanan sudah di status yang membutuhkan tracking
  useEffect(() => {
    if (!order || !session?.user?.id) return;
    const isMine = order.sellerId === session.user.id;
    if (isMine && GPS_STATUSES.includes(order.status) && order.status !== "DELIVERED") {
      startTracking();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, session?.user?.id]);

  // Ambil pesanan (PENDING → CONFIRMED)
  const handleTakeOrder = async () => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}/take`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess("Pesanan berhasil diambil! Silakan segera jemput cucian pelanggan.");
      setOrder(data.order);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengambil pesanan");
    } finally {
      setActionLoading(false);
    }
  };

  // Update status pesanan
  const handleAction = async (newStatus: string) => {
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      if (newStatus === "PICKED_UP") startTracking();
      if (newStatus === "OUT_FOR_DELIVERY") startTracking();
      if (newStatus === "DELIVERED") stopTracking();

      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrder(data.order);
      setSuccess(`Status diperbarui: ${STATUS_LABEL[newStatus]}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Upload foto bukti timbangan
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeightProofUrl(data.url);
      setSuccess("Foto bukti timbangan berhasil diupload");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  // Konfirmasi berat + foto → PROCESSING
  const handleConfirmWeight = async () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) { setError("Berat harus lebih dari 0 kg"); return; }
    if (!weightProofUrl) { setError("Upload foto bukti timbangan terlebih dahulu"); return; }
    setConfirmingWeight(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/orders/${id}/weight`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w, weightProofUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrder(data.order);
      setSuccess(`Berat ${w} kg dikonfirmasi. Pelanggan telah diberitahu total biaya.`);
      setWeightInput("");
      setWeightProofUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal konfirmasi berat");
    } finally {
      setConfirmingWeight(false);
    }
  };

  // Buka Google Maps navigasi ke lokasi pelanggan
  const openGoogleMapsNavigation = () => {
    if (!order?.customerLat || !order?.customerLng) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (loading) return (
    <Box display="flex" minHeight="100vh">
      <SellerSidebar />
      <Box flex={1} display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box>
    </Box>
  );

  const isMine = order?.sellerId === session?.user?.id;
  const isPending = order?.status === "PENDING";
  const isPickedUp = order?.status === "PICKED_UP";
  const nextStatus = order ? NEXT_STATUS[order.status] : null;
  const showMap = order?.customerLat && order?.customerLng && isMine && (
    order.status === "CONFIRMED" || order.status === "PICKED_UP" || order.status === "OUT_FOR_DELIVERY"
  );

  return (
    <Box display="flex" minHeight="100vh">
      <SellerSidebar />
      <Box flex={1} p={3}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>Kembali</Button>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {order?.status === "CANCELLED" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Pesanan Dibatalkan</strong>
            {order.cancelReason && ` — Alasan: ${order.cancelReason}`}
          </Alert>
        )}

        {order && (
          <Grid container spacing={3}>
            {/* Detail Pesanan */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={700}>Detail Pesanan</Typography>
                  <Chip
                    label={STATUS_LABEL[order.status] || order.status}
                    color={STATUS_COLOR[order.status] || "default"}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="text.secondary">Nomor Pesanan</Typography>
                  <Typography variant="body2" fontWeight={700} fontFamily="monospace">{order.orderNumber}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="text.secondary">Paket</Typography>
                  <Chip size="small" label={order.package.name} color="primary" variant="outlined" />
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="text.secondary">Harga/kg</Typography>
                  <Typography variant="body2" fontWeight={600}>Rp {order.package.pricePerKg.toLocaleString("id-ID")}</Typography>
                </Box>

                {order.weight ? (
                  <>
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography variant="body2" color="text.secondary">Berat (konfirmasi)</Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main">{order.weight} kg</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography variant="body2" color="text.secondary">Biaya laundry</Typography>
                      <Typography variant="body2" fontWeight={600}>Rp {order.totalPrice?.toLocaleString("id-ID")}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                      <Typography variant="body2" color="text.secondary">Ongkir</Typography>
                      <Typography variant="body2" fontWeight={600}>Rp {(order.deliveryFee ?? 0).toLocaleString("id-ID")}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={700}>Total</Typography>
                      <Typography variant="body2" fontWeight={800} color="primary.main">
                        Rp {((order.totalPrice ?? 0) + (order.deliveryFee ?? 0)).toLocaleString("id-ID")}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Berat belum dikonfirmasi. Harga akan dihitung setelah Anda input berat aktual.
                  </Alert>
                )}
              </Paper>

              {/* Info Pelanggan */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Info Pelanggan</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                  <Person sx={{ color: "primary.main", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Nama</Typography>
                    <Typography variant="body2" fontWeight={600}>{order.user.name}</Typography>
                  </Box>
                </Box>
                {order.user.phone && (
                  <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                    <Phone sx={{ color: "primary.main", fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Nomor HP</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        <a href={`tel:${order.user.phone}`} style={{ color: "inherit" }}>{order.user.phone}</a>
                      </Typography>
                    </Box>
                  </Box>
                )}
                {order.user.address && (
                  <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                    <LocationOn sx={{ color: "primary.main", fontSize: 20, mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Alamat</Typography>
                      <Typography variant="body2" fontWeight={600}>{order.user.address}</Typography>
                    </Box>
                  </Box>
                )}
                {order.notes && (
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Inventory sx={{ color: "primary.main", fontSize: 20, mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Catatan Pelanggan</Typography>
                      <Typography variant="body2">{order.notes}</Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Panel Aksi */}
            <Grid item xs={12} md={6}>
              {/* Tombol Ambil Pesanan (untuk PENDING) */}
              {isPending && !isMine && (
                <Paper sx={{ p: 3, borderRadius: 3, mb: 2, border: "2px solid", borderColor: "primary.main" }}>
                  <Typography variant="h6" fontWeight={700} mb={1}>Ambil Pesanan Ini?</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Pesanan ini belum diambil oleh seller manapun. Tekan tombol di bawah untuk mengklaim pesanan ini.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<DirectionsBike />}
                    onClick={handleTakeOrder}
                    disabled={actionLoading}
                    sx={{ py: 1.5, fontWeight: 700 }}
                  >
                    {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Ambil Pesanan"}
                  </Button>
                </Paper>
              )}

              {/* Form konfirmasi berat (hanya setelah PICKED_UP) */}
              {isMine && isPickedUp && !order.weight && (
                <Paper sx={{ p: 3, borderRadius: 3, mb: 2, border: "2px dashed", borderColor: "warning.main" }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Scale sx={{ color: "warning.main" }} />
                    <Typography variant="h6" fontWeight={700}>Konfirmasi Berat Cucian</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Timbang cucian pelanggan, upload foto bukti timbangan, lalu masukkan berat aktual.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Berat Aktual (kg)"
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                    sx={{ mb: 2 }}
                    helperText={
                      weightInput
                        ? `Biaya laundry: Rp ${Math.round(order.package.pricePerKg * parseFloat(weightInput)).toLocaleString("id-ID")}`
                        : "Masukkan berat yang tertera di timbangan"
                    }
                  />

                  <input
                    type="file"
                    accept="image/*"
                    id="proof-upload"
                    style={{ display: "none" }}
                    onChange={handleUploadProof}
                    capture="environment"
                  />
                  <label htmlFor="proof-upload">
                    <Button
                      fullWidth
                      variant="outlined"
                      component="span"
                      startIcon={uploading ? <CircularProgress size={16} /> : <PhotoCamera />}
                      disabled={uploading}
                      sx={{ mb: weightProofUrl ? 1 : 2 }}
                      color={weightProofUrl ? "success" : "primary"}
                    >
                      {uploading ? "Mengupload..." : weightProofUrl ? "✓ Foto Terupload — Ganti" : "Upload Foto Bukti Timbangan *"}
                    </Button>
                  </label>

                  {weightProofUrl && (
                    <Box mb={2} textAlign="center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={weightProofUrl} alt="Bukti timbangan" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, objectFit: "cover" }} />
                    </Box>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    size="large"
                    onClick={handleConfirmWeight}
                    disabled={confirmingWeight || !weightInput || !weightProofUrl}
                    sx={{ fontWeight: 700 }}
                  >
                    {confirmingWeight ? <CircularProgress size={20} color="inherit" /> : "Konfirmasi Berat & Lanjut Proses"}
                  </Button>
                </Paper>
              )}

              {/* Tombol aksi status */}
              {isMine && order.status !== "PENDING" && order.status !== "DELIVERED" && order.status !== "CANCELLED" && nextStatus && (
                <Paper sx={{ p: 3, borderRadius: 3, mb: 2 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>Aksi Pesanan</Typography>

                  {/* GPS status indicator */}
                  {tracking ? (
                    <Alert severity="success" icon={<MyLocation />} sx={{ mb: 2 }}>
                      GPS aktif — Lokasi Anda sedang dikirim ke pelanggan secara real-time
                    </Alert>
                  ) : GPS_STATUSES.includes(order.status) ? (
                    <Alert severity="warning" icon={<MyLocation />} sx={{ mb: 2 }} action={
                      <Button size="small" onClick={startTracking} color="warning">Aktifkan</Button>
                    }>
                      GPS belum aktif. Aktifkan agar pelanggan dapat melacak lokasi Anda.
                    </Alert>
                  ) : null}

                  {/* Tombol navigasi Google Maps */}
                  {(order.status === "CONFIRMED" || order.status === "OUT_FOR_DELIVERY") && order.customerLat && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<Navigation />}
                      onClick={openGoogleMapsNavigation}
                      sx={{ mb: 2, fontWeight: 700 }}
                    >
                      Buka Navigasi di Google Maps
                    </Button>
                  )}

                  {/* Tombol next status */}
                  {order.status !== "PICKED_UP" && (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      color={
                        nextStatus === "PICKED_UP" ? "primary" :
                        nextStatus === "OUT_FOR_DELIVERY" ? "warning" :
                        nextStatus === "DELIVERED" ? "success" : "info"
                      }
                      startIcon={
                        nextStatus === "PICKED_UP" ? <DirectionsBike /> :
                        nextStatus === "OUT_FOR_DELIVERY" ? <LocalShipping /> :
                        nextStatus === "DELIVERED" ? <CheckCircle /> : <Inventory />
                      }
                      onClick={() => handleAction(nextStatus)}
                      disabled={actionLoading}
                      sx={{ py: 1.5, fontWeight: 700 }}
                    >
                      {actionLoading
                        ? <CircularProgress size={20} color="inherit" />
                        : nextStatus === "PICKED_UP" ? "Mulai Jemput (GPS ON)"
                        : nextStatus === "WASHING" ? "Mulai Cuci"
                        : nextStatus === "DRYING" ? "Mulai Keringkan"
                        : nextStatus === "READY" ? "Tandai Siap Antar"
                        : nextStatus === "OUT_FOR_DELIVERY" ? "Mulai Antar (GPS ON)"
                        : nextStatus === "DELIVERED" ? "Selesai Antar ✓"
                        : `Lanjut: ${STATUS_LABEL[nextStatus]}`
                      }
                    </Button>
                  )}

                  {order.status === "PICKED_UP" && order.weight && (
                    <Alert severity="success">
                      Berat sudah dikonfirmasi ({order.weight} kg). Lanjutkan proses cuci di atas.
                    </Alert>
                  )}
                  {order.status === "PICKED_UP" && !order.weight && (
                    <Alert severity="warning">
                      Timbang dan konfirmasi berat cucian terlebih dahulu sebelum melanjutkan.
                    </Alert>
                  )}
                </Paper>
              )}

              {/* Peta navigasi ke lokasi pelanggan */}
              {showMap && (
                <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>
                      {order.status === "OUT_FOR_DELIVERY" ? "Navigasi Antar ke Pelanggan" : "Navigasi Jemput ke Pelanggan"}
                    </Typography>
                    {sellerPos && (
                      <Chip size="small" label="GPS Aktif" color="success" icon={<MyLocation sx={{ fontSize: 14 }} />} />
                    )}
                  </Box>
                  <LiveTrackingMap
                    customerLat={order.customerLat!}
                    customerLng={order.customerLng!}
                    sellerLat={sellerPos?.lat}
                    sellerLng={sellerPos?.lng}
                    mode="seller"
                    height={320}
                  />
                </Paper>
              )}

              {/* Bukti timbangan yang sudah dikonfirmasi */}
              {order.weightProofUrl && (
                <Paper sx={{ p: 3, borderRadius: 3, mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    <Scale sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                    Bukti Timbangan
                  </Typography>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.weightProofUrl}
                    alt="Bukti timbangan"
                    style={{ width: "100%", maxHeight: 250, objectFit: "contain", borderRadius: 8 }}
                  />
                </Paper>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
