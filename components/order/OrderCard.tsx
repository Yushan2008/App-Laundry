"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Divider,
} from "@mui/material";
import { ArrowForward, AccessTime, Scale } from "@mui/icons-material";
import { useRouter } from "next/navigation";

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
  createdAt: string;
  package: { name: string; durationDays: number };
}

export default function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const status = STATUS_CONFIG[order.status] || { label: order.status, color: "default" };

  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + order.package.durationDays);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {order.orderNumber}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              Paket {order.package.name}
            </Typography>
          </Box>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", gap: 3, mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Scale fontSize="small" color="action" />
            <Typography variant="body2">{order.weight} kg</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2">
              Estimasi {estimatedDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" color="primary.main" fontWeight={700}>
            Rp {order.totalPrice.toLocaleString("id-ID")}
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={() => router.push(`/order/${order.id}`)}
          >
            Detail
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
