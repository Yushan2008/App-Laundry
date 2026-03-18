"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import {
  ArrowForward,
  AccessTime,
  Scale,
  LocalLaundryService,
  Speed,
  Receipt,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
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
  createdAt: string;
  package: { name: string; durationDays: number };
}

export default function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default", dot: "#64748b" };

  const isDark = mode === "dark";
  const isExpress = order.package.name === "Express";

  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + order.package.durationDays);

  return (
    <Card
      sx={{
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: isDark
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(79,70,229,0.12)",
        },
        cursor: "default",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Top accent line */}
        <Box
          sx={{
            height: 3,
            background:
              order.status === "DELIVERED"
                ? "#64748b"
                : "linear-gradient(90deg, #4f46e5, #0d9488)",
            borderRadius: "12px 12px 0 0",
          }}
        />

        <Box sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography
                variant="caption"
                color="text.disabled"
                fontFamily="monospace"
                fontWeight={600}
                display="block"
              >
                {order.orderNumber}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <Box
                  sx={{
                    p: 0.6,
                    borderRadius: 1,
                    bgcolor: isExpress ? "rgba(245,158,11,0.1)" : "rgba(79,70,229,0.1)",
                    color: isExpress ? "#f59e0b" : "primary.main",
                  }}
                >
                  {isExpress ? (
                    <Speed sx={{ fontSize: 14 }} />
                  ) : (
                    <LocalLaundryService sx={{ fontSize: 14 }} />
                  )}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                  Paket {order.package.name}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Details */}
          <Box sx={{ display: "flex", gap: 3, mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Scale sx={{ fontSize: 16, color: "text.disabled" }} />
              <Typography variant="body2" color={order.weight ? "text.secondary" : "text.disabled"} fontWeight={500} fontStyle={order.weight ? "normal" : "italic"}>
                {order.weight ? `${order.weight} kg` : "Belum ditimbang"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <AccessTime sx={{ fontSize: 16, color: "text.disabled" }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Estimasi{" "}
                {estimatedDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </Typography>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              {order.totalPrice ? (
                <Typography variant="h6" color="primary.main" fontWeight={800}>
                  Rp {order.totalPrice.toLocaleString("id-ID")}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.disabled" fontStyle="italic" fontWeight={500}>
                  Menunggu konfirmasi...
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                startIcon={<Receipt sx={{ fontSize: "14px !important" }} />}
                onClick={() => router.push(`/order/${order.id}/nota`)}
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: 12,
                  "&:hover": {
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  },
                }}
              >
                Nota
              </Button>
              <Button
                size="small"
                endIcon={<ArrowForward fontSize="small" />}
                onClick={() => router.push(`/order/${order.id}`)}
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: isDark ? "rgba(79,70,229,0.12)" : "rgba(79,70,229,0.06)",
                  },
                }}
              >
                Detail
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
