import restaurants from "@/data/restaurants.json";
import { checkKitchenPhoto, CheckError } from "@/lib/gemini";
import { retakeReason, validateUpload } from "@/lib/rules";
import type { CheckResponse } from "@/lib/types";

export const maxDuration = 30;

function reply(body: CheckResponse, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply({ status: "error", message: "We could not read that upload. Please try again." }, 400);
  }

  const restaurantId = form.get("restaurantId");
  const signedBy = String(form.get("signedBy") ?? "").trim();
  const photo = form.get("photo");

  if (!restaurants.some((r) => r.id === restaurantId)) {
    return reply({ status: "error", message: "Unknown restaurant." }, 400);
  }
  if (!signedBy || signedBy.length > 60) {
    return reply({ status: "retake", reason: "Please type your name (up to 60 letters) to sign off the check." });
  }
  if (!(photo instanceof File)) {
    return reply({ status: "retake", reason: "Please choose a photo first." });
  }

  const uploadProblem = validateUpload(photo);
  if (uploadProblem) {
    return reply({ status: "retake", reason: uploadProblem });
  }

  try {
    const bytes = Buffer.from(await photo.arrayBuffer());
    const result = await checkKitchenPhoto(bytes.toString("base64"), photo.type);

    const reason = retakeReason(result);
    if (reason) {
      return reply({ status: "retake", reason });
    }

    return reply({
      status: "verified",
      check: {
        at: new Date().toISOString(),
        signedBy,
        summary: result.summary,
        confidence: result.confidence,
        checks: result.checks,
      },
    });
  } catch (err) {
    const message = err instanceof CheckError ? err.message : "Something went wrong. Please try again.";
    return reply({ status: "error", message }, 502);
  }
}
