"use client";

/**
 * Compresses an image file directly in the browser using HTML5 Canvas.
 * Outputs a lightweight, high-fidelity WebP/JPEG Data URL.
 * Works seamlessly on PC, Mac, iOS Safari, Android gallery and file picker.
 */
export async function processAndCompressImage(
  file: File,
  maxDimension: number = 1400,
  quality: number = 0.85
): Promise<{ url: string; name: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      return reject(new Error("El archivo seleccionado no es una imagen válida."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al procesar la imagen."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = Math.round(maxDimension);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback to raw data url
          return resolve({
            url: reader.result as string,
            name: file.name,
            sizeBytes: file.size,
          });
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
        } catch {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        // Estimate size from data URL
        const base64Length = dataUrl.length - (dataUrl.indexOf(",") + 1);
        const approxBytes = Math.round((base64Length * 3) / 4);

        resolve({
          url: dataUrl,
          name: file.name,
          sizeBytes: approxBytes,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
