"use client";

import {
  Typography,
  Box,
  Chip,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  LocalLaundryService,
  Iron,
  Inventory,
  LocalShipping,
  HourglassEmpty,
  Settings,
  DirectionsBike,
  TaskAlt,
  ThumbUp,
  Cancel,
} from "@mui/icons-material";
import { useThemeMode } from "@/app/context/ThemeContext";

const STATUS_STEPS = [
  {
    key: "PENDING",
    label: "Pesanan Diterima",
    sublabel: "Menunggu seller terdekat mengambil pesanan",
    icon: <HourglassEmpty sx={{ fontSize: 16 }} />,
    color: "#f59e0b",
  },
  {
    key: "CONFIRMED",
    label: "Dikonfirmasi",
    sublabel: "Seller telah mengambil pesanan, akan segera menjemput",
    icon: <ThumbUp sx={{ fontSize: 16 }} />,
    color: "#8b5cf6",
  },
  {
    key: "PICKED_UP",
    label: "Dijemput",
    sublabel: "Seller sedang menjemput cucian Anda",
    icon: <DirectionsBike sx={{ fontSize: 16 }} />,
    color: "#3b82f6",
  },
  {
    key: "PROCESSING",
    label: "Sedang Diproses",
    sublabel: "Seller menimbang cucian & menghitung harga akhir",
    icon: <Settings sx={{ fontSize: 16 }} />,
    color: "#06b6d4",
  },
  {
    key: "WASHING",
    label: "Sedang Dicuci",
    sublabel: "Cucian sedang dalam proses pencucian",
    icon: <LocalLaundryService sx={{ fontSize: 16 }} />,
    color: "#4f46e5",
  },
  {
    key: "DRYING",
    label: "Pengeringan & Setrika",
    sublabel: "Cucian sedang dikeringkan dan disetrika",
    icon: <Iron sx={{ fontSize: 16 }} />,
    color: "#0d9488",
  },
  {
    key: "READY",
    label: "Siap Diantar",
    sublabel: "Cucian selesai, menunggu pengiriman",
    icon: <Inventory sx={{ fontSize: 16 }} />,
    color: "#10b981",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Dalam Pengiriman",
    sublabel: "Seller sedang mengantarkan cucian",
    icon: <LocalShipping sx={{ fontSize: 16 }} />,
    color: "#f97316",
  },
  {
    key: "DELIVERED",
    label: "Selesai",
    sublabel: "Cucian berhasil diantarkan",
    icon: <TaskAlt sx={{ fontSize: 16 }} />,
    color: "#64748b",
  },
];

interface StatusHistory {
  id: string;
  status: string;
  description: string | null;
  createdAt: string;
}

interface StatusStepperProps {
  currentStatus: string;
  statusHistory: StatusHistory[];
}

export default function StatusStepper({ currentStatus, statusHistory }: StatusStepperProps) {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  // Handle CANCELLED separately
  if (currentStatus === "CANCELLED") {
    const cancelHistory = statusHistory.find((h) => h.status === "CANCELLED");
    return (
      <Box>
        {/* Show completed steps before cancellation */}
        {STATUS_STEPS.filter((s) => s.key !== "DELIVERED").map((step) => {
          const history = statusHistory.find((h) => h.status === step.key);
          if (!history) return null;
          return (
            <Box key={step.key} sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                    color: "white", boxShadow: "0 2px 12px rgba(79,70,229,0.3)",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 18, color: "white" }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} color="text.primary">{step.label}</Typography>
                {history.description && (
                  <Typography variant="caption" color="text.secondary" display="block">{history.description}</Typography>
                )}
                <Typography variant="caption" color="text.disabled">
                  {new Date(history.createdAt).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        {/* Cancelled step */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white", boxShadow: "0 2px 12px rgba(239,68,68,0.4)",
            }}
          >
            <Cancel sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="body2" fontWeight={700} color="error.main">Pesanan Dibatalkan</Typography>
              <Chip label="Dibatalkan" size="small" color="error" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
            </Box>
            {cancelHistory?.description && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.5 }}>
                {cancelHistory.description}
              </Typography>
            )}
            {cancelHistory?.createdAt && (
              <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 600 }}>
                {new Date(cancelHistory.createdAt).toLocaleString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  const getHistoryForStatus = (statusKey: string) =>
    statusHistory.find((h) => h.status === statusKey);

  return (
    <Box>
      {STATUS_STEPS.map((step, index) => {
        const history = getHistoryForStatus(step.key);
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const isLast = index === STATUS_STEPS.length - 1;

        return (
          <Box key={step.key} sx={{ display: "flex", gap: 2 }}>
            {/* Icon column */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s",
                  ...(isCompleted && {
                    background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                    color: "white",
                    boxShadow: "0 2px 12px rgba(79,70,229,0.3)",
                  }),
                  ...(isCurrent && {
                    background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                    color: "white",
                    boxShadow: `0 2px 12px ${step.color}4d`,
                  }),
                  ...(isPending && {
                    bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                    color: isDark ? "#475569" : "#cbd5e1",
                    border: `2px dashed ${isDark ? "#334155" : "#e2e8f0"}`,
                  }),
                }}
              >
                {isCompleted ? (
                  <CheckCircle sx={{ fontSize: 18, color: "white" }} />
                ) : (
                  step.icon
                )}
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    my: 0.5,
                    borderRadius: 1,
                    bgcolor: isCompleted
                      ? "primary.main"
                      : isDark
                      ? "#1e293b"
                      : "#e2e8f0",
                    transition: "background-color 0.3s",
                  }}
                />
              )}
            </Box>

            {/* Content column */}
            <Box sx={{ flex: 1, pb: isLast ? 0 : 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Typography
                  variant="body2"
                  fontWeight={isCurrent ? 700 : isCompleted ? 600 : 400}
                  color={
                    isCurrent
                      ? "text.primary"
                      : isCompleted
                      ? "text.primary"
                      : "text.disabled"
                  }
                >
                  {step.label}
                </Typography>
                {isCurrent && (
                  <Chip
                    label="Saat ini"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                      color: "white",
                    }}
                  />
                )}
              </Box>

              {(isCurrent || isCompleted) && (
                <Box>
                  {history?.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ lineHeight: 1.5 }}
                    >
                      {history.description}
                    </Typography>
                  )}
                  {history?.createdAt ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: isCurrent ? step.color : "text.disabled",
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {new Date(history.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  ) : (
                    !history && isCompleted && (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )
                  )}
                </Box>
              )}

              {isPending && (
                <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                  {step.sublabel}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
