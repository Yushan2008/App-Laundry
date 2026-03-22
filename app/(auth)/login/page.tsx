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
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  LocalLaundryService,
  WbSunny,
  DarkMode,
} from "@mui/icons-material";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useThemeMode } from "@/app/context/ThemeContext";

const NEXTAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Terjadi kesalahan saat memulai login. Coba lagi.",
  OAuthCallback: "Terjadi kesalahan saat proses callback. Coba lagi.",
  OAuthCreateAccount: "Tidak bisa membuat akun. Coba lagi.",
  EmailCreateAccount: "Tidak bisa membuat akun. Coba lagi.",
  Callback: "Terjadi kesalahan callback. Coba lagi.",
  OAuthAccountNotLinked: "Akun sudah terdaftar dengan metode lain.",
  EmailSignin: "Gagal mengirim email. Periksa alamat email Anda.",
  CredentialsSignin: "Email atau password salah. Coba lagi.",
  SessionRequired: "Silakan masuk untuk mengakses halaman tersebut.",
  Default: "Terjadi kesalahan. Coba lagi.",
};

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Tangkap error dari NextAuth (misalnya setelah redirect dari signOut atau akses terlarang)
  const urlError = searchParams.get("error");
  const [error, setError] = useState(
    urlError ? (NEXTAUTH_ERROR_MESSAGES[urlError] ?? NEXTAUTH_ERROR_MESSAGES.Default) : ""
  );

  const isDark = mode === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.error || !res?.ok) {
      setError("Email atau password salah. Coba lagi.");
      setLoading(false);
      return;
    }

    // getSession() lebih reliable daripada fetch manual setelah signIn
    const session = await getSession();
    const role = session?.user?.role;
    const dest = role === "ADMIN" ? "/admin" : role === "SELLER" ? "/seller" : "/dashboard";
    router.push(dest);
    router.refresh();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Panel — Branding */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 50%, #0d9488 100%)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -40, width: 240, height: 240, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />
        <Box sx={{ position: "relative", textAlign: "center" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <LocalLaundryService sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography variant="h4" fontWeight={800} color="white" gutterBottom>
            Signature Laundry
          </Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 300, lineHeight: 1.7 }}>
            Platform laundry modern untuk anak kost. Pesan, pantau, dan terima cucian bersih dengan mudah.
          </Typography>
        </Box>
      </Box>

      {/* Right Panel — Form */}
      <Box
        sx={{
          flex: { xs: 1, md: "0 0 480px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
          position: "relative",
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

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile Logo */}
          <Box sx={{ textAlign: "center", mb: 4, display: { xs: "block", md: "none" } }}>
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
            Selamat Datang Kembali
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Masuk ke akun Signature Laundry Anda
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
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
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              sx={{ mb: 3.5 }}
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
                "&:hover": {
                  background: "linear-gradient(135deg, #3730a3, #0f766e)",
                },
                "&:disabled": {
                  background: theme.palette.action.disabledBackground,
                },
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.disabled">
              atau
            </Typography>
          </Divider>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
              Daftar sekarang
            </Link>
          </Typography>

          {/* Demo Box */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: isDark ? "rgba(79,70,229,0.08)" : "rgba(79,70,229,0.04)",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
              fontWeight={500}
            >
              🔑 Demo Admin
            </Typography>
            <Typography
              variant="caption"
              color="primary.main"
              display="block"
              textAlign="center"
              fontWeight={600}
            >
              admin@signaturelaundry.com / admin123
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function LoginPageFallback() {
  return (
    <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center" bgcolor="background.default">
      <CircularProgress />
    </Box>
  );
}

// Wrapper dengan Suspense agar useSearchParams aman di App Router
export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPage />
    </Suspense>
  );
}
