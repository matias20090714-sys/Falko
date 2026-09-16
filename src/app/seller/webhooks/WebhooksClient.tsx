"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Webhook,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code,
  Copy,
  ExternalLink,
  Zap,
  ArrowLeft,
  RefreshCw,
  Eye,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  secretKey: string;
  events: string;
  isActive: boolean;
  productId: string | null;
  createdAt: string;
  deliveries: Array<{
    id: string;
    event: string;
    statusCode: number | null;
    durationMs: number;
    status: string;
    createdAt: string;
    requestPayload: string;
    responseBody: string | null;
    error: string | null;
  }>;
  _count: {
    deliveries: number;
  };
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
}

interface WebhooksClientProps {
  initialWebhooks: WebhookItem[];
  products: ProductItem[];
}

export function WebhooksClient({ initialWebhooks, products }: WebhooksClientProps) {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(initialWebhooks);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [productId, setProductId] = useState<string>("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "order.completed",
    "order.refunded",
    "cart.abandoned",
  ]);

  // Test Ping Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<WebhookItem | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testEvent, setTestEvent] = useState("order.completed");

  // Expanded log row state
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showHMACGuide, setShowHMACGuide] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/seller/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Mi Webhook",
          url,
          productId: productId || null,
          events: selectedEvents.join(","),
        }),
      });

      const data = await res.json();
      if (data.success && data.webhook) {
        setWebhooks([
          {
            ...data.webhook,
            deliveries: [],
            _count: { deliveries: 0 },
          },
          ...webhooks,
        ]);
        setIsCreating(false);
        setName("");
        setUrl("");
        setProductId("");
      } else {
        alert(data.error || "Error al crear el webhook.");
      }
    } catch (err) {
      alert("Error de conexión al registrar el webhook.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este webhook?")) return;

    try {
      const res = await fetch(`/api/seller/webhooks?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setWebhooks(webhooks.filter((w) => w.id !== id));
      } else {
        alert(data.error || "Error al eliminar webhook.");
      }
    } catch {
      alert("Error de conexión al eliminar.");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/seller/webhooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhooks(
          webhooks.map((w) => (w.id === id ? { ...w, isActive: !currentStatus } : w))
        );
      }
    } catch {
      alert("Error al actualizar el estado del webhook.");
    }
  };

  const handleRunTestPing = async (webhook: WebhookItem) => {
    setTestingWebhook(webhook);
    setTestResult(null);
    setTestModalOpen(true);
    setIsTesting(true);

    try {
      const res = await fetch("/api/seller/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookId: webhook.id,
          url: webhook.url,
          event: testEvent,
          productId: webhook.productId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult(data.result);
      } else {
        setTestResult({
          isSuccess: false,
          httpStatus: 500,
          error: data.error || "Error desconocido al ejecutar el test.",
        });
      }
    } catch (err: any) {
      setTestResult({
        isSuccess: false,
        httpStatus: 0,
        error: err.message || "Fallo de conexión en el test.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const toggleEvent = (eventKey: string) => {
    if (selectedEvents.includes(eventKey)) {
      if (selectedEvents.length === 1) return; // Keep at least 1
      setSelectedEvents(selectedEvents.filter((e) => e !== eventKey));
    } else {
      setSelectedEvents([...selectedEvents, eventKey]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Back Link */}
      <div>
        <Link
          href="/seller"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Seller Studio
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Integraciones & Automatización
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                API & CRMs
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white flex items-center gap-2.5">
              <Webhook className="w-7 h-7 text-cyan-400" />
              Webhooks para Creadores
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Recibe los datos de cada venta, reembolso y carrito abandonado en tiempo real en tus propias herramientas de email marketing, CRMs (Zapier, Make, ActiveCampaign, Klaviyo, Google Sheets).
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="btn-falcon-primary text-xs py-2.5 px-4 shadow-glow flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Webhook</span>
          </button>
        </div>
      </div>

      {/* Integration Presets Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Zapier
              </span>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-amber-800/40 font-mono">
                Popular
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Crea un trigger de tipo <strong>Webhooks by Zapier (Catch Hook)</strong> y pega la URL aquí para conectar con +5,000 apps.
            </p>
          </div>
          <button
            onClick={() => {
              setName("Zapier Automation");
              setIsCreating(true);
            }}
            className="mt-3 text-[11px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1"
          >
            Configurar Zapier &rarr;
          </button>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Make.com
              </span>
              <span className="text-[10px] bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded-md border border-purple-800/40 font-mono">
                Avanzado
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Usa el módulo <strong>Custom Webhook</strong> de Make para automatizar flujos complejos de facturación y CRM.
            </p>
          </div>
          <button
            onClick={() => {
              setName("Make.com Scenario");
              setIsCreating(true);
            }}
            className="mt-3 text-[11px] text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1"
          >
            Configurar Make &rarr;
          </button>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> ActiveCampaign
              </span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-800/40 font-mono">
                Email Marketing
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Añade etiquetas de comprador VIP inmediatamente tras la confirmación de pago y lanza secuencias de onboarding.
            </p>
          </div>
          <button
            onClick={() => {
              setName("ActiveCampaign Leads");
              setIsCreating(true);
            }}
            className="mt-3 text-[11px] text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1"
          >
            Configurar ActiveCampaign &rarr;
          </button>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" /> API Propia / Backend
              </span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-800/40 font-mono">
                HMAC SHA-256
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Recibe payloads firmados criptográficamente en tu propio servidor (Node, Python, Go, PHP) de forma 100% segura.
            </p>
          </div>
          <button
            onClick={() => setShowHMACGuide(!showHMACGuide)}
            className="mt-3 text-[11px] text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1"
          >
            {showHMACGuide ? "Ocultar Guía HMAC" : "Ver Guía de Firma"} &rarr;
          </button>
        </div>
      </div>

      {/* HMAC Documentation Drawer */}
      {showHMACGuide && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 bg-slate-950/90 animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Verificación de Firma Criptográfica HMAC SHA-256
            </h3>
            <button
              onClick={() => setShowHMACGuide(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cerrar
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Falko envía en cada petición el encabezado <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">X-Falko-Signature: sha256=HEX_SIGNATURE</code>.
            Puedes verificar que el mensaje proviene legítimamente de Falko usando tu clave secreta:
          </p>
          <div className="bg-slate-900/90 rounded-xl p-4 border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto">
            <span className="text-slate-500">// Ejemplo en Node.js / Express</span>
            <br />
            {`const crypto = require("crypto");`}
            <br />
            {`function verifyFalkoSignature(rawBody, signatureHeader, secretKey) {`}
            <br />
            {`  const hash = crypto.createHmac("sha256", secretKey).update(rawBody).digest("hex");`}
            <br />
            {`  return signatureHeader === ("sha256=" + hash);`}
            <br />
            {`}`}
          </div>
        </div>
      )}

      {/* Modal / Create Webhook Form */}
      {isCreating && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-slate-950/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white">Registrar Nuevo Webhook</h2>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateWebhook} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre Descriptivo *
                </label>
                <input
                  type="text"
                  placeholder="ej: Zapier - Google Sheets Ventas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-falcon text-xs w-full py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Producto Específico (Opcional)
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="input-falcon text-xs w-full py-2.5"
                >
                  <option value="">Todos mis productos (Global)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL del Webhook (Endpoint) *
              </label>
              <input
                type="url"
                placeholder="https://hooks.zapier.com/hooks/catch/... o https://tu-crm.com/api/webhooks"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="input-falcon text-xs w-full py-2.5 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Falko enviará una petición HTTP POST con el payload JSON a esta dirección inmediatamente al ocurrir el evento.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Eventos a Suscribirse:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => toggleEvent("order.completed")}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedEvents.includes("order.completed")
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 ${
                      selectedEvents.includes("order.completed")
                        ? "bg-emerald-500 border-emerald-400 text-slate-950"
                        : "border-slate-600"
                    }`}
                  >
                    {selectedEvents.includes("order.completed") && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">order.completed</span>
                    <span className="text-[10px] text-slate-400">Compra exitosa confirmada</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleEvent("order.refunded")}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedEvents.includes("order.refunded")
                      ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 ${
                      selectedEvents.includes("order.refunded")
                        ? "bg-rose-500 border-rose-400 text-slate-950"
                        : "border-slate-600"
                    }`}
                  >
                    {selectedEvents.includes("order.refunded") && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">order.refunded</span>
                    <span className="text-[10px] text-slate-400">Reembolso procesado</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => toggleEvent("cart.abandoned")}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    selectedEvents.includes("cart.abandoned")
                      ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center mt-0.5 ${
                      selectedEvents.includes("cart.abandoned")
                        ? "bg-amber-500 border-amber-400 text-slate-950"
                        : "border-slate-600"
                    }`}
                  >
                    {selectedEvents.includes("cart.abandoned") && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">cart.abandoned</span>
                    <span className="text-[10px] text-slate-400">Cliente inició y abandonó</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn-falcon-secondary text-xs py-2 px-4"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-falcon-primary text-xs py-2 px-6 shadow-glow"
              >
                {isSubmitting ? "Guardando..." : "Guardar & Activar Webhook"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Webhooks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Webhooks Activos</span>
            <span className="text-xs font-mono bg-slate-900 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
              {webhooks.length}
            </span>
          </h2>
        </div>

        {webhooks.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl border border-white/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center text-cyan-400">
              <Webhook className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Aún no tienes Webhooks configurados</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Conecta tu cuenta de Zapier, Make o CRM para recibir automáticamente los datos de cada cliente que compra o abandona tu checkout.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-falcon-primary text-xs py-2 px-4 shadow-glow inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Crear mi primer Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((hook) => {
              const matchedProduct = products.find((p) => p.id === hook.productId);
              return (
                <div
                  key={hook.id}
                  className={`glass-panel rounded-2xl border transition-all ${
                    hook.isActive ? "border-slate-800 hover:border-cyan-500/40" : "border-slate-900 opacity-60"
                  } p-5 space-y-4`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{hook.name}</h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            hook.isActive
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : "bg-slate-900 text-slate-400 border-slate-700"
                          }`}
                        >
                          {hook.isActive ? "ACTIVO" : "PAUSADO"}
                        </span>
                        {matchedProduct ? (
                          <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                            {matchedProduct.title}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-900 text-slate-300 border border-white/10 px-2 py-0.5 rounded-md">
                            Todos los productos
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/5 max-w-2xl overflow-hidden">
                        <span className="text-cyan-400 font-bold shrink-0">POST</span>
                        <span className="truncate">{hook.url}</span>
                        <button
                          onClick={() => copyToClipboard(hook.url, `url_${hook.id}`)}
                          className="shrink-0 ml-auto text-slate-400 hover:text-white"
                          title="Copiar URL"
                        >
                          {copiedKey === `url_${hook.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRunTestPing(hook)}
                        className="btn-falcon-primary text-xs py-1.5 px-3 shadow-glow flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>⚡ Probar Webhook</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(hook.id, hook.isActive)}
                        className="btn-falcon-secondary text-xs py-1.5 px-3 text-slate-300"
                      >
                        {hook.isActive ? "Pausar" : "Activar"}
                      </button>

                      <button
                        onClick={() => handleDeleteWebhook(hook.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
                        title="Eliminar Webhook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Events & Secret Key Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Eventos:</span>
                      {hook.events.split(",").map((evt) => (
                        <span
                          key={evt}
                          className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 px-2 py-0.5 rounded-md"
                        >
                          {evt.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Clave Secreta HMAC:</span>
                      <code className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                        {hook.secretKey.slice(0, 10)}...{hook.secretKey.slice(-4)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(hook.secretKey, `sec_${hook.id}`)}
                        className="text-slate-400 hover:text-white"
                        title="Copiar Clave Secreta"
                      >
                        {copiedKey === `sec_${hook.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Delivery History Section for this Webhook */}
                  {hook.deliveries && hook.deliveries.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Últimos Envíos Registrados ({hook._count.deliveries} totales)
                      </span>
                      <div className="space-y-1.5">
                        {hook.deliveries.map((del) => {
                          const isExpanded = expandedLogId === del.id;
                          return (
                            <div
                              key={del.id}
                              className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                      del.statusCode && del.statusCode >= 200 && del.statusCode < 300
                                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                        : "bg-rose-950 text-rose-300 border border-rose-800"
                                    }`}
                                  >
                                    {del.statusCode ? `HTTP ${del.statusCode}` : "ERROR"}
                                  </span>
                                  <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                                    {del.event}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {del.durationMs}ms
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(del.createdAt).toLocaleTimeString()}
                                  </span>
                                  <button
                                    onClick={() => setExpandedLogId(isExpanded ? null : del.id)}
                                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Ocultar JSON</span>
                                        <ChevronUp className="w-3 h-3" />
                                      </>
                                    ) : (
                                      <>
                                        <span>Ver Payload</span>
                                        <ChevronDown className="w-3 h-3" />
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="mt-2 space-y-2 pt-2 border-t border-white/5">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                                      Payload Enviado (JSON):
                                    </span>
                                    <pre className="bg-slate-900 rounded-lg p-2.5 font-mono text-[10px] text-emerald-300 overflow-x-auto max-h-48">
                                      {JSON.stringify(JSON.parse(del.requestPayload || "{}"), null, 2)}
                                    </pre>
                                  </div>
                                  {del.responseBody && (
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                                        Respuesta del Servidor Receptor:
                                      </span>
                                      <pre className="bg-slate-900 rounded-lg p-2 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-24">
                                        {del.responseBody}
                                      </pre>
                                    </div>
                                  )}
                                  {del.error && (
                                    <div className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40">
                                      {del.error}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Test Ping Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-cyan-500/40 bg-slate-950 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Prueba en Vivo de Webhook</h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                    {testingWebhook?.url}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Event Selector for Test */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Tipo de Evento:</span>
              <select
                value={testEvent}
                onChange={(e) => setTestEvent(e.target.value)}
                className="input-falcon text-xs py-1 px-2.5"
              >
                <option value="order.completed">order.completed (Compra Exitosa)</option>
                <option value="order.refunded">order.refunded (Reembolso)</option>
                <option value="cart.abandoned">cart.abandoned (Carrito Abandonado)</option>
              </select>
              <button
                disabled={isTesting}
                onClick={() => testingWebhook && handleRunTestPing(testingWebhook)}
                className="btn-falcon-primary text-[11px] py-1 px-3 shadow-glow ml-auto"
              >
                {isTesting ? "Enviando..." : "Reenviar Test"}
              </button>
            </div>

            {/* Test Execution Result */}
            {isTesting ? (
              <div className="p-8 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300">Enviando petición HTTP POST y calculando latencia...</p>
              </div>
            ) : testResult ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    testResult.isSuccess
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.isSuccess ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">
                        {testResult.isSuccess ? "¡Webhook Recibido con Éxito!" : "Fallo en la Entrega"}
                      </span>
                      <span className="text-[10px] opacity-80 font-mono">
                        Status: HTTP {testResult.httpStatus || "N/A"} • Latencia: {testResult.durationMs}ms
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    Cuerpo de Respuesta de tu Receptor:
                  </span>
                  <pre className="bg-slate-900 rounded-xl p-3 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-24 border border-white/5">
                    {testResult.responseBody || "Sin cuerpo de respuesta"}
                  </pre>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    Payload de Prueba Transmitido:
                  </span>
                  <pre className="bg-slate-900 rounded-xl p-3 font-mono text-[10px] text-emerald-300 overflow-x-auto max-h-48 border border-white/5">
                    {JSON.stringify(testResult.sentPayload, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setTestModalOpen(false)}
                className="btn-falcon-secondary text-xs py-2 px-4"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
