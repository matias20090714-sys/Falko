# 🦅 FALKO — International Digital Products Marketplace & SaaS

> **El marketplace donde los productos digitales se convierten en oportunidades.**  
> Plataforma tecnológica internacional para la compra, venta y afiliación de productos digitales con soporte multidivisa en 28+ países, garantía incondicional protegida (7-30 días), libro contable inmutable de doble entrada y ranking global en USD.

---

## ⚡ Características Principales

- 🦅 **Identidad Tecnológica Premium**: Diseño moderno con temática inspirada en el halcón (Falcon), paleta oscura/clara de alta tecnología, micro-interacciones, estética minimalista y logotipo SVG vectorizado.
- 💰 **Motor Financiero Server-Side Inmutable**:
  - Reparto contable estricto: **Comisión Afiliado (%) + Tarifa Fija FALKO (25 UYU Base Convertida) + Ganancia Neta Creador = Total Orden**.
  - Cero fugas contables o manipulación client-side de precios y comisiones.
- 🛡️ **Retención de Garantía (7, 14, 30 días)**:
  - Fondos retenidos en `pending_balance` durante el plazo de garantía.
  - Liberación automática a `available_balance` tras el cumplimiento del período.
  - Reversión contable automática en caso de reembolsos legítimos.
- 📊 **Ranking Global en USD & Barra Personalizada**:
  - Mide el **volumen total de ventas generado en USD** tanto para creadores como para afiliados.
  - Barra de progreso personal que muestra nivel actual (*Novato, Halcón Bronce, Plata, Oro, Diamante, Apex Falcon*), volumen acumulado y USD restantes para el siguiente hito.
- 🔗 **Sistema de Afiliados de Alto Rendimiento**:
  - Identificador único (ej: `AFF-000001`).
  - Modos de aprobación por producto: **AUTO** (generación instantánea) o **MANUAL** (moderación por el creador).
  - Protección anti-fraude y anti-auto-referidos.
- 🔒 **Descargas Digitales Privadas Firmadas**:
  - Tokens temporales criptográficos de 15 minutos sin exposición de URLs permanentes.
- 🌐 **Soporte Multidivisa en 28+ Países**:
  - Conversión en tiempo real con métodos de retiro locales (Pix en Brasil, BROU/Prex en Uruguay, SPEI en México, ACH/PayPal en EE.UU., etc.).
- 👑 **Panel Administrativo & Platform Owner Treasury**:
  - Supervisión de usuarios, moderación de productos, liquidación de retiros y billetera del propietario de FALKO para acumulación de comisiones.

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Server Actions & Next.js API Routes en TypeScript.
- **Base de Datos & ORM**: Prisma ORM con 22+ modelos relacionales (SQLite en local / PostgreSQL ready en producción).
- **Seguridad**: JWT en cookies HTTP-Only, Hashing bcrypt, URLs firmadas con HMAC SHA-256.
- **Abstracción de Pagos**: `PaymentProvider` (`MockPaymentProvider`, conectores Stripe / MercadoPago / PayPal).
- **Abstracción de Emails**: `EmailProvider` con plantillas para todo el ciclo de vida.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar e Instalar Dependencias
```bash
cd scratch/falko
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

### 3. Sincronizar Base de Datos y Sembrar Datos Demo
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
# o para producción:
npm run build && npm run start
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧪 Pruebas Automatizadas

Para validar las fórmulas financieras, conversión de tarifas de 25 UYU y lógica del ranking:
```bash
npm run test:financial
```

---

## 🔑 Cuentas Demo para Evaluación Rápida

| Rol | Correo | Contraseña | Funcionalidad |
|---|---|---|---|
| **🛡️ Admin** | `admin@falko.io` | `falko123` | Control total, tesorería de comisiones, retiros, reembolsos |
| **💼 Vendedor Top** | `seller@falko.io` | `falko123` | Publicación de productos, métricas de ventas, aprobación de afiliados |
| **💰 Afiliado Top** | `affiliate@falko.io` | `falko123` | Links `AFF-000001`, tracking de clics, comisiones |
| **📦 Comprador** | `buyer@falko.io` | `falko123` | Biblioteca de compras, descargas firmadas, opiniones |

---

© 2026 FALKO Technologies Inc. Todos los derechos reservados.
