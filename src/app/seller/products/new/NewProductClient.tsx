"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CURRENCY_RATES, computeFinancialSplit, formatCurrency } from "@/lib/currency";
import { getVideoEmbedUrl } from "@/lib/media";
import {
  DollarSign,
  FileCode,
  FileText,
  Film,
  Globe,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Lock,
  Percent,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
  Zap,
} from "lucide-react";

interface UploadedFileItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  storageKey: string;
  url?: string;
}

interface NewProductClientProps {
  categories: any[];
  currentUser: any;
}

export function NewProductClient({ categories, currentUser }: NewProductClientProps) {
  const router = useRouter();

  // Basic Form
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "49.00",
    currencyCode: "USD",
    categoryId: categories[0]?.id || "",
    guaranteeDays: 7, // Minimum 7
    affiliateEnabled: true,
    affiliateCommissionPct: 30,
    affiliateApprovalMode: "AUTO", // AUTO | MANUAL
    coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    demoUrl: "",
    videoUrl: "",
    accessUrl: "",
    accessInstructions: "",
  });

  // Uploaded Files List
  const [digitalFiles, setDigitalFiles] = useState<UploadedFileItem[]>([
    {
      id: "initial-1",
      fileName: "paquete_recursos_digitales.zip",
      fileSizeBytes: 26214400, // 25 MB
      fileType: "application/zip",
      storageKey: "vault/paquete_recursos_digitales.zip",
    },
  ]);

  // Gallery Images List
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Uploading state indicators
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const numPrice = parseFloat(formData.price) || 0;
  const split = computeFinancialSplit({
    productPrice: numPrice,
    currencyCode: formData.currencyCode,
    affiliateCommissionPct: formData.affiliateEnabled ? formData.affiliateCommissionPct : 0,
    hasAffiliate: formData.affiliateEnabled,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Helper for uploading files via /api/upload
  const uploadFileToServer = async (file: File, category: "image" | "video" | "file") => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Error al subir el archivo");
    }
    return data.file;
  };

  // Cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const uploaded = await uploadFileToServer(file, "image");
      setFormData((prev) => ({ ...prev, coverImageUrl: uploaded.url }));
    } catch (err: any) {
      alert(err.message || "Error al subir la imagen");
    } finally {
      setUploadingCover(false);
    }
  };

  // Gallery image upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const uploaded = await uploadFileToServer(files[i], "image");
        setGalleryImages((prev) => [...prev, uploaded.url]);
      }
    } catch (err: any) {
      alert(err.message || "Error al subir imagen de galería");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!customImageUrl.trim()) return;
    setGalleryImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl("");
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Digital deliverable file upload
  const handleDeliverableFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await uploadFileToServer(file, "file");
        setDigitalFiles((prev) => [
          ...prev,
          {
            id: `file-${Date.now()}-${Math.random()}`,
            fileName: uploaded.fileName,
            fileSizeBytes: uploaded.fileSizeBytes,
            fileType: uploaded.fileType,
            storageKey: uploaded.storageKey,
            url: uploaded.url,
          },
        ]);
      }
    } catch (err: any) {
      alert(err.message || "Error al subir archivo");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setDigitalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Direct Video file upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const uploaded = await uploadFileToServer(file, "video");
      setFormData((prev) => ({ ...prev, videoUrl: uploaded.url }));
    } catch (err: any) {
      alert(err.message || "Error al subir video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (numPrice <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    if (formData.guaranteeDays < 7) {
      setError("La garantía no puede ser inferior a 7 días según las normas de FALKO.");
      return;
    }

    if (digitalFiles.length === 0 && !formData.accessUrl.trim() && !formData.videoUrl.trim()) {
      setError("Debes incluir al menos un archivo descargable, un video o un enlace de acceso para tus compradores.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          files: digitalFiles.map((f) => ({
            fileName: f.fileName,
            fileSizeBytes: f.fileSizeBytes,
            fileType: f.fileType,
            storageKey: f.storageKey,
          })),
          images: galleryImages.map((imgUrl, idx) => ({
            imageUrl: imgUrl,
            sortOrder: idx,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/product/${data.product.slug}`);
        router.refresh();
      } else {
        setError(data.error || "Error al crear el producto.");
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const parsedVideo = getVideoEmbedUrl(formData.videoUrl);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl flex items-center gap-2">
          <X className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Info */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h3 className="text-base font-heading font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          1. Información del Producto
        </h3>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Título del Producto *</label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ej: Master Prompts para Creadores de Contenido en IA"
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Subtítulo o Resumen Corto</label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="50+ workflows y guías para generar $3,000/mes con automatizaciones."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Enlace de Demostración Pública (Opcional)</label>
            <input
              type="url"
              name="demoUrl"
              value={formData.demoUrl}
              onChange={handleChange}
              placeholder="https://preview.misitio.com"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Descripción Completa del Contenido *</label>
          <textarea
            required
            rows={5}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detalla lo que incluye el producto, a quién va dirigido y cómo utilizarlo..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* 2. Multimedia: Portada, Galería y Video */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="text-base font-heading font-bold text-white mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          2. Portada, Galería de Imágenes y Video del Producto
        </h3>

        {/* Portada Principal */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 block">
              Imagen de Portada Principal *
            </label>
            <span className="text-[11px] text-slate-400">Recomendado: 1280x720 (16:9)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1 aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
              {formData.coverImageUrl ? (
                <img
                  src={formData.coverImageUrl}
                  alt="Portada"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">Sin portada</span>
                </div>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-cyan-400 font-bold">
                  Subiendo...
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  name="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/... o sube una imagen"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="btn-falcon-secondary text-xs px-4 shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  {uploadingCover ? "Subiendo..." : "Subir Imagen"}
                </button>
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Puedes pegar una URL directa o subir cualquier imagen en formato JPG, PNG, WebP o GIF.
              </p>
            </div>
          </div>
        </div>

        {/* Galería de Imágenes Adicionales */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">
                Galería de Imágenes y Mockups (Opcional)
              </label>
              <p className="text-[11px] text-slate-400">
                Muestra capturas de pantalla, previews del material o resultados para aumentar las ventas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              {uploadingGallery ? "Subiendo..." : "Añadir Fotos"}
            </button>
            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleGalleryUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="O pega una URL de imagen para agregar a la galería..."
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
            <button
              type="button"
              onClick={handleAddGalleryUrl}
              className="btn-falcon-secondary text-xs px-3 shrink-0"
            >
              Agregar URL
            </button>
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {galleryImages.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group"
                >
                  <img src={imgUrl} alt={`Galería ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center text-slate-500 text-xs">
              Sin imágenes adicionales añadidas. Puedes cargar varias imágenes a la vez.
            </div>
          )}
        </div>

        {/* Video / Clase / Demo */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
                <Film className="w-4 h-4 text-purple-400" />
                Video del Producto / Clase / Demo Audiovisual (Opcional)
              </label>
              <p className="text-[11px] text-slate-400">
                Soporta enlaces de YouTube (público o no listado), Vimeo, Loom, Bunny Stream, o archivo MP4 subido.
              </p>
            </div>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingVideo}
              className="btn-falcon-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              {uploadingVideo ? "Subiendo..." : "Subir Archivo de Video"}
            </button>
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
            />
          </div>

          <div>
            <input
              type="text"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=... o https://www.loom.com/share/..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          {/* Video Preview Player */}
          {formData.videoUrl && (
            <div className="rounded-xl overflow-hidden border border-purple-900/50 bg-black aspect-video max-w-lg mx-auto shadow-lg">
              {parsedVideo.type === "youtube" || parsedVideo.type === "vimeo" || parsedVideo.type === "loom" ? (
                <iframe
                  src={parsedVideo.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : parsedVideo.type === "direct" ? (
                <video src={parsedVideo.embedUrl} controls className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <Play className="w-8 h-8 text-purple-400 mb-2" />
                  <span className="text-xs text-slate-300 font-mono break-all">{formData.videoUrl}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Entrega Digital: Archivos Descargables y Link Externo */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="text-base font-heading font-bold text-white mb-2 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          3. Entrega Digital: Archivos Descargables y Enlace de Acceso
        </h3>

        {/* 3.1 Archivos Descargables */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-200 block">
                Archivos Digitales Descargables (Bóveda Segura FALKO)
              </label>
              <p className="text-[11px] text-slate-400">
                Sube tus paquetes ZIP, PDFs, ebooks, código, audios, APKs o documentos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="btn-falcon-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadingFile ? "Cargando archivo..." : "Subir Archivo"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDeliverableFileUpload}
              multiple
              className="hidden"
            />
          </div>

          {/* Files List */}
          <div className="space-y-2.5">
            {digitalFiles.map((file) => (
              <div
                key={file.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{file.fileName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(file.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB • {file.fileType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono hidden sm:inline-block">
                    Cifrado AES-256
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            Los archivos solo son accesibles por compradores con token temporal de 15 minutos.
          </p>
        </div>

        {/* 3.2 Enlace de Acceso Externo / Plataforma */}
        <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-purple-400" />
              Enlace de Acceso Externo (Notion, Google Drive, Discord, Telegram, SaaS) (Opcional)
            </label>
            <p className="text-[11px] text-slate-400">
              Si tu producto es una plantilla de Notion, carpeta en la nube, comunidad exclusiva o software web, pega el enlace aquí.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">URL de Acceso Privado</label>
            <input
              type="url"
              name="accessUrl"
              value={formData.accessUrl}
              onChange={handleChange}
              placeholder="Ej: https://notion.so/... o https://drive.google.com/... o https://discord.gg/..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Instrucciones de Acceso para el Comprador
            </label>
            <textarea
              rows={3}
              name="accessInstructions"
              value={formData.accessInstructions}
              onChange={handleChange}
              placeholder="Ej: Haz clic en el botón para duplicar la plantilla en tu espacio de trabajo de Notion. Si tienes dudas, contáctanos a..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Pricing & Financial Rules */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <h3 className="text-base font-heading font-bold text-white mb-2 flex items-center justify-between">
          <span>4. Precio, Garantía y Reparto Contable</span>
          <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
            Regla FALKO 25 UYU Base
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Precio Base *</label>
            <input
              type="number"
              step="0.01"
              required
              min="1"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda Base</label>
            <select
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono"
            >
              {Object.keys(CURRENCY_RATES).map((code) => (
                <option key={code} value={code}>
                  {code} ({CURRENCY_RATES[code].symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Período de Garantía (Mín. 7 días) *
            </label>
            <select
              name="guaranteeDays"
              value={formData.guaranteeDays}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 text-xs focus:outline-none focus:border-cyan-400 font-bold"
            >
              <option value="7">7 Días de Garantía (Estándar)</option>
              <option value="14">14 Días de Garantía (Recomendado)</option>
              <option value="30">30 Días de Garantía (Máxima Confianza)</option>
            </select>
          </div>
        </div>

        {/* Live Financial Breakdown Simulator Box */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-cyan-500/30 shadow-glow space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Simulación Contable por Venta Unitaria
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Calculado en Servidor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-purple-950/30 border border-purple-900/50 p-3 rounded-xl">
              <span className="text-purple-300 text-[11px] block">Comisión Afiliado ({formData.affiliateEnabled ? formData.affiliateCommissionPct : 0}%)</span>
              <span className="text-base font-black font-mono text-purple-400">
                {formatCurrency(split.affiliateCommissionAmount, formData.currencyCode)}
              </span>
            </div>

            <div className="bg-cyan-950/30 border border-cyan-900/50 p-3 rounded-xl">
              <span className="text-cyan-300 text-[11px] block">Tarifa Plataforma FALKO</span>
              <span className="text-base font-black font-mono text-cyan-400">
                {formatCurrency(split.platformFeeConverted, formData.currencyCode)}
              </span>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl">
              <span className="text-emerald-300 text-[11px] block font-bold">Tu Ganancia Neta</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {formatCurrency(split.sellerEarningAmount, formData.currencyCode)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Los ingresos permanecerán en tu saldo retenido durante los {formData.guaranteeDays} días de garantía y luego pasarán automáticamente a saldo disponible para retiro.
          </p>
        </div>
      </div>

      {/* 5. Affiliate Program Settings */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-white">
              5. Programa de Afiliados para este Producto
            </h3>
            <p className="text-xs text-slate-400">
              Permite que la red de promotores de FALKO venda tu producto a cambio de una comisión.
            </p>
          </div>
          <input
            type="checkbox"
            name="affiliateEnabled"
            checked={formData.affiliateEnabled}
            onChange={handleChange}
            className="w-5 h-5 accent-cyan-400 cursor-pointer"
          />
        </div>

        {formData.affiliateEnabled && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Porcentaje de Comisión para Afiliados:</span>
                <span className="font-mono font-bold text-purple-400">{formData.affiliateCommissionPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                name="affiliateCommissionPct"
                value={formData.affiliateCommissionPct}
                onChange={handleChange}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10% (Bajo)</span>
                <span>30% - 50% (Recomendado)</span>
                <span>80% (Ultra High-Ticket)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Modo de Aprobación de Afiliados *</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "AUTO" }))}
                  className={`p-3 rounded-xl border text-xs cursor-pointer ${
                    formData.affiliateApprovalMode === "AUTO"
                      ? "bg-cyan-950/40 border-cyan-500 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <strong className="block text-cyan-400">Automática (AUTO)</strong>
                  <span className="text-[11px] font-normal">Cualquier afiliado puede generar su enlace de inmediato.</span>
                </label>

                <label
                  onClick={() => setFormData((prev) => ({ ...prev, affiliateApprovalMode: "MANUAL" }))}
                  className={`p-3 rounded-xl border text-xs cursor-pointer ${
                    formData.affiliateApprovalMode === "MANUAL"
                      ? "bg-purple-950/40 border-purple-500 text-white font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <strong className="block text-purple-400">Manual (MANUAL)</strong>
                  <span className="text-[11px] font-normal">El afiliado debe solicitarte autorización previa.</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-falcon-secondary text-xs py-3 px-6"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || uploadingCover || uploadingGallery || uploadingFile || uploadingVideo}
          className="btn-falcon-primary text-sm py-3 px-8 shadow-glow"
        >
          <Zap className="w-4 h-4" />
          {loading ? "Publicando en FALKO..." : "Publicar Producto Ahora"}
        </button>
      </div>
    </form>
  );
}
