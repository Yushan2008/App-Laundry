"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Divider,
} from "@mui/material";
import {
  ListAlt,
  LocationOn,
  DirectionsBike,
  CheckCircle,
} from "@mui/icons-material";
import SellerSidebar from "@/components/layout/SellerSidebar";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  package: { name: string; pricePerKg: number };
  user: { name: string; phone: string | null; address: string | null };
  deliveryFee: number | null;
  customerLat: number | null;
  customerLng: number | null;
  notes: string | null;
  createdAt: string;
  distance?: number; // hanya untuk nearbyOrders
}

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Dikonfirmasi",
  PICKED_UP: "Dijemput",
  PROCESSING: "Diproses",
  WASHING: "Dicuci",
  DRYING: "Dikeringkan",
  READY: "Siap Antar",
  OUT_FOR_DELIVERY: "Diantarkan",
  DELIVERED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_COLOR: Record<string, "warning" | "info" | "success" | "primary" | "default" | "error" | "secondary"> = {
  CONFIRMED: "warning",
  PICKED_UP: "info",
  PROCESSING: "secondary",
  WASHING: "primary",
  DRYING: "secondary",
  READY: "success",
  OUT_FOR_DELIVERY: "warning",
  DELIVERED: "default",
  CANCELLED: "error",
};

export default function SellerOrdersPage() {
  const router = useRouter();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [nearbyOrders, setNearbyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);

  const fetchOrders = useCallback(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        setMyOrders(d.orders || []);
        setNearbyOrders(d.nearbyOrders || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat pesanan");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // refresh otomatis tiap 30 detik
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const active = myOrders.filter((o) =>
    ["CONFIRMED", "PICKED_UP", "PROCESSING", "WASHING", "DRYING", "READY", "OUT_FOR_DELIVERY"].includes(o.status)
  );
  const done = myOrders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.status));

  const renderOrderCard = (order: Order, isNearby = false) => (
    <Paper
      key={order.id}
      variant="outlined"
      sx={{ p: 2.5, borderRadius: 2, cursor: "pointer", "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" } }}
      onClick={() => router.push(`/seller/orders/${order.id}`)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography variant="body2" fontWeight={700} fontFamily="monospace">
            {order.orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.3}>
            {order.user.name} • {order.package.name}
          </Typography>
        </Box>
        {isNearby ? (
          <Chip
            icon={<LocationOn sx={{ fontSize: 14 }} />}
            label={`${order.distance?.toFixed(1) ?? "?"} km`}
            size="small"
            color="primary"
            variant="outlined"
          />
        ) : (
          <Chip
            label={STATUS_LABEL[order.status] || order.status}
            size="small"
            color={STATUS_COLOR[order.status] || "default"}
          />
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          {order.user.address && (
            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <LocationOn sx={{ fontSize: 12 }} /> {order.user.address}
            </Typography>
          )}
          {order.notes && (
            <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>
              📝 {order.notes.length > 50 ? order.notes.slice(0, 50) + "..." : order.notes}
            </Typography>
          )}
        </Box>
        {isNearby ? (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<DirectionsBike />}
            onClick={(e) => { e.stopPropagation(); router.push(`/seller/orders/${order.id}`); }}
            sx={{ flexShrink: 0, ml: 1 }}
          >
            Lihat & Ambil
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </Typography>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box display="flex" minHeight="100vh">
      <SellerSidebar />
      <Box flex={1} p={3}>
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <ListAlt color="primary" />
          <Typography variant="h5" fontWeight={700}>Kelola Pesanan</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            label={
              <Badge badgeContent={nearbyOrders.length} color="error" max={99}>
                <Box sx={{ pr: nearbyOrders.length > 0 ? 1.5 : 0 }}>Tersedia</Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={active.length} color="primary" max={99}>
                <Box sx={{ pr: active.length > 0 ? 1.5 : 0 }}>Pesananku</Box>
              </Badge>
            }
          />
          <Tab label="Selesai" />
        </Tabs>

        {loading ? (
          <Box textAlign="center" py={6}><CircularProgress /></Box>
        ) : (
          <>
            {/* Tab 0 — Tersedia */}
            {tab === 0 && (
              <Box>
                {nearbyOrders.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <LocationOn sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>Tidak ada pesanan tersedia di sekitar Anda</Typography>
                    <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                      Pesanan PENDING dalam radius 5km akan muncul di sini
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Alert severity="info" icon={<LocationOn />} sx={{ mb: 1 }}>
                      {nearbyOrders.length} pesanan tersedia dalam radius 5km dari lokasi Anda. Diurutkan dari yang terdekat.
                    </Alert>
                    {nearbyOrders.map((o) => renderOrderCard(o, true))}
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 1 — Pesananku (aktif) */}
            {tab === 1 && (
              <Box>
                {active.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <DirectionsBike sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>Belum ada pesanan aktif</Typography>
                    <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                      Ambil pesanan dari tab "Tersedia"
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {active.map((o) => renderOrderCard(o))}
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 2 — Selesai */}
            {tab === 2 && (
              <Box>
                {done.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <CheckCircle sx={{ fontSize: 56, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>Belum ada pesanan selesai</Typography>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {done.map((o) => renderOrderCard(o))}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
