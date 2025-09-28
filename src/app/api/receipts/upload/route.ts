import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Konfiguracja walidacji plików
const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".pdf"],
};

function validateFile(file: File): { isValid: boolean; error?: string } {
  // Sprawdź rozmiar pliku
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      isValid: false,
      error: `Plik jest za duży. Maksymalny rozmiar to ${FILE_CONFIG.MAX_SIZE / 1024 / 1024}MB`,
    };
  }

  // Sprawdź typ MIME
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Nieprawidłowy format pliku. Dozwolone formaty: ${FILE_CONFIG.ALLOWED_TYPES.join(", ")}`,
    };
  }

  // Sprawdź rozszerzenie pliku
  const fileExtension = path.extname(file.name).toLowerCase();
  if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      error: `Nieprawidłowe rozszerzenie pliku. Dozwolone rozszerzenia: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Sprawdź czy plik nie jest pusty
  if (file.size === 0) {
    return {
      isValid: false,
      error: "Plik jest pusty",
    };
  }

  return { isValid: true };
}

function generateSafeFileName(originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const uuid = uuidv4();
  const timestamp = Date.now();

  // Usuń niebezpieczne znaki i zastąp je bezpiecznymi
  const safeName = originalName
    .replace(extension, "")
    .replace(/[^a-zA-Z0-9\-_]/g, "_")
    .substring(0, 50); // Ogranicz długość nazwy

  return `${timestamp}_${uuid}_${safeName}${extension}`;
}

async function validateFileContent(buffer: Buffer, mimeType: string): Promise<{ isValid: boolean; error?: string }> {
  // Podstawowa walidacja signature pliku (magic numbers)
  const signatures = {
    "image/jpeg": [0xff, 0xd8, 0xff],
    "image/png": [0x89, 0x50, 0x4e, 0x47],
    "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF
    "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
  };

  // Sprawdź signature dla znanych typów
  if (mimeType in signatures) {
    const signature = signatures[mimeType as keyof typeof signatures];
    const fileSignature = Array.from(buffer.subarray(0, signature.length));

    const isValidSignature = signature.every((byte, index) => fileSignature[index] === byte);

    if (!isValidSignature) {
      return {
        isValid: false,
        error: "Plik wydaje się być uszkodzony lub ma nieprawidłowy format",
      };
    }
  }

  // Dodatkowa walidacja dla PDF - sprawdź czy kończy się prawidłowo
  if (mimeType === "application/pdf") {
    const endBytes = buffer.subarray(-10).toString();
    if (!endBytes.includes("%%EOF") && !endBytes.includes("endobj")) {
      return {
        isValid: false,
        error: "Plik PDF wydaje się być uszkodzony",
      };
    }
  }

  return { isValid: true };
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const login = cookieStore.get("login")?.value;
    if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nie wybrano pliku" }, { status: 400 });
    }

    // Walidacja podstawowych właściwości pliku
    const fileValidation = validateFile(file);
    if (!fileValidation.isValid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Walidacja zawartości pliku
    const contentValidation = await validateFileContent(buffer, file.type);
    if (!contentValidation.isValid) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 });
    }

    // Tworzenie bezpiecznej nazwy pliku
    const safeFileName = generateSafeFileName(file.name);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, safeFileName);
    await writeFile(filePath, buffer);

    const itemsRaw = formData.get("items") as string | null;
    const tagsRaw = formData.get("tags") as string | null;
    const dateRaw = formData.get("date") as string | null;

    if (!dateRaw) {
      return NextResponse.json({ error: "Nie podano daty zakupu" }, { status: 400 });
    }

    let items: string[] = [];
    let tags: string[] = [];
    let date: Date | undefined = undefined;

    if (itemsRaw) {
      try {
        const parsedItems = JSON.parse(itemsRaw);
        if (Array.isArray(parsedItems)) {
          items = parsedItems.filter((item) => typeof item === "string" && item.trim().length > 0);
        }
      } catch {
        items = [];
      }
    }

    if (tagsRaw) {
      try {
        const parsedTags = JSON.parse(tagsRaw);
        if (Array.isArray(parsedTags)) {
          tags = parsedTags.filter((tag) => typeof tag === "string" && tag.trim().length > 0).slice(0, 20); // Ogranicz liczbę tagów
        }
      } catch {
        tags = [];
      }
    }

    if (dateRaw) {
      const parsedDate = new Date(dateRaw);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      } else {
        return NextResponse.json({ error: "Nieprawidłowy format daty" }, { status: 400 });
      }
    }

    const tagRecords = await Promise.all(
      tags.map(async (tagName) => {
        const sanitizedTagName = tagName.trim().substring(0, 50); // Ogranicz długość

        let tag = await prisma.tag.findFirst({
          where: {
            name: sanitizedTagName,
            userId: user.id,
          },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: sanitizedTagName,
              userId: user.id,
            },
          });
        }
        return tag;
      })
    );

    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        fileUrl: `/uploads/${safeFileName}`,
        date: date ? date : new Date(),
        tags: {
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        },
        items: {
          create: items
            .slice(0, 50) // Ogranicz liczbę produktów
            .map((name) => ({
              name: name.trim().substring(0, 255), // Ogranicz długość nazwy produktu
            })),
        },
      },
      include: {
        tags: true,
        items: true,
      },
    });

    return NextResponse.json({
      receipt,
      message: "Paragon został pomyślnie dodany",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Wystąpił błąd podczas przetwarzania pliku" }, { status: 500 });
  }
}
