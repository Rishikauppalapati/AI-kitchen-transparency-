import { AiError, judgePhoto } from "@/lib/gemini";
import { CHECKS } from "@/lib/checks";
import { MAX_UPLOAD_BYTES, sniffImageType, validateImage } from "@/lib/rules";
import type { AiResult } from "@/lib/types";

export const maxDuration = 30;

// "invalid" = the upload itself is the problem (nothing changes). "ai" = the AI service failed.
type Body = { ok: true; result: AiResult } | { ok: false; kind: "invalid" | "ai"; message: string };
const reply = (body: Body, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply({ ok: false, kind: "invalid", message: "We couldn't read that upload. Please try again." }, 400);
  }

  const checkId = form.get("checkId");
  const photo = form.get("photo");

  if (typeof checkId !== "string" || !Object.hasOwn(CHECKS, checkId)) {
    return reply({ ok: false, kind: "invalid", message: "Unknown check." }, 400);
  }
  if (!(photo instanceof File)) {
    return reply({ ok: false, kind: "invalid", message: "Please choose a photo first." }, 400);
  }

  const problem = validateImage(photo, MAX_UPLOAD_BYTES);
  if (problem) return reply({ ok: false, kind: "invalid", message: problem }, 400);

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const real = sniffImageType(bytes);
  if (!real) {
    return reply({ ok: false, kind: "invalid", message: "That file isn't a photo we can read. Please use a JPG, PNG or WebP picture." }, 400);
  }

  try {
    const result = await judgePhoto(checkId, Buffer.from(bytes).toString("base64"), real);
    return reply({ ok: true, result });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Something went wrong. Please try again.";
    return reply({ ok: false, kind: "ai", message }, 502);
  }
}
