"use client";

import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  useTheme,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Phone,
  Home,
  Visibility,
  VisibilityOff,
  LocalLaundryService,
  WbSunny,
  DarkMode,
  CheckCircle,
  Store,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useThemeMode } from "@/app/context/ThemeContext";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = mode === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password tidak cocok. Periksa kembali.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  };

  const benefits = [
    "Pesan laundry kapan saja, dari mana saja",
    "Tracking status pesanan real-time",
    "Riwayat pesanan tersimpan dengan lengkap",
    "Harga transparan, tanpa biaya tersembunyi",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Left Panel — Branding */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "0 0 420px",
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #4f46e5 100%)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -60, left: -60, width: 240, height: 240, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.05)" }} />
        <Box sx={{ position: "absolute", bottom: -80, right: -40, width: 280, height: 280, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />
        <Box sx={{ position: "relative", width: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <LocalLaundryService sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="white">
              Signature Laundry
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color="white" sx={{ mb: 1.5, lineHeight: 1.3 }}>
            Bergabung Sekarang
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mb: 4, lineHeight: 1.7 }}>
            Daftar gratis dan nikmati kemudahan layanan laundry modern
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {benefits.map((b) => (
              <Box key={b} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <CheckCircle sx={{ color: "#a5f3fc", fontSize: 20, mt: 0.1, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
                  {b}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel — Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
          position: "relative",
          overflowY: "auto",
        }}
      >
        {/* Dark Mode Toggle */}
        <IconButton
          onClick={toggleMode}
          size="small"
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            color: "text.secondary",
            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" },
          }}
        >
          {isDark ? <WbSunny fontSize="small" /> : <DarkMode fontSize="small" />}
        </IconButton>

        <Box sx={{ width: "100%", maxWidth: 460, py: 4 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: "block", md: "none" }, textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
              }}
            >
              <LocalLaundryService sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Typography variant="h6" fontWeight={800} color="text.primary">
              Signature Laundry
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
            Buat Akun Baru
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Isi data di bawah ini untuk mendaftar
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nama Lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Alamat Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  helperText="Min. 6 karakter"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "text.disabled", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Konfirmasi Password"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "text.disabled", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Nomor HP (opsional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              sx={{ mb: 2.5 }}
              placeholder="08xxxxxxxxxx"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Alamat Kos (opsional)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              multiline
              rows={2}
              sx={{ mb: 3.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home sx={{ color: "text.disabled", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.4,
                background: "linear-gradient(135deg, #4f46e5, #0d9488)",
                fontWeight: 700,
                fontSize: "1rem",
                "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
                "&:disabled": { background: theme.palette.action.disabledBackground },
              }}
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang — Gratis!"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.disabled">
              atau
            </Typography>
          </Divider>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
              Masuk di sini
            </Link>
          </Typography>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.disabled">
              Mau jadi mitra?
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Store />}
            onClick={() => router.push("/register/seller")}
            sx={{
              py: 1.4,
              fontWeight: 700,
              borderColor: "#0d9488",
              color: "#0d9488",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0f766e",
                bgcolor: "rgba(13,148,136,0.06)",
              },
            }}
          >
            Daftar sebagai Seller / Mitra Antar-Jemput
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
