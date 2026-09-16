import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general"; // image | video | file | general

    if (!file) {
      return NextResponse.json({ success: false, error: "No se envió ningún archivo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${safeName}`;
    
    // Save to public uploads folder so it can be previewed/downloaded
    const uploadsDir = path.join(process.cwd(), "public", "uploads", category);
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${category}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      file: {
        fileName: file.name,
        fileSizeBytes: file.size,
        fileType: file.type || "application/octet-stream",
        url: publicUrl,
        storageKey: `vault/${uniqueFileName}`,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al subir archivo." }, { status: 500 });
  }
}
