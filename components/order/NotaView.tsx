"use client";

import {
  Box,
  Typography,
  Divider,
  Grid,
  Chip,
  useTheme,
} from "@mui/material";
import {
  LocalLaundryService,
  Person,
  Email,
  Phone,
  Home,
  Scale,
  LocalOffer,
  CalendarToday,
  Receipt,
  Speed,
} from "@mui/icons-material";
import StatusStepper from "@/components/order/StatusStepper";
import { useThemeMode } from "@/app/context/ThemeContext";

interface NotaOrder {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  totalPrice: number | null;
  deliveryFee: number | null;
  notes: string | null;
  createdAt: string;
  package: { name: string; pricePerKg: number; durationDays: number };
  user: { name: string; email: string; phone: string | null; address: string | null };
  seller?: { name: string; phone: string | null; sellerProfile?: { businessName: string } | null } | null;
  statusHistory: { id: string; status: string; description: string | null; createdAt: string }[];
}

const STATUS_CHIP: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "secondary" | "success" }> = {
  PENDING:          { label: "Menunggu",          color: "warning" },
  CONFIRMED:        { label: "Dikonfirmasi",       color: "secondary" },
  PICKED_UP:        { label: "Dijemput",           color: "info" },
  PROCESSING:       { label: "Diproses",           color: "info" },
  WASHING:          { label: "Dicuci",             color: "primary" },
  DRYING:           { label: "Disetrika",          color: "secondary" },
  READY:            { label: "Siap Diantar",       color: "success" },
  OUT_FOR_DELIVERY: { label: "Dalam Pengiriman",   color: "warning" },
  DELIVERED:        { label: "Selesai",            color: "default" },
};

function NRow({ icon, label, value, muted }: { icon: React.ReactNode; label: string; value: string; muted?: boolean }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 1.5 }}>
      <Box sx={{ color: "primary.main", mt: 0.15, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} color={muted ? "text.disabled" : "text.primary"} sx={{ fontStyle: muted ? "italic" : "normal" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default function NotaView({ order }: { order: NotaOrder }) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const isExpress = order.package.name === "Express";
  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + order.package.durationDays);
  const statusInfo = STATUS_CHIP[order.status] ?? { label: order.status, color: "default" as const };

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(79,70,229,0.10)",
      }}
    >
      {/* ── KOP ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0d9488 100%)",
          px: { xs: 3, sm: 5 },
          py: 4,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <LocalLaundryService sx={{ fontSize: 32, color: "white" }} />
        </Box>
        <Typography variant="h5" fontWeight={800} color="white" letterSpacing={0.5}>
          Signature Laundry
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", mt: 0.5 }}>
          Pakaian bersih tanpa repot, cukup dari genggaman tangan
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            px: 2.5,
            py: 0.8,
            mt: 2.5,
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <Receipt sx={{ fontSize: 14, color: "white" }} />
          <Typography variant="caption" fontWeight={700} color="white" letterSpacing={1.2}>
            BUKTI PESANAN
          </Typography>
        </Box>
      </Box>

      {/* ── META (nomor + tanggal + status) ── */}
      <Box
        sx={{
          px: { xs: 3, sm: 5 },
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
            NO. PESANAN
          </Typography>
          <Typography variant="body1" fontWeight={800} fontFamily="monospace" color="primary.main">
            {order.orderNumber}
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "center" } }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
            TANGGAL PESAN
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {new Date(order.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {/* ── BODY ── */}
      <Box sx={{ px: { xs: 3, sm: 5 }, py: 3.5 }}>

        {/* Info Pelanggan */}
        <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
          Informasi Pelanggan
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            mb: 3.5,
            p: 2.5,
            borderRadius: 2.5,
            bgcolor: isDark ? "rgba(79,70,229,0.07)" : "rgba(79,70,229,0.04)",
            border: `1px solid ${isDark ? "rgba(79,70,229,0.2)" : "rgba(79,70,229,0.12)"}`,
          }}
        >
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6}>
              <NRow icon={<Person fontSize="small" />} label="Nama Lengkap" value={order.user.name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NRow icon={<Email fontSize="small" />} label="Email" value={order.user.email} />
            </Grid>
            {order.user.phone && (
              <Grid item xs={12} sm={6}>
                <NRow icon={<Phone fontSize="small" />} label="No. HP" value={order.user.phone} />
              </Grid>
            )}
            {order.user.address && (
              <Grid item xs={12} sm={6}>
                <NRow icon={<Home fontSize="small" />} label="Alamat Kos" value={order.user.address} />
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Detail Pesanan */}
        <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
          Detail Pesanan
        </Typography>

        {/* Badge Paket */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: 1.5,
            mb: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: isExpress ? "rgba(245,158,11,0.08)" : "rgba(79,70,229,0.06)",
            border: `1px solid ${isExpress ? "rgba(245,158,11,0.2)" : "rgba(79,70,229,0.15)"}`,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: isExpress ? "rgba(245,158,11,0.15)" : "rgba(79,70,229,0.12)",
              color: isExpress ? "#f59e0b" : "#4f46e5",
            }}
          >
            {isExpress ? <Speed fontSize="small" /> : <LocalLaundryService fontSize="small" />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              Paket {order.package.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Estimasi {order.package.durationDays} hari kerja
            </Typography>
          </Box>
          {isExpress && (
            <Chip label="Prioritas" size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 700, height: 22 }} />
          )}
        </Box>

        {/* Baris kalkulasi */}
        {[
          { label: "Harga per kg",    value: `Rp ${order.package.pricePerKg.toLocaleString("id-ID")}`,  icon: <LocalOffer sx={{ fontSize: 15 }} />, muted: false },
          { label: "Berat cucian",    value: order.weight ? `${order.weight} kg` : "Belum ditimbang",    icon: <Scale sx={{ fontSize: 15 }} />,      muted: !order.weight },
          { label: "Estimasi selesai",value: estimatedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }), icon: <CalendarToday sx={{ fontSize: 15 }} />, muted: false },
        ].map((row) => (
          <Box
            key={row.label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 1.25,
              borderBottom: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              {row.icon}
              <Typography variant="body2" color="text.secondary">{row.label}</Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={600}
              color={row.muted ? "text.disabled" : "text.primary"}
              sx={{ fontStyle: row.muted ? "italic" : "normal" }}
            >
              {row.value}
            </Typography>
          </Box>
        ))}

        {/* Catatan */}
        {order.notes && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
              CATATAN PELANGGAN
            </Typography>
            <Typography variant="body2" color="text.primary">{order.notes}</Typography>
          </Box>
        )}

        {/* Total */}
        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: `2px solid ${theme.palette.divider}` }}>
          {order.totalPrice && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Laundry</Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Ongkir</Typography>
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {order.deliveryFee != null
                    ? order.deliveryFee === 0 ? "Gratis" : `Rp ${order.deliveryFee.toLocaleString("id-ID")}`
                    : "Menunggu seller..."}
                </Typography>
              </Box>
            </>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body1" fontWeight={800} color="text.primary">
              TOTAL HARGA
            </Typography>
            {order.totalPrice ? (
              <Typography variant="h5" color="primary.main" fontWeight={800}>
                Rp {(order.totalPrice + (order.deliveryFee ?? 0)).toLocaleString("id-ID")}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled" fontStyle="italic" fontWeight={600}>
                Menunggu konfirmasi admin...
              </Typography>
            )}
          </Box>
        </Box>

        {/* Seller Info (jika ada) */}
        {order.seller && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
              Informasi Seller
            </Typography>
            <Box
              sx={{
                mt: 1.5,
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: isDark ? "rgba(16,185,129,0.07)" : "rgba(16,185,129,0.04)",
                border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "rgba(16,185,129,0.15)"}`,
              }}
            >
              <NRow
                icon={<Person fontSize="small" />}
                label="Nama Usaha"
                value={order.seller.sellerProfile?.businessName ?? order.seller.name}
              />
              {order.seller.phone && (
                <NRow icon={<Phone fontSize="small" />} label="No. HP Seller" value={order.seller.phone} />
              )}
            </Box>
          </>
        )}

        <Divider sx={{ my: 3.5 }} />

        {/* Timeline */}
        <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing={1.5}>
          Timeline Status Pesanan
        </Typography>
        <Box sx={{ mt: 2 }}>
          <StatusStepper currentStatus={order.status} statusHistory={order.statusHistory} />
        </Box>

        {/* Footer */}
        <Divider sx={{ mt: 4, mb: 2.5 }} />
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="caption" color="text.disabled" display="block">
            Terima kasih telah menggunakan layanan Signature Laundry
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" mt={0.3}>
            Dokumen ini merupakan bukti pemesanan yang sah &nbsp;•&nbsp; © 2026 Signature Laundry
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
