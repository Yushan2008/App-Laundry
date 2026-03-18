"use client";

import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  LocalLaundryService,
  AcUnit,
  Iron,
  Inventory,
  LocalShipping,
  HourglassEmpty,
} from "@mui/icons-material";

const STATUS_STEPS = [
  { key: "PENDING", label: "Pesanan Diterima", icon: <HourglassEmpty />, color: "#f59e0b" },
  { key: "PROCESSING", label: "Sedang Diproses", icon: <CheckCircle />, color: "#3b82f6" },
  { key: "WASHING", label: "Sedang Dicuci", icon: <LocalLaundryService />, color: "#06b6d4" },
  { key: "DRYING", label: "Pengeringan & Setrika", icon: <Iron />, color: "#8b5cf6" },
  { key: "READY", label: "Siap Diambil", icon: <Inventory />, color: "#22c55e" },
  { key: "DELIVERED", label: "Selesai", icon: <LocalShipping />, color: "#64748b" },
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
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  const getHistoryForStatus = (statusKey: string) => {
    return statusHistory.find((h) => h.status === statusKey);
  };

  return (
    <Box>
      <Stepper orientation="vertical" activeStep={currentIndex}>
        {STATUS_STEPS.map((step, index) => {
          const history = getHistoryForStatus(step.key);
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <Step key={step.key} completed={isCompleted}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: isCompleted || isCurrent ? step.color : "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isCompleted || isCurrent ? "white" : "#94a3b8",
                      fontSize: 16,
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={isCurrent ? 700 : isCompleted ? 600 : 400}
                    color={isCurrent ? "primary" : isCompleted ? "text.primary" : "text.secondary"}
                  >
                    {step.label}
                  </Typography>
                  {isCurrent && (
                    <Chip label="Saat ini" size="small" color="primary" sx={{ height: 20 }} />
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                {history && (
                  <Box sx={{ mb: 1 }}>
                    {history.description && (
                      <Typography variant="body2" color="text.secondary">
                        {history.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(history.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
