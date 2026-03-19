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
  IconButton,
  useTheme,
} from "@mui/material";
import {
  LocalLaundryService,
  Speed,
  TrackChanges,
  History,
  CheckCircle,
  WbSunny,
  DarkMode,
  ArrowForward,
  Star,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useThemeMode } from "./context/ThemeContext";

const features = [
  {
    icon: <LocalLaundryService sx={{ fontSize: 36 }} />,
    title: "Pesan Online",
    desc: "Pesan laundry kapan saja, dari mana saja. Tanpa perlu antri.",
    color: "#4f46e5",
    bg: "rgba(79,70,229,0.1)",
  },
  {
    icon: <TrackChanges sx={{ fontSize: 36 }} />,
    title: "Tracking Real-time",
    desc: "Pantau status cucianmu mulai dari diterima hingga siap diambil.",
    color: "#0d9488",
    bg: "rgba(13,148,136,0.1)",
  },
  {
    icon: <Speed sx={{ fontSize: 36 }} />,
    title: "Paket Express",
    desc: "Butuh cepat? Pilih paket express selesai dalam 1 hari kerja.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: <History sx={{ fontSize: 36 }} />,
    title: "Riwayat Lengkap",
    desc: "Lihat semua pesanan lamamu dengan detail dan status lengkap.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
];

const packages = [
  {
    name: "Reguler",
    price: "Rp 5.000",
    unit: "/kg",
    duration: "3 Hari",
    features: ["Cuci bersih", "Setrika rapi", "Dikemas dengan baik"],
    popular: false,
  },
  {
    name: "Express",
    price: "Rp 10.000",
    unit: "/kg",
    duration: "1 Hari",
    features: [
      "Prioritas antrian",
      "Cuci bersih",
      "Setrika rapi",
      "Dikemas premium",
    ],
    popular: true,
  },
];

const testimonials = [
  {
    name: "Rizky A.",
    kos: "Kos Melati, Jl. Sudirman",
    text: "Praktis banget! Tinggal pesan dari kamar, cucian bersih diantar sesuai jadwal.",
    rating: 5,
  },
  {
    name: "Siti N.",
    kos: "Kos Mawar, Jl. Diponegoro",
    text: "Paket express-nya keren, baju kuliah saya selesai 1 hari. Recommended!",
    rating: 5,
  },
  {
    name: "Budi S.",
    kos: "Kos Kenanga, Jl. Merdeka",
    text: "Tracking pesanan real-time bikin tenang. Tahu kapan cucian selesai.",
    rating: 5,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      router.push(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [session, router]);

  const isDark = mode === "dark";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Navbar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalLaundryService sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 800, letterSpacing: -0.5 }}>
              Signature Laundry
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton onClick={toggleMode} size="small" sx={{ color: "text.secondary" }}>
              {isDark ? <WbSunny fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              onClick={() => router.push("/login")}
              sx={{ borderColor: "divider", color: "text.primary" }}
            >
              Masuk
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push("/register")}
              sx={{
                background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
              }}
            >
              Daftar Gratis
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box
        sx={{
          background: isDark
            ? "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #042f2e 100%)"
            : "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0d9488 100%)",
          color: "white",
          py: { xs: 10, md: 14 },
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -80, left: -40, width: 250, height: 250, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.03)" }} />

        <Container maxWidth="md" sx={{ position: "relative" }}>
          <Chip
            label="✨ Laundry untuk Anak Kost"
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              mb: 3,
              fontWeight: 600,
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
          <Typography
            variant="h3"
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: { xs: "2.2rem", md: "3.2rem" }, lineHeight: 1.2 }}
          >
            Pakaian Bersih,
            <br />
            <Box component="span" sx={{ color: "#a5f3fc" }}>
              Tanpa Repot
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.85, mb: 5, fontWeight: 400, maxWidth: 560, mx: "auto", lineHeight: 1.7 }}
          >
            Pesan laundry online, pantau status real-time, dan ambil cucian
            bersih & rapi. Dirancang khusus untuk kemudahan anak kost.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/register")}
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: "white",
                color: "#4f46e5",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                "&:hover": { bgcolor: "#f1f5f9" },
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              }}
            >
              Mulai Pesan Sekarang
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/login")}
              sx={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "white",
                px: 4,
                py: 1.5,
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Sudah Punya Akun?
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Stats Bar */}
      <Box
        sx={{
          bgcolor: "primary.main",
          py: 3,
          background: "linear-gradient(90deg, #4f46e5, #0d9488)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {[
              { value: "500+", label: "Pelanggan Puas" },
              { value: "2 Paket", label: "Pilihan Layanan" },
              { value: "Real-time", label: "Tracking Status" },
              { value: "100%", label: "Kepuasan Terjamin" },
            ].map((stat) => (
              <Grid item xs={6} md={3} key={stat.label} sx={{ textAlign: "center" }}>
                <Typography variant="h5" fontWeight={800} color="white">
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="Fitur Unggulan" color="primary" variant="outlined" sx={{ mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
            Kenapa Signature Laundry?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: "auto" }}>
            Kami hadir untuk memudahkan kehidupan anak kost sehari-hari
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                sx={{
                  height: "100%",
                  p: 1,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: isDark
                      ? "0 8px 30px rgba(0,0,0,0.5)"
                      : "0 8px 30px rgba(79,70,229,0.15)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      bgcolor: f.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      color: f.color,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Paket */}
      <Box sx={{ bgcolor: isDark ? "#0f172a" : "#f1f5f9", py: 10 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Chip label="Harga Terjangkau" color="secondary" variant="outlined" sx={{ mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
              Pilih Paket Laundry
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Harga transparan, hasil maksimal
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} key={pkg.name}>
                <Card
                  sx={{
                    position: "relative",
                    border: pkg.popular
                      ? "2px solid #4f46e5"
                      : `1px solid ${theme.palette.divider}`,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-4px)" },
                  }}
                >
                  {pkg.popular && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: "linear-gradient(90deg, #4f46e5, #0d9488)",
                        borderRadius: "12px 12px 0 0",
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    {pkg.popular && (
                      <Chip
                        label="⭐ Paling Populer"
                        size="small"
                        sx={{
                          mb: 2,
                          background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                    )}
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Paket {pkg.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, my: 2 }}>
                      <Typography variant="h4" color="primary.main" fontWeight={800}>
                        {pkg.price}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {pkg.unit}
                      </Typography>
                    </Box>
                    <Chip
                      label={`⏱ Estimasi ${pkg.duration}`}
                      size="small"
                      variant="outlined"
                      color="secondary"
                      sx={{ mb: 3 }}
                    />
                    <Box>
                      {pkg.features.map((f) => (
                        <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                          <CheckCircle sx={{ fontSize: 18, color: "secondary.main" }} />
                          <Typography variant="body2" color="text.primary">
                            {f}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button
                      variant={pkg.popular ? "contained" : "outlined"}
                      fullWidth
                      sx={{
                        mt: 3,
                        py: 1.2,
                        ...(pkg.popular && {
                          background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                          "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
                        }),
                      }}
                      onClick={() => router.push("/register")}
                    >
                      Pilih Paket {pkg.name}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimoni */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="Testimoni" color="primary" variant="outlined" sx={{ mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
            Kata Mereka
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Dipercaya oleh ratusan anak kost di seluruh kota
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {testimonials.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ height: "100%", p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", mb: 1.5 }}>
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} sx={{ fontSize: 18, color: "#f59e0b" }} />
                    ))}
                  </Box>
                  <Typography variant="body1" color="text.primary" sx={{ mb: 2, lineHeight: 1.7, fontStyle: "italic" }}>
                    &ldquo;{t.text}&rdquo;
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {t.name[0]}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {t.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.kos}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
            Siap Mencoba?
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.85)", mb: 4 }}>
            Daftar gratis sekarang dan nikmati kemudahan laundry anak kost
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/register")}
              sx={{
                bgcolor: "white",
                color: "#4f46e5",
                fontWeight: 700,
                px: 5,
                py: 1.5,
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              Daftar sebagai Pelanggan
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/register/seller")}
              sx={{
                borderColor: "rgba(255,255,255,0.6)",
                borderWidth: 2,
                color: "white",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderColor: "white",
                  borderWidth: 2,
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Daftar sebagai Seller
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: isDark ? "#020617" : "#0f172a",
          color: "white",
          py: 5,
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocalLaundryService sx={{ color: "white", fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            Signature Laundry
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          © 2026 Signature Laundry. All rights reserved. Dibuat dengan ❤️ untuk anak kost.
        </Typography>
      </Box>
    </Box>
  );
}
