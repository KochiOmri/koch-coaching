import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir, stat, unlink, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function generateFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const random = Math.random().toString(36).substring(2, 8);
  return `${Date.now()}-${random}${ext}`;
}

function classifyFile(mimeType: string): "video" | "image" | null {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return "image";
  return null;
}

async function ensureDir(dirPath: string) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch {
    // already exists
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const results: Array<{
      name: string;
      url: string;
      size: number;
      type: string;
    }> = [];
    const errors: string[] = [];

    for (const file of files) {
      const category = classifyFile(file.type);

      if (!category) {
        errors.push(
          `${file.name}: Unsupported file type (${file.type || "unknown"})`
        );
        continue;
      }

      const maxSize = category === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        const limitMB = maxSize / (1024 * 1024);
        errors.push(
          `${file.name}: Exceeds ${limitMB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`
        );
        continue;
      }

      const subdir = category === "video" ? "videos" : "images";
      const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
      await ensureDir(uploadDir);

      const filename = generateFilename(file.name);
      const filePath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const url = `/uploads/${subdir}/${filename}`;
      results.push({ name: filename, url, size: file.size, type: file.type });
    }

    return NextResponse.json({ uploaded: results, errors }, { status: 200 });
  } catch (error) {
    console.error("Upload POST error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

async function scanDir(
  dirPath: string,
  urlPrefix: string,
  category: "video" | "image",
): Promise<Array<{
  name: string;
  url: string;
  size: number;
  type: string;
  category: "video" | "image";
  uploadDate: string;
  source: "existing" | "uploaded";
}>> {
  const results: Array<{
    name: string; url: string; size: number; type: string;
    category: "video" | "image"; uploadDate: string; source: "existing" | "uploaded";
  }> = [];

  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return results;
  }

  for (const name of entries) {
    if (name.startsWith(".")) continue;
    const filePath = path.join(dirPath, name);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) continue;

    const ext = path.extname(name).toLowerCase().slice(1);
    if (category === "video" && !VIDEO_EXTENSIONS.has(ext)) continue;
    if (category === "image" && !IMAGE_EXTENSIONS.has(ext)) continue;

    let mimeType = "application/octet-stream";
    if (VIDEO_EXTENSIONS.has(ext)) {
      mimeType = ext === "mov" ? "video/quicktime" : `video/${ext}`;
    } else if (IMAGE_EXTENSIONS.has(ext)) {
      mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    }

    results.push({
      name,
      url: `${urlPrefix}/${name}`,
      size: fileStat.size,
      type: mimeType,
      category,
      uploadDate: fileStat.mtime.toISOString(),
      source: urlPrefix.includes("uploads") ? "uploaded" : "existing",
    });
  }

  return results;
}

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const uploadsDir = path.join(publicDir, "uploads");
    await ensureDir(path.join(uploadsDir, "videos"));
    await ensureDir(path.join(uploadsDir, "images"));

    const allFiles = [
      ...(await scanDir(path.join(publicDir, "videos"), "/videos", "video")),
      ...(await scanDir(path.join(uploadsDir, "videos"), "/uploads/videos", "video")),
      ...(await scanDir(path.join(uploadsDir, "images"), "/uploads/images", "image")),
      ...(await scanDir(path.join(publicDir, "images"), "/images", "image")),
    ];

    allFiles.sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );

    return NextResponse.json({ files: allFiles });
  } catch (error) {
    console.error("Upload GET error:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();
    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const sanitized = path.basename(filename);
    const baseDir = path.join(process.cwd(), "public", "uploads");

    for (const subdir of ["videos", "images"]) {
      const filePath = path.join(baseDir, subdir, sanitized);
      try {
        const fileStat = await stat(filePath);
        if (fileStat.isFile()) {
          await unlink(filePath);
          return NextResponse.json({ deleted: sanitized });
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch (error) {
    console.error("Upload DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
