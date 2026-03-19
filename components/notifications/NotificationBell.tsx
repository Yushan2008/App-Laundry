"use client";

import { useEffect, useState, useRef } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Notifications, NotificationsNone, CheckCircle } from "@mui/icons-material";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  orderId: string | null;
  createdAt: string;
}

const TYPE_COLOR: Record<string, "primary" | "success" | "warning" | "error" | "info"> = {
  ORDER_ASSIGNED: "primary",
  ORDER_ACCEPTED: "success",
  ORDER_DECLINED: "error",
  STATUS_UPDATE: "info",
  SELLER_APPROVED: "success",
  SELLER_REJECTED: "error",
  NEW_SELLER_REGISTRATION: "warning",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifs = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnread(d.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
    intervalRef.current = setInterval(fetchNotifs, 30000); // Poll setiap 30 detik
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    fetchNotifs();
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    await fetch("/api/notifications/read", { method: "PATCH" });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return "Baru saja";
    if (diff < 60) return `${diff} menit lalu`;
    if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
    return d.toLocaleDateString("id-ID");
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} color="inherit">
        <Badge badgeContent={unread} color="error" max={99}>
          {unread > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 360, maxHeight: 480, borderRadius: 2 } }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifikasi {unread > 0 && `(${unread})`}
          </Typography>
          {unread > 0 && (
            <Button
              size="small"
              startIcon={loading ? <CircularProgress size={12} /> : <CheckCircle />}
              onClick={handleMarkAllRead}
              disabled={loading}
            >
              Tandai Dibaca
            </Button>
          )}
        </Box>
        <Divider />

        {/* List */}
        {notifications.length === 0 ? (
          <Box p={4} textAlign="center">
            <NotificationsNone sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Belum ada notifikasi
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ maxHeight: 380, overflow: "auto", p: 0 }}>
            {notifications.map((notif, i) => (
              <Box key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.isRead ? "transparent" : "action.hover",
                    px: 2,
                    py: 1.5,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.25}>
                        <Typography variant="body2" fontWeight={notif.isRead ? 400 : 700}>
                          {notif.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={notif.type.replace(/_/g, " ")}
                          color={TYPE_COLOR[notif.type] || "default"}
                          sx={{ fontSize: 9, height: 16 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatTime(notif.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
