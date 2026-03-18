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
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Calculate, CheckCircle } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

interface Package {
  id: string;
  name: string;
  pricePerKg: number;
  durationDays: number;
  description: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/packages")
      .then((r) => r.json())
      .then((data) => {
        setPackages(data.packages || []);
        if (data.packages?.length > 0) setSelectedPackage(data.packages[0]);
      });
  }, []);

  const totalPrice = selectedPackage && weight
    ? Math.round(selectedPackage.pricePerKg * parseFloat(weight))
    : 0;

  const estimatedDate = selectedPackage
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + selectedPackage.durationDays);
        return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
      })()
    : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedPackage) { setError("Pilih paket laundry"); return; }
    if (!weight || parseFloat(weight) <= 0) { setError("Masukkan berat cucian yang valid"); return; }

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: selectedPackage.id,
        weight: parseFloat(weight),
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
    setTimeout(() => router.push(`/order/${data.order.id}`), 1500);
  };

  if (success) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main" }} />
          <Typography variant="h5" fontWeight={700} mt={2}>
            Pesanan Berhasil Dibuat!
          </Typography>
          <Typography color="text.secondary">
            Mengalihkan ke halaman detail pesanan...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Buat Pesanan Baru
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Pilih paket, masukkan berat cucian, dan lihat kalkulasi harga
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Pilih Paket */}
            <Grid item xs={12} md={7}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    1. Pilih Paket
                  </Typography>
                  <RadioGroup
                    value={selectedPackage?.id || ""}
                    onChange={(e) => {
                      const pkg = packages.find((p) => p.id === e.target.value);
                      setSelectedPackage(pkg || null);
                    }}
                  >
                    {packages.map((pkg) => (
                      <Card
                        key={pkg.id}
                        variant="outlined"
                        sx={{
                          mb: 2,
                          border: selectedPackage?.id === pkg.id ? "2px solid #1976d2" : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                          <FormControlLabel
                            value={pkg.id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography fontWeight={700}>{pkg.name}</Typography>
                                  {pkg.name === "Express" && (
                                    <Chip label="Cepat" color="warning" size="small" />
                                  )}
                                </Box>
                                <Typography variant="body2" color="primary.main" fontWeight={700}>
                                  Rp {pkg.pricePerKg.toLocaleString("id-ID")}/kg
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Estimasi {pkg.durationDays} hari kerja · {pkg.description}
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, width: "100%" }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </RadioGroup>

                  <Typography variant="h6" fontWeight={700} gutterBottom mt={2}>
                    2. Berat Cucian
                  </Typography>
                  <TextField
                    fullWidth
                    label="Berat (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    inputProps={{ min: 0.5, step: 0.5 }}
                    placeholder="Contoh: 3"
                    helperText="Minimum 0.5 kg"
                  />

                  <Typography variant="h6" fontWeight={700} gutterBottom mt={3}>
                    3. Catatan (opsional)
                  </Typography>
                  <TextField
                    fullWidth
                    label="Catatan tambahan"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Ada baju putih, tolong dipisah"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Kalkulasi Harga */}
            <Grid item xs={12} md={5}>
              <Card sx={{ position: "sticky", top: 80 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Calculate color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Kalkulasi Harga
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">Paket</Typography>
                    <Typography fontWeight={600}>{selectedPackage?.name || "-"}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">Harga/kg</Typography>
                    <Typography fontWeight={600}>
                      {selectedPackage ? `Rp ${selectedPackage.pricePerKg.toLocaleString("id-ID")}` : "-"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">Berat</Typography>
                    <Typography fontWeight={600}>{weight ? `${weight} kg` : "-"}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">Estimasi Selesai</Typography>
                    <Typography fontWeight={600} fontSize={13}>{estimatedDate}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>Total</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      {totalPrice > 0
                        ? `Rp ${totalPrice.toLocaleString("id-ID")}`
                        : "Rp 0"}
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || !selectedPackage || !weight}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : "Pesan Sekarang"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Box>
  );
}
