/**
 * Lee la URL pública del túnel ngrok (API local en :4040) y muestra qué poner en .env.local
 *
 * Uso:
 *   1. Terminal A: npm run dev  (o docker en :3000)
 *   2. Terminal B: npm run tunnel
 *   3. Terminal C: npm run tunnel:url
 */

const NGROK_API = "http://127.0.0.1:4040/api/tunnels";

async function main() {
  let response;

  try {
    response = await fetch(NGROK_API);
  } catch {
    console.error("No se pudo conectar a ngrok en http://127.0.0.1:4040");
    console.error("Primero ejecuta en otra terminal: npm run tunnel");
    process.exit(1);
  }

  if (!response.ok) {
    console.error("ngrok respondió con error", response.status);
    process.exit(1);
  }

  const payload = await response.json();
  const tunnels = payload.tunnels ?? [];
  const httpsTunnel =
    tunnels.find((t) => t.public_url?.startsWith("https://")) ??
    tunnels.find((t) => t.public_url);

  const publicUrl = httpsTunnel?.public_url?.replace(/\/$/, "");

  if (!publicUrl) {
    console.error("No hay túnel activo. Ejecuta: npm run tunnel");
    process.exit(1);
  }

  console.log("\n=== URL pública ngrok ===\n");
  console.log(publicUrl);
  console.log("\nCopia en .env.local (y reinicia npm run dev):\n");
  console.log(`NEXT_PUBLIC_SITE_URL=${publicUrl}`);
  console.log(`SITE_URL=${publicUrl}`);
  console.log("\nWebhook OpenWA (Admin → WhatsApp → Webhooks o API):\n");
  console.log(`${publicUrl}/api/whatsapp/webhook`);
  console.log("\nSitio admin:\n");
  console.log(`${publicUrl}/admin`);
  console.log("\nReservar (ejemplo):\n");
  console.log(`${publicUrl}/reservar/[slug-del-tour]`);
  console.log("");
}

await main();
