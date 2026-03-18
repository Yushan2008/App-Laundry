"use client";

import { Box, Container, CircularProgress, Alert, Button } from "@mui/material";
import { ArrowBack, Print } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import NotaView from "@/components/order/NotaView";

interface NotaOrder {
  id: string;
  orderNumber: string;
  status: string;
  weight: number | null;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  package: { name: string; pricePerKg: number; durationDays: number };
  user: { name: string; email: string; phone: string | null; address: string | null };
  statusHistory: { id: string; status: string; description: string | null; createdAt: string }[];
}

export default function CustomerNotaPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<NotaOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data pesanan. Silakan refresh halaman.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />
        <Box sx={{ textAlign: "center", py: 10 }}>
          <CircularProgress sx={{ color: "primary.main" }} />
        </Box>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error || "Pesanan tidak ditemukan"}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Action Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            variant="outlined"
            size="small"
            sx={{ borderColor: "divider", color: "text.secondary" }}
          >
            Kembali
          </Button>
          <Button
            startIcon={<Print />}
            onClick={() => window.print()}
            variant="contained"
            size="small"
            sx={{
              background: "linear-gradient(135deg, #4f46e5, #0d9488)",
              fontWeight: 700,
              "&:hover": { background: "linear-gradient(135deg, #3730a3, #0f766e)" },
            }}
          >
            Cetak / Simpan PDF
          </Button>
        </Box>

        {/* Nota */}
        <NotaView order={order} />
      </Container>
    </Box>
  );
}
