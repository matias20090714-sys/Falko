"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { getVideoEmbedUrl } from "@/lib/media";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Film,
  Layers,
  Lock,
  MessageSquare,
  Package,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  X,
  Zap,
} from "lucide-react";

interface LibraryClientProps {
  orders: any[];
  subscriptions?: any[];
  currentUser: any;
}

export function LibraryClient({
  orders: initialOrders,
  subscriptions: initialSubscriptions = [],
  currentUser,
}: LibraryClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [subscriptions, setSubscriptions] = useState<any[]>(initialSubscriptions);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null);
  const [selectedOrderForSupport, setSelectedOrderForSupport] = useState<any>(null);
  const [activeVideoOrderId, setActiveVideoOrderId] = useState<string | null>(null);

  // Completed lessons tracking in localStorage
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // Review Form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Refund Form state
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Support message state
  const [supportMsg, setSupportMsg] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);

  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("falko_completed_lessons");
      if (saved) setCompletedLessons(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const updated = { ...prev, [lessonId]: !prev[lessonId] };
      localStorage.setItem("falko_completed_lessons", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDownload = async (fileId: string, orderId: string) => {
    setDownloadingFileId(fileId);
    try {
      const res = await fetch("/api/downloads/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, orderId }),
      });

      const data = await res.json();
      if (data.success && data.downloadUrl) {
        window.location.href = data.downloadUrl;
      } else {
        alert(data.error || "No se pudo generar el enlace de descarga.");
      }
    } catch {
      alert("Error al procesar la descarga.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReview) return;
    setSubmittingReview(true);

    try {
      const product = selectedOrderForReview.items[0]?.product;
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForReview.id,
          productId: product.id,
          rating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedOrderForReview(null);
        setReviewTitle("");
        setReviewComment("");
        setStatusMessage("¡Gracias! Tu opinión ha sido publicada.");
        setTimeout(() => setStatusMessage(""), 4000);
      } else {
        alert(data.error || "Error al enviar reseña.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRefund) return;
    setSubmittingRefund(true);

    try {
      const res = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderForRefund.id,
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedOrderForRefund(null);
        setRefundReason("");
        setStatusMessage("Solicitud de reembolso enviada a administración.");
        setTimeout(() => setStatusMessage(""), 4000);
      } else {
        alert(data.error || "Error al solicitar reembolso.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    setSendingSupport(true);
    setTimeout(() => {
      setSelectedOrderForSupport(null);
      setSupportMsg("");
      setSendingSupport(false);
      setStatusMessage("Tu mensaje ha sido enviado al creador. Te responderá a tu correo.");
      setTimeout(() => setStatusMessage(""), 5000);
    }, 1000);
  };

  const handleCancelSubscription = async (subId: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta membresía? Ya no se realizarán más cobros.")) return;
    try {
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subId }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, status: "CANCELLED" } : s))
        );
        setStatusMessage("Membresía cancelada correctamente. No se realizarán más cobros.");
        setTimeout(() => setStatusMessage(""), 4000);
      } else {
        alert(data.error || "No se pudo cancelar la membresía.");
      }
    } catch {
      alert("Error al comunicarse con el servidor.");
    }
  };

  if (orders.length === 0 && subscriptions.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 my-8 shadow-2xl">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-1">Tu biblioteca está vacía</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          Aún no has adquirido recursos digitales o membresías. Explora nuestro marketplace con garantía respaldada.
        </p>
        <Link href="/marketplace" className="btn-falcon-primary text-xs py-2.5 px-5 shadow-glow">
          Explorar Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center gap-2 shadow-glow">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Active Subscriptions Section */}
      {subscriptions.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Mis Membresías & Suscripciones Activas</h2>
            </div>
            <span className="text-xs text-purple-300 font-semibold bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              {subscriptions.filter((s) => s.status === "ACTIVE").length} Activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                      {sub.billingInterval === "YEARLY" ? "Membresía Anual" : "Membresía Mensual"}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate">{sub.product?.title}</h3>
                    <p className="text-xs font-mono text-cyan-400 font-semibold mt-0.5">
                      {formatCurrency(sub.amount, sub.currencyCode)} {sub.billingInterval === "YEARLY" ? "/ año" : "/ mes"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-white/10"
                    }`}
                  >
                    {sub.status === "ACTIVE" ? "✓ Activa" : "Cancelada"}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {sub.status === "ACTIVE" ? (
                      <>Próximo cobro: <strong className="text-slate-200">{new Date(sub.nextBillingDate).toLocaleDateString()}</strong></>
                    ) : (
                      "Sin cobros pendientes"
                    )}
                  </span>
                  {sub.status === "ACTIVE" && (
                    <button
                      type="button"
                      onClick={() => handleCancelSubscription(sub.id)}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-bold hover:underline"
                    >
                      Cancelar membresía
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => {
          const product = order.items[0]?.product;
          if (!product) return null;

          const releaseDate = new Date(order.guaranteeReleaseDate);
          const isWithinGuarantee = new Date() < releaseDate;
          const hasReviewed = order.reviews?.length > 0;
          const hasRefundRequested = order.refunds?.length > 0;

          const parsedVideo = product.videoUrl ? getVideoEmbedUrl(product.videoUrl) : null;
          const isVideoOpen = activeVideoOrderId === order.id;

          return (
            <div
              key={order.id}
              className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6"
            >
              {/* Top Row: Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-slate-900 text-cyan-400 border border-white/10 px-2.5 py-1 rounded-lg font-bold">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    Comprado el {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isWithinGuarantee ? (
                    <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Garantía activa hasta {releaseDate.toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-900 text-slate-400 border border-white/5 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Garantía cumplida
                    </span>
                  )}
                </div>
              </div>

              {/* Middle Row: Product Card Details */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                  <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="text-lg font-heading font-bold text-white line-clamp-1">{product.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{product.shortDescription || product.description}</p>
                  <div className="text-xs text-slate-400 flex items-center gap-4 pt-1">
                    <span>
                      Vendedor: <strong>{product.seller?.firstName} {product.seller?.lastName}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col gap-2 shrink-0 justify-center">
                  <button
                    onClick={() => setSelectedOrderForSupport(order)}
                    className="btn-falcon-secondary text-xs py-2 px-3 justify-center text-slate-300"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    Contactar Creador
                  </button>

                  {!hasReviewed && (
                    <button
                      onClick={() => setSelectedOrderForReview(order)}
                      className="btn-falcon-secondary text-xs py-2 px-3 justify-center"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      Dejar Opinión
                    </button>
                  )}

                  {isWithinGuarantee && !hasRefundRequested && (
                    <button
                      onClick={() => setSelectedOrderForRefund(order)}
                      className="text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 py-1.5 px-3 rounded-lg text-center transition-colors"
                    >
                      Solicitar Reembolso
                    </button>
                  )}
                </div>
              </div>

              {/* External Access Link Box */}
              {product.accessUrl && (
                <div className="bg-purple-950/30 border border-purple-900/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-purple-400" />
                      Acceso a Plataforma / Contenido Privado (Notion / Drive / SaaS)
                    </span>
                    <a
                      href={product.accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-falcon-primary text-xs py-1.5 px-4"
                    >
                      Abrir Recurso
                    </a>
                  </div>
                  {product.accessInstructions && (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-white/5">
                      <strong>Instrucciones:</strong> {product.accessInstructions}
                    </p>
                  )}
                </div>
              )}

              {/* Video Player */}
              {product.videoUrl && parsedVideo && (
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-cyan-400" />
                      Clase en Video / Contenido Audiovisual
                    </span>
                    <button
                      onClick={() => setActiveVideoOrderId(isVideoOpen ? null : order.id)}
                      className="btn-falcon-secondary text-xs py-1 px-3"
                    >
                      {isVideoOpen ? "Ocultar Reproductor" : "Reproducir Video"}
                    </button>
                  </div>

                  {isVideoOpen && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/10 max-w-2xl mx-auto shadow-2xl">
                      {parsedVideo.type === "youtube" || parsedVideo.type === "vimeo" || parsedVideo.type === "loom" ? (
                        <iframe
                          src={parsedVideo.embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={parsedVideo.embedUrl} controls className="w-full h-full object-contain" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Digital Files Vault */}
              {product.files && product.files.length > 0 && (
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      Archivos Digitales Descargables
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      URL temporal firmada (15 min)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="bg-slate-900/80 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 mr-3">
                          <span className="font-bold text-white block truncate">{file.fileName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {(file.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(file.id, order.id)}
                          disabled={downloadingFileId === file.id}
                          className="btn-falcon-primary text-xs py-1.5 px-3 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingFileId === file.id ? "Generando..." : "Descargar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Message Modal */}
      {selectedOrderForSupport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Contactar al Creador
              </h4>
              <button onClick={() => setSelectedOrderForSupport(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Escribe tu consulta o duda sobre el producto. El vendedor recibirá tu mensaje y te responderá directamente.
            </p>

            <form onSubmit={handleSendSupport} className="space-y-4">
              <textarea
                required
                rows={4}
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                placeholder="¿Tienes alguna pregunta sobre el archivo o el acceso? Escríbela aquí..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForSupport(null)}
                  className="btn-falcon-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingSupport}
                  className="btn-falcon-primary py-2 px-5 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingSupport ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedOrderForReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Calificar Producto
              </h4>
              <button onClick={() => setSelectedOrderForReview(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Calificación</label>
                <div className="flex gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${s <= rating ? "fill-amber-400" : "text-slate-600"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título de la opinión</label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Ej: Excelente contenido y prompts"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Comentario detallado</label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="¿Cómo te ayudó este producto? Cuéntale a otros compradores..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForReview(null)}
                  className="btn-falcon-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-falcon-primary py-2 px-4 text-xs"
                >
                  {submittingReview ? "Publicando..." : "Publicar Opinión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {selectedOrderForRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Solicitar Reembolso de Garantía
              </h4>
              <button onClick={() => setSelectedOrderForRefund(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Estás dentro del período de garantía garantizado por FALKO. Indícanos el motivo de tu solicitud.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo del Reembolso</label>
                <textarea
                  required
                  rows={4}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Explica brevemente por qué el producto no cumplió tus expectativas..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForRefund(null)}
                  className="btn-falcon-secondary py-2 px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-xl text-xs"
                >
                  {submittingRefund ? "Enviando..." : "Confirmar Reembolso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
