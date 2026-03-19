"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  TableContainer,
  Tabs,
  Tab,
} from "@mui/material";
import { Store, CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useRouter } from "next/navigation";

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  sellerProfile: {
    businessName: string;
    photoUrl: string | null;
    address: string;
    operatingHours: string;
    serviceArea: string;
    isApproved: boolean;
    isAvailable: boolean;
    latitude: number;
    longitude: number;
  } | null;
}

export default function AdminSellersPage() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Menunggu, 1: Disetujui, 2: Semua
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchSellers = () => {
    fetch("/api/sellers")
      .then((r) => r.json())
      .then((d) => { setSellers(d.sellers || []); setLoading(false); })
      .catch(() => { setError("Gagal memuat data seller"); setLoading(false); });
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/sellers/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) fetchSellers();
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = sellers.filter((s) => {
    if (tab === 0) return s.sellerProfile && !s.sellerProfile.isApproved;
    if (tab === 1) return s.sellerProfile?.isApproved;
    return true;
  });

  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />
      <Box flex={1} p={3}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Store color="primary" />
          <Typography variant="h5" fontWeight={700}>Kelola Seller</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ borderRadius: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
            <Tab label={`Menunggu Approval (${sellers.filter((s) => s.sellerProfile && !s.sellerProfile.isApproved).length})`} />
            <Tab label={`Aktif (${sellers.filter((s) => s.sellerProfile?.isApproved).length})`} />
            <Tab label={`Semua (${sellers.length})`} />
          </Tabs>

          {loading ? (
            <Box p={6} textAlign="center"><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box p={6} textAlign="center">
              <Store sx={{ fontSize: 48, color: "text.disabled" }} />
              <Typography color="text.secondary" mt={1}>Tidak ada seller</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Seller</TableCell>
                    <TableCell>Nama Usaha</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Jam</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((seller) => (
                    <TableRow key={seller.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={seller.sellerProfile?.photoUrl || undefined} sx={{ width: 40, height: 40 }}>
                            {seller.name[0]}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} variant="body2">{seller.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{seller.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{seller.sellerProfile?.businessName}</Typography>
                        <Typography variant="caption" color="text.secondary">{seller.sellerProfile?.address}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{seller.sellerProfile?.serviceArea}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{seller.sellerProfile?.operatingHours}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} flexDirection="column" alignItems="flex-start">
                          <Chip
                            size="small"
                            label={seller.sellerProfile?.isApproved ? "Disetujui" : "Menunggu"}
                            color={seller.sellerProfile?.isApproved ? "success" : "warning"}
                          />
                          {seller.sellerProfile?.isApproved && (
                            <Chip
                              size="small"
                              label={seller.sellerProfile?.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                              color={seller.sellerProfile?.isAvailable ? "primary" : "default"}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => router.push(`/admin/sellers/${seller.id}`)}
                          >
                            Detail
                          </Button>
                          {!seller.sellerProfile?.isApproved ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={actionLoading === seller.id ? <CircularProgress size={14} color="inherit" /> : <CheckCircle />}
                              onClick={() => handleApprove(seller.id, true)}
                              disabled={actionLoading === seller.id}
                            >
                              Approve
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleApprove(seller.id, false)}
                              disabled={actionLoading === seller.id}
                            >
                              Revoke
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
