import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  // Simpan instance io secara global agar bisa diakses dari API routes
  (global as { io?: SocketIOServer }).io = io;

  io.on("connection", (socket) => {
    // Customer bergabung ke room pesanan untuk melacak seller
    socket.on("track-order", (orderId: string) => {
      socket.join(`order-${orderId}`);
    });

    // Seller mengirim update lokasi real-time
    socket.on(
      "location-update",
      (data: { orderId: string; lat: number; lng: number }) => {
        io.to(`order-${data.orderId}`).emit("seller-location", {
          lat: data.lat,
          lng: data.lng,
        });
      }
    );

    socket.on("disconnect", () => {
      // cleanup otomatis oleh Socket.io
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
