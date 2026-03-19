/**
 * Menghitung jarak antara dua koordinat menggunakan formula Haversine.
 * @returns Jarak dalam kilometer
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Menghitung biaya pengiriman berdasarkan jarak dan jenis paket.
 * - Reguler: Rp 1.000/km (dibulatkan ke atas)
 * - Express: Gratis
 */
export function calculateDeliveryFee(
  distanceKm: number,
  packageName: string
): number {
  if (packageName.toLowerCase().includes("express")) return 0;
  return Math.ceil(distanceKm) * 1000;
}
