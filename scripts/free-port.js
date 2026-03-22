/**
 * Membunuh proses yang menggunakan port tertentu sebelum server dijalankan.
 * Berfungsi di Windows, Mac, dan Linux.
 */
const { execSync } = require("child_process");
const port = process.argv[2] || "3000";

try {
  if (process.platform === "win32") {
    // Windows: cari PID yang pakai port lalu kill
    const output = execSync(`netstat -ano`, { stdio: "pipe" }).toString();
    const lines = output.split("\n").filter(
      (l) => l.includes(`:${port}`) && l.includes("LISTENING")
    );
    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "pipe" });
          console.log(`✓ Proses PID ${pid} di port ${port} dihentikan`);
        } catch {
          // Proses mungkin sudah mati
        }
      }
    });
  } else {
    // Mac/Linux
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "pipe" });
    console.log(`✓ Proses di port ${port} dihentikan`);
  }
} catch {
  // Tidak ada proses di port ini — tidak masalah
}
