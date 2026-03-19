"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  InputAdornment,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Store,
  Person,
  Email,
  Lock,
  Phone,
  LocationOn,
  AccessTime,
  Map,
  PhotoCamera,
  CheckCircle,
} from "@mui/icons-material";
import Link from "next/link";

const STEPS = ["Akun Seller", "Profil Usaha", "Lokasi Usaha"];

export default function RegisterSellerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    operatingHours: "08:00-20:00",
    serviceArea: "",
    photoUrl: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm((f) => ({ ...f, photoUrl: data.url }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }));
      },
      () => setError("Gagal mendapatkan lokasi. Izinkan akses lokasi di browser.")
    );
  };

  const canNext = () => {
    if (activeStep === 0) return form.name && form.email && form.password.length >= 6;
    if (activeStep === 1) return form.businessName && form.operatingHours && form.serviceArea;
    return form.address && form.latitude && form.longitude;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sellers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ background: "linear-gradient(135deg, #3949ab 0%, #00897b 100%)" }}
      >
        <Paper sx={{ p: 5, borderRadius: 4, textAlign: "center", maxWidth: 420 }}>
          <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Pendaftaran Berhasil!
          </Typography>
          <Typography color="text.secondary">
            Akun seller Anda sedang menunggu persetujuan admin. Anda akan dihubungi melalui email.
          </Typography>
          <Typography variant="caption" color="text.disabled" mt={2} display="block">
            Mengalihkan ke halaman login...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ background: "linear-gradient(135deg, #3949ab 0%, #00897b 100%)", py: 4 }}
    >
      <Paper sx={{ p: 4, borderRadius: 4, width: "100%", maxWidth: 560 }}>
        <Box textAlign="center" mb={3}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, mx: "auto", mb: 1 }}>
            <Store fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={700}>Daftar sebagai Seller</Typography>
          <Typography variant="body2" color="text.secondary">
            Jadilah mitra antar-jemput Signature Laundry
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Nama Lengkap" value={form.name} onChange={set("name")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }} />
            <TextField label="Email" type="email" value={form.email} onChange={set("email")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
            <TextField label="Password" type="password" value={form.password} onChange={set("password")} fullWidth
              helperText="Minimal 6 karakter"
              InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment> }} />
            <TextField label="Nomor HP (opsional)" value={form.phone} onChange={set("phone")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }} />
          </Box>
        )}

        {activeStep === 1 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Nama Usaha" value={form.businessName} onChange={set("businessName")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Store /></InputAdornment> }} />
            <TextField label="Jam Operasional" value={form.operatingHours} onChange={set("operatingHours")} fullWidth
              placeholder="08:00-20:00"
              InputProps={{ startAdornment: <InputAdornment position="start"><AccessTime /></InputAdornment> }} />
            <TextField label="Area Layanan" value={form.serviceArea} onChange={set("serviceArea")} fullWidth
              placeholder="Contoh: Kec. Lowokwaru, Malang"
              InputProps={{ startAdornment: <InputAdornment position="start"><Map /></InputAdornment> }} />

            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>Foto Usaha (opsional)</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {form.photoUrl && (
                <Avatar src={form.photoUrl} sx={{ width: 64, height: 64 }} variant="rounded" />
              )}
              <Button
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={16} /> : <PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Mengupload..." : "Upload Foto"}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileUpload} />
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Alamat Usaha" value={form.address} onChange={set("address")} fullWidth multiline rows={2}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Latitude" value={form.latitude} onChange={set("latitude")} fullWidth
                  placeholder="-7.123456" type="number" inputProps={{ step: "any" }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Longitude" value={form.longitude} onChange={set("longitude")} fullWidth
                  placeholder="112.123456" type="number" inputProps={{ step: "any" }} />
              </Grid>
            </Grid>
            <Button variant="outlined" startIcon={<LocationOn />} onClick={handleGetLocation} fullWidth>
              Gunakan Lokasi Saya Sekarang
            </Button>
            <Typography variant="caption" color="text.secondary">
              Koordinat digunakan untuk menentukan seller terdekat dari pelanggan (radius 5 km).
            </Typography>
          </Box>
        )}

        <Box display="flex" gap={2} mt={4}>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={() => setActiveStep((s) => s - 1)} fullWidth>
              Kembali
            </Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={() => setActiveStep((s) => s + 1)} fullWidth disabled={!canNext()}>
              Lanjut
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              disabled={loading || !canNext()}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {loading ? "Mendaftarkan..." : "Daftar sebagai Seller"}
            </Button>
          )}
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
              Masuk
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
