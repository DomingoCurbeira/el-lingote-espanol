# El Lingote Español · Tortillas & Paellas

Landing + configurador de pedidos construido con React, TypeScript, Tailwind CSS y Vite.

## Requisitos

- Node.js 20+ recomendado
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Luego abre la dirección que muestra Vite (normalmente `http://localhost:5173`).

## Generar versión para servidor

```bash
npm run build
```

La carpeta `dist/` es la que puedes publicar en Netlify, Vercel, GitHub Pages u otro servidor estático.

## Configuración importante

Abre `src/main.tsx` y cambia estas tres variables antes de publicar:

```ts
const WHATSAPP_NUMBER = '50600000000'
const SINPE_NUMBER = '0000-0000'
const PAELLERA_DEPOSIT = 10000
```

- `WHATSAPP_NUMBER`: número de WhatsApp en formato internacional, sin `+`, espacios ni guiones.
- `SINPE_NUMBER`: número que recibirá los pagos.
- `PAELLERA_DEPOSIT`: depósito reembolsable por paellera.

## Qué hace esta primera versión

- Landing responsive mobile-first.
- Paleta de marca: rojo Lingote, azafrán, carbón, marfil y oliva.
- Catálogo de paellas, tortilla, postre y complementos.
- Carrito/pedido sin backend.
- Banquete Familiar con un clic.
- Selección de personas, fecha y franja de recogida.
- Cálculo del subtotal y depósito de paellera.
- Generación automática del pedido y apertura de WhatsApp.
- No guarda datos personales en una base de datos.

## Siguiente fase recomendada

Cuando quieras gestionar cupos reales y pedidos desde un panel, se puede añadir Supabase para tener:

- disponibilidad real por franja,
- pedidos confirmados,
- estados: pendiente / pagado / en producción / listo / entregado,
- control de paelleras,
- panel privado para administración.
