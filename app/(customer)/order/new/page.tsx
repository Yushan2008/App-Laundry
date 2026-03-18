"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
} from "@mui/material";
import {
  CheckCircle,
  LocalLaundryService,
  Speed,
  ArrowBack,
  InfoOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useThemeMode } from "@/app/context/ThemeContext";

interface Package {
  id: string;
  name: string;
  pricePerKg: number;
  durationDays: number;
  description: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isDark = mode === "dark";

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data) => {
        setPackages(data.packages || []);
        if (data.packages?.length > 0) setSelectedPackage(data.packages[0]);
      });
  }, []);

  const estimatedDate = selectedPackage
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + selectedPackage.durationDays);
        return d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      })()
    : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPackage) { setError("Pilih paket laundry terlebih dahulu"); return; }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: selectedPackage.id,
        notes,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Terjadi kesalahan");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/order/${data.order.id}/nota`), 1500);
  };

  if (success) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #34d399)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 32px rgba(16,185,129,0.3)",
            }}
          >
            <CheckCircle sx={{ fontSize: 52, color: "white" }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
            Pesanan Berhasil Dibuat!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Mengalihkan ke halaman detail pesanan...
          </Typography>
          <CircularProgress size={24} sx={{ mt: 3, color: "primary.main" }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            variant="outlined"
            size="small"
            sx={{ borderColor: "divider", color: "text.secondary" }}
          >
            Kembali
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Buat Pesanan Baru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pilih paket dan tambahkan catatan — berat akan ditimbang oleh admin
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Left — Form */}
            <Grid item xs={12} md={7}>
              {/* Step 1 — Pilih Paket */}
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      1
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Pilih Paket Laundry
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {packages.map((pkg) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      const isExpress = pkg.name === "Express";
                      return (
                        <Grid item xs={12} sm={6} key={pkg.id}>
                          <Box
                            onClick={() => setSelectedPackage(pkg)}
                            sx={{
                              border: isSelected
                                ? "2px solid #4f46e5"
                                : `2px solid ${theme.palette.divider}`,
                              borderRadius: 3,
                              p: 2.5,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              bgcolor: isSelected
                                ? isDark
                                  ? "rgba(79,70,229,0.12)"
                                  : "rgba(79,70,229,0.05)"
                                : "transparent",
                              "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: isDark
                                  ? "rgba(79,70,229,0.08)"
                                  : "rgba(79,70,229,0.04)",
                              },
                              position: "relative",
                            }}
                          >
                            {isSelected && (
                              <CheckCircle
                                sx={{
                                  position: "absolute",
                                  top: 10,
                                  right: 10,
                                  fontSize: 20,
                                  color: "primary.main",
                                }}
                              />
                            )}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                              <Box
                                sx={{
                                  p: 0.8,
                                  borderRadius: 1.5,
                                  bgcolor: isExpress
                                    ? "rgba(245,158,11,0.12)"
                                    : "rgba(79,70,229,0.12)",
                                  color: isExpress ? "#f59e0b" : "#4f46e5",
                                }}
                              >
                                {isExpress ? (
                                  <Speed fontSize="small" />
                                ) : (
                                  <LocalLaundryService fontSize="small" />
                                )}
                              </Box>
                              <Typography fontWeight={700} color="text.primary">
                                {pkg.name}
                              </Typography>
                              {isExpress && (
                                <Chip
                                  label="Cepat"
                                  size="small"
                                  sx={{
                                    bgcolor: "rgba(245,158,11,0.15)",
                                    color: "#f59e0b",
                                    fontWeight: 700,
                                    height: 20,
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="h6" color="primary.main" fontWeight={800}>
                              Rp {pkg.pricePerKg.toLocaleString("id-ID")}
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                fontWeight={400}
                              >
                                /kg
                              </Typography>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                              ⏱ Estimasi {pkg.durationDays} hari kerja
                            </Typography>
                            <Typography variant="caption" color="text.disabled" display="block" mt={0.5} sx={{ lineHeight: 1.4 }}>
                              {pkg.description}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>

              {/* Step 2 — Catatan */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: isDark ? "rgba(255,255,255,0.1)" : "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      2
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Catatan{" "}
                      <Typography component="span" variant="body2" color="text.secondary">
                        (opsional)
                      </Typography>
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Catatan tambahan"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Ada baju putih, tolong pisah. Jangan pakai pewangi."
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Right — Ringkasan */}
            <Grid item xs={12} md={5}>
              <Card sx={{ position: "sticky", top: 80 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: "rgba(79,70,229,0.1)",
                        color: "primary.main",
                      }}
                    >
                      <InfoOutlined fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Ringkasan Pesanan
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2.5 }} />

                  {[
                    { label: "Paket", value: selectedPackage?.name ?? "-" },
                    {
                      label: "Harga/kg",
                      value: selectedPackage
                        ? `Rp ${selectedPackage.pricePerKg.toLocaleString("id-ID")}`
                        : "-",
                    },
                    { label: "Estimasi Selesai", value: estimatedDate, small: true },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{ fontSize: row.small ? 12 : 14, textAlign: "right", maxWidth: 160 }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  {/* Info harga ditentukan admin */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(79,70,229,0.08)" : "rgba(79,70,229,0.04)",
                      border: `1px dashed rgba(79,70,229,0.3)`,
                      mb: 3,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                      TOTAL HARGA
                    </Typography>
                    <Typography variant="body2" color="text.disabled" fontStyle="italic" mt={0.3}>
                      Dihitung setelah admin menimbang cucian
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || !selectedPackage}
                    sx={{
                      py: 1.4,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                      "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
                      "&:disabled": { background: theme.palette.action.disabledBackground },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Pesan Sekarang"
                    )}
                  </Button>

                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    textAlign="center"
                    mt={1.5}
                  >
                    Dengan memesan, Anda menyetujui syarat & ketentuan layanan
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
}
