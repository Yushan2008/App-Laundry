"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
} from "@mui/material";
import { Store, LocationOn, AccessTime, Map, PhotoCamera, Save } from "@mui/icons-material";
import SellerSidebar from "@/components/layout/SellerSidebar";

interface Profile {
  businessName: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  serviceArea: string;
  photoUrl: string | null;
}

export default function SellerProfilePage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    businessName: "",
    address: "",
    latitude: "",
    longitude: "",
    operatingHours: "",
    serviceArea: "",
    photoUrl: "",
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/sellers/${session.user.id}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.seller?.sellerProfile;
        if (p) {
          setProfile(p);
          setForm({
            businessName: p.businessName,
            address: p.address,
            latitude: p.latitude?.toString(),
            longitude: p.longitude?.toString(),
            operatingHours: p.operatingHours,
            serviceArea: p.serviceArea,
            photoUrl: p.photoUrl || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        })),
      () => setError("Gagal mendapatkan lokasi")
    );
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/sellers/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
          operatingHours: form.operatingHours,
          serviceArea: form.serviceArea,
          photoUrl: form.photoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      setSuccess("Profil berhasil disimpan!");
      setProfile(data.sellerProfile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Box display="flex" minHeight="100vh">
      <SellerSidebar />
      <Box flex={1} display="flex" alignItems="center" justifyContent="center"><CircularProgress /></Box>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh">
      <SellerSidebar />
      <Box flex={1} p={3} maxWidth={600}>
        <Typography variant="h5" fontWeight={700} mb={3}>Profil Usaha</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {/* Foto */}
          <Box display="flex" alignItems="center" gap={3} mb={3}>
            <Avatar src={form.photoUrl || undefined} sx={{ width: 80, height: 80 }} variant="rounded">
              {form.businessName[0] || "S"}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>{profile?.businessName || "Nama Usaha"}</Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={14} /> : <PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{ mt: 1 }}
              >
                {uploading ? "Mengupload..." : "Ganti Foto"}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleUpload} />
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField label="Nama Usaha" value={form.businessName} onChange={set("businessName")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Store /></InputAdornment> }} />
            <TextField label="Alamat Usaha" value={form.address} onChange={set("address")} fullWidth multiline rows={2}
              InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }} />
            <TextField label="Jam Operasional" value={form.operatingHours} onChange={set("operatingHours")} fullWidth
              placeholder="08:00-20:00"
              InputProps={{ startAdornment: <InputAdornment position="start"><AccessTime /></InputAdornment> }} />
            <TextField label="Area Layanan" value={form.serviceArea} onChange={set("serviceArea")} fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><Map /></InputAdornment> }} />

            <Box display="flex" gap={2}>
              <TextField label="Latitude" value={form.latitude} onChange={set("latitude")} fullWidth type="number" inputProps={{ step: "any" }} />
              <TextField label="Longitude" value={form.longitude} onChange={set("longitude")} fullWidth type="number" inputProps={{ step: "any" }} />
            </Box>
            <Button variant="outlined" startIcon={<LocationOn />} onClick={handleGetLocation} size="small">
              Gunakan Lokasi Sekarang
            </Button>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
