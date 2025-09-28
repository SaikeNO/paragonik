import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { Tag } from "@/interfaces/interfaces";
import { getSession } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Sprawdź autoryzację
    const login = await getSession();
    if (!login) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { login } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Znajdź paragon z wszystkimi relacjami
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        tags: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Paragon nie został znaleziony" }, { status: 404 });
    }

    if (receipt.userId !== user.id) {
      return NextResponse.json({ error: "Brak uprawnień do usunięcia tego paragonu" }, { status: 403 });
    }

    console.log(`Usuwanie paragonu ${id} z ${receipt.items.length} items i ${receipt.tags.length} tagami`);

    // Usuń plik z systemu plików (jeśli istnieje)
    if (receipt.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", receipt.fileUrl);
        await unlink(filePath);
        console.log("Plik został usunięty z dysku");
      } catch (fileError) {
        console.error("Błąd podczas usywania pliku:", fileError);
      }
    }

    // Najpierw odłącz tagi (jeśli są)
    if (receipt.tags.length > 0) {
      await prisma.receipt.update({
        where: { id },
        data: {
          tags: {
            disconnect: receipt.tags.map((tag: Tag) => ({ id: tag.id })),
          },
        },
      });
      console.log(`Odłączono ${receipt.tags.length} tagów`);
    }

    // Usuń paragon - items powinny zostać usunięte automatycznie przez cascade
    await prisma.receipt.delete({
      where: { id },
    });
    console.log(`Usunięto paragon ${id}`);

    return NextResponse.json({
      success: true,
      message: "Paragon został pomyślnie usunięty",
    });
  } catch (error) {
    console.error("Błąd podczas usuwania paragonu:", error);

    // Szczegółowa obsługa błędów Prisma
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint failed")) {
        return NextResponse.json(
          {
            error: "Nie można usunąć paragonu - sprawdź konfigurację cascade w schema.prisma",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          {
            error: "Paragon już nie istnieje",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Wystąpił nieoczekiwany błąd podczas usuwania paragonu",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
