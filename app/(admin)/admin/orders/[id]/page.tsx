"use client";

import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Divider, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, useTheme,
  Select, MenuItem, FormControl, InputLabel,
} from "@mui/material";
import {
  ArrowBack, Person, Email, Phone, Home, LocalOffer,
  Scale, Receipt, Store, Cancel, SwapHoriz, ErrorOutline, PhotoCamera,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import StatusStepper from "@/components/order/StatusStepper";
import { useThemeMode } from "@/app/context/ThemeContext";

const STATUS_CONFIG: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "secondary" | "success" | "error" }> = {
  PENDING:          { label: "Menunggu Seller",  color: "warning" },
  CONFIRMED:        { label: "Dikonfirmasi",     color: "secondary" },
  PICKED_UP:        { label: "Dijemput",         color: "info" },
  PROCESSING:       { label: "Diproses",         color: "info" },
  WASHING:          { label: "Dicuci",           color: "primary" },
  DRYING:           { label: "Disetrika",        color: "secondary" },
  READY:            { label: "Siap Antar",       color: "success" },
  OUT_FOR_DELIVERY: { label: "Diantarkan",       color: "warning" },
  DELIVERED:        { label: "Selesai",          color: "default" },
  CANCELLED:        { label: "Dibatalkan",       color: "error" },
};

interface Seller {
  id: string;
  name: string;
  phone: string | null;
  sellerProfile: { businessName: string } | null;
}

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
  seller: Seller | null;
  statusHistory: { id: string; status: string; description: string | null; createdAt: string }[];
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
      <Box sx={{ color: "primary.main", mt: 0.1, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">{label}</Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary">{value}</Typography>
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
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // Seller list (untuk re-assign)
  const [sellerList, setSellerList] = useState<Seller[]>([]);

  // Cancel dialog
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Reassign dialog
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignReason, setReassignReason] = useState("");
  const [newSellerId, setNewSellerId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const isDark = mode === "dark";
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  const isManagedBySeller = !!(order?.seller);
  const isTerminal = ["DELIVERED", "CANCELLED"].includes(order?.status ?? "");

  const fetchOrder = useCallback(() => {
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

  useEffect(() => {
    fetchOrder();
    // Load seller list untuk re-assign
    fetch("/api/sellers")
      .then((r) => r.json())
      .then((d) => setSellerList(d.sellers || []))
      .catch(() => {});
  }, [fetchOrder]);

  // Cancel pesanan
  const handleCancel = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      setError("Alasan pembatalan wajib diisi (minimal 5 karakter)");
      return;
    }
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg("Pesanan berhasil dibatalkan.");
      setCancelOpen(false);
      setCancelReason("");
      fetchOrder();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membatalkan pesanan");
    } finally {
      setCancelling(false);
    }
  };

  // Re-assign seller
  const handleReassign = async () => {
    if (!reassignReason.trim() || reassignReason.trim().length < 5) {
      setError("Alasan re-assign wajib diisi (minimal 5 karakter)");
      return;
    }
    setReassigning(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}/reassign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reassignReason.trim(),
          newSellerId: newSellerId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessMsg(newSellerId
        ? "Seller berhasil diganti. Seller baru akan segera diberitahu."
        : "Seller dihapus. Pesanan kembali ke antrian PENDING."
      );
      setReassignOpen(false);
      setReassignReason("");
      setNewSellerId("");
      fetchOrder();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal re-assign seller");
    } finally {
      setReassigning(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  if (!order) return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Alert severity="error">Pesanan tidak ditemukan</Alert>
      </Box>
    </Box>
  );

  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };
  const availableSellers = sellerList.filter((s) => s.id !== order.seller?.id);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, overflow: "auto" }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
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
            <Typography variant="h5" fontWeight={800} color="text.primary">Detail Pesanan</Typography>
          </Box>
          <Chip label={status.label} color={status.color} sx={{ fontWeight: 700, alignSelf: "center" }} />
          <Button
            startIcon={<Receipt />}
            onClick={() => router.push(`/admin/orders/${order.id}/nota`)}
            variant="contained"
            size="small"
            sx={{ background: "linear-gradient(135deg, #4f46e5, #0d9488)", fontWeight: 700, flexShrink: 0, alignSelf: "center" }}
          >
            Lihat Nota
          </Button>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {/* Banner: pesanan dikelola seller */}
        {isManagedBySeller && (
          <Alert
            severity="info"
            icon={<Store />}
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Pesanan ini sedang dikelola oleh <strong>{order.seller?.sellerProfile?.businessName ?? order.seller?.name}</strong>.
            Admin tidak dapat mengubah status pesanan. Gunakan tombol <strong>Cancel</strong> atau <strong>Re-assign</strong> jika diperlukan.
          </Alert>
        )}

        {/* Banner: pesanan dibatalkan */}
        {order.status === "CANCELLED" && order.cancelReason && (
          <Alert severity="error" icon={<ErrorOutline />} sx={{ mb: 3 }}>
            <strong>Pesanan Dibatalkan —</strong> Alasan: {order.cancelReason}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* LEFT */}
          <Grid item xs={12} md={5}>
            {/* Info Pesanan */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Info Pesanan</Typography>
                <Divider sx={{ mb: 2 }} />
                <InfoRow icon={<LocalOffer fontSize="small" />} label="Paket" value={`Paket ${order.package.name}`} />
                <InfoRow icon={<Scale fontSize="small" />} label="Harga/kg" value={`Rp ${order.package.pricePerKg.toLocaleString("id-ID")}/kg`} />

                {order.weight ? (
                  <>
                    <InfoRow icon={<Scale fontSize="small" />} label="Berat (dikonfirmasi seller)" value={`${order.weight} kg`} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Biaya laundry</Typography>
                      <Typography variant="body2" fontWeight={600}>Rp {order.totalPrice?.toLocaleString("id-ID")}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Ongkir</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {order.deliveryFee === 0 ? "Gratis (Express)" : `Rp ${(order.deliveryFee ?? 0).toLocaleString("id-ID")}`}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography fontWeight={700}>Total</Typography>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        Rp {((order.totalPrice ?? 0) + (order.deliveryFee ?? 0)).toLocaleString("id-ID")}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Berat belum dikonfirmasi seller. Harga akan dihitung setelah seller menimbang cucian.
                  </Alert>
                )}

                {order.notes && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc", border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>CATATAN PELANGGAN</Typography>
                    <Typography variant="body2">{order.notes}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Info Pelanggan */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Info Pelanggan</Typography>
                <Divider sx={{ mb: 2 }} />
                <InfoRow icon={<Person fontSize="small" />} label="Nama" value={order.user.name} />
                <InfoRow icon={<Email fontSize="small" />} label="Email" value={order.user.email} />
                {order.user.phone && <InfoRow icon={<Phone fontSize="small" />} label="No. HP" value={order.user.phone} />}
                {order.user.address && <InfoRow icon={<Home fontSize="small" />} label="Alamat" value={order.user.address} />}
                {order.customerLat && (
                  <InfoRow
                    icon={<Person fontSize="small" />}
                    label="Koordinat"
                    value={`${order.customerLat.toFixed(5)}, ${order.customerLng?.toFixed(5)}`}
                  />
                )}
              </CardContent>
            </Card>

            {/* Info Seller */}
            {order.seller && (
              <Card sx={{ mb: 2.5, border: "1px solid", borderColor: "success.main" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Store fontSize="small" sx={{ color: "success.main" }} />
                    <Typography variant="h6" fontWeight={700}>Seller Bertugas</Typography>
                    <Chip label="Aktif" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  <InfoRow icon={<Person fontSize="small" />} label="Nama Usaha" value={order.seller.sellerProfile?.businessName ?? order.seller.name} />
                  <InfoRow icon={<Person fontSize="small" />} label="Nama Seller" value={order.seller.name} />
                  {order.seller.phone && <InfoRow icon={<Phone fontSize="small" />} label="No. HP" value={order.seller.phone} />}
                  {order.deliveryFee != null && (
                    <InfoRow icon={<LocalOffer fontSize="small" />} label="Ongkir" value={order.deliveryFee === 0 ? "Gratis (Express)" : `Rp ${order.deliveryFee.toLocaleString("id-ID")}`} />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bukti Timbangan */}
            {order.weightProofUrl && (
              <Card sx={{ mb: 2.5 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <PhotoCamera fontSize="small" color="primary" />
                    <Typography variant="h6" fontWeight={700}>Bukti Timbangan Seller</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.weightProofUrl} alt="Bukti timbangan" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8 }} />
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={7}>
            {/* Pesanan belum ada seller — info saja */}
            {!isManagedBySeller && order.status === "PENDING" && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Pesanan ini belum diambil oleh seller manapun. Seller dalam radius 5km dari pelanggan dapat melihat dan mengambil pesanan ini secara mandiri.
              </Alert>
            )}

            {/* Timeline Status */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Timeline Status</Typography>
                <Divider sx={{ mb: 2 }} />
                <StatusStepper currentStatus={order.status} statusHistory={order.statusHistory} />
                <Box mt={3}>
                  {order.statusHistory.map((h) => (
                    <Box key={h.id} sx={{ display: "flex", gap: 2, mb: 1.5, alignItems: "flex-start" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", mt: 0.7, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(h.createdAt).toLocaleString("id-ID")}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {STATUS_CONFIG[h.status]?.label ?? h.status}
                        </Typography>
                        {h.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {h.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Aksi Admin — Cancel + Re-assign */}
            {!isTerminal && (
              <Card sx={{ border: "2px solid", borderColor: "error.light" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="error" gutterBottom>
                    Tindakan Darurat Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Gunakan hanya jika ada masalah serius. Setiap tindakan akan dicatat dan seller/pelanggan akan diberitahu.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setCancelOpen(true)}
                      sx={{ fontWeight: 700 }}
                    >
                      Batalkan Pesanan
                    </Button>
                    {isManagedBySeller && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<SwapHoriz />}
                        onClick={() => setReassignOpen(true)}
                        sx={{ fontWeight: 700 }}
                      >
                        Re-assign Seller
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Dialog Cancel */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>
          <Cancel sx={{ mr: 1, verticalAlign: "middle" }} />
          Batalkan Pesanan {order.orderNumber}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Tindakan ini tidak dapat dibatalkan. Seller dan pelanggan akan diberitahu otomatis.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Alasan Pembatalan *"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Contoh: Pelanggan meminta pembatalan / Seller tidak dapat dihubungi / dll"
            helperText={`${cancelReason.length} karakter (minimal 5)`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling}>Batal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancel}
            disabled={cancelling || cancelReason.trim().length < 5}
            startIcon={cancelling ? <CircularProgress size={16} /> : <Cancel />}
          >
            {cancelling ? "Membatalkan..." : "Konfirmasi Batalkan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Re-assign */}
      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "warning.dark" }}>
          <SwapHoriz sx={{ mr: 1, verticalAlign: "middle" }} />
          Re-assign Seller — {order.orderNumber}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Seller saat ini ({order.seller?.sellerProfile?.businessName ?? order.seller?.name}) akan diberitahu bahwa tugas dialihkan.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Alasan Re-assign *"
            value={reassignReason}
            onChange={(e) => setReassignReason(e.target.value)}
            placeholder="Contoh: Seller tidak dapat dihubungi / Seller mengundurkan diri / dll"
            helperText={`${reassignReason.length} karakter (minimal 5)`}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Seller Baru (opsional)</InputLabel>
            <Select
              value={newSellerId}
              onChange={(e) => setNewSellerId(e.target.value)}
              label="Seller Baru (opsional)"
            >
              <MenuItem value="">
                <em>— Kembalikan ke antrian PENDING —</em>
              </MenuItem>
              {availableSellers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.sellerProfile?.businessName ?? s.name} ({s.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Jika tidak memilih seller baru, pesanan akan kembali ke PENDING dan dapat diambil oleh seller lain.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setReassignOpen(false)} disabled={reassigning}>Batal</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleReassign}
            disabled={reassigning || reassignReason.trim().length < 5}
            startIcon={reassigning ? <CircularProgress size={16} color="inherit" /> : <SwapHoriz />}
          >
            {reassigning ? "Memproses..." : "Konfirmasi Re-assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
