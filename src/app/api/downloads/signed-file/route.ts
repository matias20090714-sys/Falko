import { NextRequest, NextResponse } from "next/server";
import { verifyAndAuthorizeDownload } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token de descarga requerido." }, { status: 400 });
    }

    const authResult = await verifyAndAuthorizeDownload(token);

    if (!authResult.valid || !authResult.file) {
      return new NextResponse(authResult.error || "Descarga denegada.", { status: 403 });
    }

    const { file } = authResult;

    // Return mock binary payload or digital asset stream
    const content = Buffer.from(
      `--- FALKO DIGITAL VAULT ---\n` +
      `Producto: ${file.product.title}\n` +
      `Archivo: ${file.fileName}\n` +
      `Licencia: Comprador Verificado FALKO\n` +
      `Descargado: ${new Date().toISOString()}\n\n` +
      `Gracias por tu compra en FALKO Marketplace.\n` +
      `Este archivo está protegido bajo los términos de uso y derechos de autor del creador.\n`
    );

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": file.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    return new NextResponse("Error en el servidor de descargas.", { status: 500 });
  }
}
