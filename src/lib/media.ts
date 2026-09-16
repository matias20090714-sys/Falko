export function getVideoEmbedUrl(url: string): { type: "youtube" | "vimeo" | "loom" | "direct" | "unknown"; embedUrl: string } {
  if (!url) return { type: "unknown", embedUrl: "" };

  const trimmed = url.trim();

  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // Loom
  const loomMatch = trimmed.match(/(?:loom\.com\/share\/)([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: "loom",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // Direct video file (mp4, webm, ogg) or uploaded local file
  if (trimmed.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || trimmed.startsWith("/uploads/video/")) {
    return {
      type: "direct",
      embedUrl: trimmed,
    };
  }

  return {
    type: "unknown",
    embedUrl: trimmed,
  };
}
