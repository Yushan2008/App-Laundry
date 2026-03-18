"use client";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Data Pelanggan
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Semua pelanggan yang terdaftar di Signature Laundry
        </Typography>

        <Card>
          <CardContent>
            {loading ? (
              <Box textAlign="center" py={4}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 700 }}>Pelanggan</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>No. HP</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Alamat</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Pesanan</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Bergabung</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}>
                              {user.name[0].toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.address || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${user._count?.orders || 0} pesanan`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ color: "text.secondary", py: 4 }}>
                          Belum ada pelanggan terdaftar
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
