# HI TRAVEL

Sitio web de HI TRAVEL construido con Next.js, con panel administrativo demo y una integración inicial con OpenWA para envío de mensajes por WhatsApp.

## Desarrollo local

```bash
npm install
npm run dev
```

## Integración con OpenWA

Esta app no ejecuta OpenWA dentro del repo. Se conecta a una instancia externa de OpenWA por API usando rutas internas de Next.

### 1. Levantar OpenWA

```bash
git clone https://github.com/rmyndharis/OpenWA.git
cd OpenWA
docker compose up -d
```

Servicios esperados:

- Dashboard: `http://localhost:2886`
- API: `http://localhost:2785/api`
- Swagger: `http://localhost:2785/api/docs`

### 2. Configurar OpenWA

1. Entra al dashboard.
2. Crea un `API Key`.
3. Crea una sesión.
4. Inicia la sesión y escanea el código QR con WhatsApp.

### 3. Configurar variables en este proyecto

Copia `.env.example` a `.env.local` y completa los valores:

```bash
OPENWA_BASE_URL=http://localhost:2785/api
OPENWA_API_KEY=tu_api_key
OPENWA_SESSION_ID=tu_session_id
OPENWA_TARGET_PHONE=573001234567
OPENWA_DEFAULT_COUNTRY_CODE=57
OPENWA_WEBHOOK_SECRET=tu_secret_opcional
```

Notas:

- `OPENWA_TARGET_PHONE` es el número que recibirá los leads del formulario público.
- Si en el panel admin escribes un número de 10 dígitos, la app asumirá el indicativo `57`.
- El webhook queda preparado en `/api/whatsapp/webhook` para futuras automatizaciones.

## Flujos implementados

### Formulario público

El formulario de [contacto](src/app/contacto/page.tsx) envía los datos a:

- `POST /api/whatsapp/contact`

Ese endpoint reenvía el lead a `OPENWA_TARGET_PHONE` por OpenWA.

### Envío manual desde admin

El panel tiene una nueva vista:

- `/admin/whatsapp`

Esa pantalla usa:

- `POST /api/whatsapp/send`

para enviar mensajes manuales a cualquier número.

### Webhook base

Está disponible:

- `GET /api/whatsapp/webhook`
- `POST /api/whatsapp/webhook`

Si defines `OPENWA_WEBHOOK_SECRET`, la ruta intentará validar la firma del webhook.

## Verificación sugerida

1. Levanta OpenWA y deja una sesión conectada.
2. Configura `.env.local`.
3. Ejecuta `npm run dev`.
4. Envía una prueba desde `/contacto`.
5. Envía una prueba desde `/admin/whatsapp`.
6. Si quieres probar el webhook, registra en OpenWA la URL local publicada por tu túnel (`ngrok`, `cloudflared`, etc.).
