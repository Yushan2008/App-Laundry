"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  LocalLaundryService,
  Speed,
  TrackChanges,
  History,
  CheckCircle,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const features = [
  {
    icon: <LocalLaundryService sx={{ fontSize: 40, color: "#3b82f6" }} />,
    title: "Pesan Online",
    desc: "Pesan laundry kapan saja, dari mana saja. Tanpa perlu antri.",
  },
  {
    icon: <TrackChanges sx={{ fontSize: 40, color: "#22c55e" }} />,
    title: "Tracking Real-time",
    desc: "Pantau status cucianmu mulai dari diterima hingga siap diambil.",
  },
  {
    icon: <Speed sx={{ fontSize: 40, color: "#f59e0b" }} />,
    title: "Paket Express",
    desc: "Butuh cepat? Pilih paket express selesai dalam 1 hari kerja.",
  },
  {
    icon: <History sx={{ fontSize: 40, color: "#8b5cf6" }} />,
    title: "Riwayat Lengkap",
    desc: "Lihat semua pesanan lamamu dengan detail lengkap.",
  },
];

const packages = [
  {
    name: "Reguler",
    price: "Rp 5.000/kg",
    duration: "3 Hari",
    features: ["Cuci bersih", "Setrika rapi", "Dikemas dengan baik"],
    popular: false,
    color: "#f1f5f9",
  },
  {
    name: "Express",
    price: "Rp 10.000/kg",
    duration: "1 Hari",
    features: ["Prioritas antrian", "Cuci bersih", "Setrika rapi", "Dikemas premium"],
    popular: true,
    color: "#eff6ff",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [session, router]);

  return (
    <Box>
      {/* Navbar */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <Toolbar>
          <LocalLaundryService sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700, flexGrow: 1 }}>
            Signature Laundry
          </Typography>
          <Button variant="outlined" onClick={() => router.push("/login")} sx={{ mr: 1 }}>
            Masuk
          </Button>
          <Button variant="contained" onClick={() => router.push("/register")}>
            Daftar Gratis
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)",
          color: "white",
          py: 10,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Chip
            label="Laundry Untuk Anak Kost"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", mb: 3, fontWeight: 600 }}
          />
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Pakaian Bersih Tanpa Repot
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, fontWeight: 400 }}>
            Pesan laundry online, pantau status real-time, dan ambil cucian bersih & rapi.
            <br />
            Khusus dirancang untuk kemudahan anak kost.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/register")}
              sx={{ bgcolor: "white", color: "primary.dark", "&:hover": { bgcolor: "#f1f5f9" } }}
            >
              Mulai Pesan Sekarang
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/login")}
              sx={{ borderColor: "white", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              Sudah Punya Akun?
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={700} gutterBottom>
          Kenapa Signature Laundry?
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={5}>
          Kami hadir untuk memudahkan kehidupan anak kost sehari-hari
        </Typography>
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ textAlign: "center", p: 2, height: "100%" }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Paket */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" textAlign="center" fontWeight={700} gutterBottom>
            Pilih Paket Laundry
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={5}>
            Harga terjangkau, hasil maksimal
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} key={pkg.name}>
                <Card
                  sx={{
                    bgcolor: pkg.color,
                    border: pkg.popular ? "2px solid #3b82f6" : "2px solid transparent",
                    position: "relative",
                  }}
                >
                  {pkg.popular && (
                    <Chip
                      label="Paling Populer"
                      color="primary"
                      size="small"
                      sx={{ position: "absolute", top: 12, right: 12, fontWeight: 700 }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" fontWeight={700}>
                      {pkg.name}
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight={800} my={1}>
                      {pkg.price}
                    </Typography>
                    <Chip label={`Estimasi ${pkg.duration}`} size="small" sx={{ mb: 2 }} />
                    <Box>
                      {pkg.features.map((f) => (
                        <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                          <Typography variant="body2">{f}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/register")}
            >
              Pesan Sekarang
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#1e293b", color: "white", py: 4, textAlign: "center" }}>
        <LocalLaundryService sx={{ color: "#60a5fa", mb: 1 }} />
        <Typography variant="h6" fontWeight={700}>
          Signature Laundry
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
          © 2026 Signature Laundry. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
