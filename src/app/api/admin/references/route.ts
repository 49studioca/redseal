import { NextResponse } from "next/server";
import { REFERENCE_DOC_CEC_ID } from "@/data/seed";
import { createServiceClient } from "@/lib/supabase/server";

const REFERENCES_BUCKET = "references";

export const maxDuration = 120;

function referenceStoragePath(docType: string, codeVersion: string): string {
  const version = codeVersion.replace(/^[A-Z]+-/i, "").toLowerCase();
  if (docType === "CEC") return `cec-${version}.pdf`;
  return `${docType.toLowerCase()}-${codeVersion.toLowerCase()}.pdf`;
}

function referenceDocId(docType: string, codeVersion: string): string | undefined {
  if (docType === "CEC" && codeVersion === "CEC-2024") {
    return REFERENCE_DOC_CEC_ID;
  }
  return undefined;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Reference document";
    const docType = (formData.get("doc_type") as string) || "CEC";
    const codeVersion = (formData.get("code_version") as string) || "CEC-2024";

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 },
      );
    }

    const storagePath = referenceStoragePath(docType, codeVersion);
    const docId = referenceDocId(docType, codeVersion);
    const supabase = await createServiceClient();
    const bytes = await file.arrayBuffer();

    if (bytes.byteLength === 0) {
      return NextResponse.json(
        {
          error:
            "Upload received an empty file. If the PDF is large, restart the dev server after updating next.config.ts body limits.",
        },
        { status: 400 },
      );
    }

    const { error: uploadError } = await supabase.storage
      .from(REFERENCES_BUCKET)
      .upload(storagePath, bytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: uploadError.message.includes("Bucket not found")
            ? "Storage bucket \"references\" not found. Run Supabase migrations or create the bucket in the dashboard."
            : uploadError.message,
        },
        { status: 500 },
      );
    }

    const docPayload = {
      ...(docId ? { id: docId } : {}),
      title: title.replace(/\.pdf$/i, "") || `${docType} ${codeVersion}`,
      doc_type: docType,
      code_version: codeVersion,
      storage_path: storagePath,
      is_licensed: true,
    };

    const { error: docError } = await supabase
      .from("reference_docs")
      .upsert(docPayload, docId ? { onConflict: "id" } : undefined);

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Uploaded ${file.name}. Open-book PDF viewer is now available.`,
      doc_type: docType,
      code_version: codeVersion,
      storage_path: storagePath,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 },
    );
  }
}
