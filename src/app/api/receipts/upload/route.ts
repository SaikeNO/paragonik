import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const login = cookieStore.get("login")?.value;
  if (!login) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { login } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, file.name);
  await writeFile(filePath, buffer);

  const itemsRaw = formData.get("items") as string | null;
  const tagsRaw = formData.get("tags") as string | null;
  const dateRaw = formData.get("date") as string | null;
  if (!dateRaw) return NextResponse.json({ error: "No date" }, { status: 400 });

  let items: string[] = [];
  let tags: string[] = [];
  let date: Date | undefined = undefined;

  if (itemsRaw) {
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      items = [];
    }
  }
  if (tagsRaw) {
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = [];
    }
  }
  if (dateRaw) {
    date = new Date(dateRaw);
  }

  const tagRecords = await Promise.all(
    tags.map(async (tagName) => {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
      }
      return tag;
    })
  );

  const receipt = await prisma.receipt.create({
    data: {
      userId: user.id,
      fileUrl: `/uploads/${file.name}`,
      date: date ? date : undefined,
      tags: {
        connect: tagRecords.map((tag) => ({ id: tag.id })),
      },
      items: {
        create: items.map((name) => ({ name })),
      },
    },
    include: {
      tags: true,
      items: true,
    },
  });

  return NextResponse.json({ receipt });
}
