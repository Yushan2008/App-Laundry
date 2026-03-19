"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import {
  Store,
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Map,
  CheckCircle,
  Cancel,
  ArrowBack,
} from "@mui/icons-material";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useRouter } from "next/navigation";

interface SellerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  sellerProfile: {
    businessName: string;
    photoUrl: string | null;
    address: string;
    latitude: number;
    longitude: number;
    operatingHours: string;
    serviceArea: string;
    isApproved: boolean;
    isAvailable: boolean;
  };
}

export default function AdminSellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSeller = () => {
    fetch(`/api/sellers/${id}`)
      .then((r) => r.json())
      .then((d) => { setSeller(d.seller); setLoading(false); })
      .catch(() => { setError("Gagal memuat data seller"); setLoading(false); });
  };

  useEffect(() => { fetchSeller(); }, [id]);

  const handleApprove = async (isApproved: boolean) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sellers/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        setSuccess(isApproved ? "Seller berhasil disetujui" : "Approval seller dicabut");
        fetchSeller();
      }
    } catch {
      setError("Gagal mengupdate status seller");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    </Box>
  );

  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />
      <Box flex={1} p={3}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
          Kembali
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {seller && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
                <Avatar
                  src={seller.sellerProfile?.photoUrl || undefined}
                  sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                  variant="rounded"
                >
                  {seller.name[0]}
                </Avatar>
                <Typography variant="h6" fontWeight={700}>{seller.name}</Typography>
                <Typography color="text.secondary" variant="body2">{seller.email}</Typography>
                {seller.phone && (
                  <Typography color="text.secondary" variant="body2">{seller.phone}</Typography>
                )}

                <Box mt={2} display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                  <Chip
                    label={seller.sellerProfile?.isApproved ? "Disetujui" : "Menunggu Approval"}
                    color={seller.sellerProfile?.isApproved ? "success" : "warning"}
                  />
                  {seller.sellerProfile?.isApproved && (
                    <Chip
                      label={seller.sellerProfile?.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                      color={seller.sellerProfile?.isAvailable ? "primary" : "default"}
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box mt={3} display="flex" gap={2} flexDirection="column">
                  {!seller.sellerProfile?.isApproved ? (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                      onClick={() => handleApprove(true)}
                      disabled={actionLoading}
                      fullWidth
                    >
                      Setujui Seller
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleApprove(false)}
                      disabled={actionLoading}
                      fullWidth
                    >
                      Cabut Approval
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  <Store sx={{ mr: 1, verticalAlign: "middle" }} />
                  Profil Usaha
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <InfoRow icon={<Store />} label="Nama Usaha" value={seller.sellerProfile?.businessName} />
                  <InfoRow icon={<Email />} label="Email" value={seller.email} />
                  <InfoRow icon={<Phone />} label="Nomor HP" value={seller.phone || "-"} />
                  <InfoRow icon={<LocationOn />} label="Alamat Usaha" value={seller.sellerProfile?.address} />
                  <InfoRow icon={<AccessTime />} label="Jam Operasional" value={seller.sellerProfile?.operatingHours} />
                  <InfoRow icon={<Map />} label="Area Layanan" value={seller.sellerProfile?.serviceArea} />
                  <InfoRow
                    icon={<LocationOn />}
                    label="Koordinat"
                    value={`${seller.sellerProfile?.latitude?.toFixed(6)}, ${seller.sellerProfile?.longitude?.toFixed(6)}`}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={2}>
      <Box color="primary.main" mt={0.5}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={500}>{value || "-"}</Typography>
      </Box>
    </Box>
  );
}
