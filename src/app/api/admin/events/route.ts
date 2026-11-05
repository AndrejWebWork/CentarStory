import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  httpUrl,
  isAdminCookie,
  readManaged,
  removeLocalImage,
  saveImage,
  uniqueSlug,
  writeManaged,
  type ManagedEvent,
} from "@/lib/events/managed";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

async function allowed() {
  const jar = await cookies();
  return isAdminCookie(jar.get(ADMIN_COOKIE)?.value);
}

export async function POST(request: Request) {
  if (!(await allowed())) return NextResponse.json({ ok: false }, { status: 401 });
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const summary = String(form.get("summary") ?? "").trim();
  const story = String(form.get("story") ?? "").trim();
  const officialUrl = httpUrl(String(form.get("officialUrl") ?? ""));
  if (!name || !summary || !officialUrl) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }

  const current = String(form.get("slug") ?? "").trim();
  const events = readManaged();
  const existing = current ? events.find((event) => event.slug === current) : undefined;
  const slug = existing ? existing.slug : uniqueSlug(name);
  const file = form.get("image");
  let imageUrl = existing?.imageUrl ?? "";
  const pasted = String(form.get("imageUrl") ?? "").trim();
  if (file instanceof File && file.size > 0) {
    if (!imageTypes.has(file.type) || file.size > 5_000_000) {
      return NextResponse.json({ ok: false, error: "image" }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (imageUrl.startsWith("/events/")) removeLocalImage(imageUrl);
    imageUrl = saveImage(slug, bytes, file.type);
  } else if (pasted) {
    const remote = httpUrl(pasted);
    if (!remote) return NextResponse.json({ ok: false, error: "image" }, { status: 400 });
    if (imageUrl.startsWith("/events/") && imageUrl !== remote) removeLocalImage(imageUrl);
    imageUrl = remote;
  }

  const links = [1, 2].flatMap((index) => {
    const url = httpUrl(String(form.get(`linkUrl${index}`) ?? ""));
    const label = String(form.get(`linkLabel${index}`) ?? "").trim();
    return url && label ? [{ label, url }] : [];
  });

  const next: ManagedEvent = {
    slug,
    name,
    summary,
    story: story || summary,
    season: String(form.get("season") ?? "").trim(),
    startDate: String(form.get("startDate") ?? "").trim(),
    endDate: String(form.get("endDate") ?? "").trim(),
    officialUrl,
    links,
    imageUrl,
    placeLabel: String(form.get("placeLabel") ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };
  const without = events.filter((event) => event.slug !== slug);
  writeManaged([next, ...without]);
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(request: Request) {
  if (!(await allowed())) return NextResponse.json({ ok: false }, { status: 401 });
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  const events = readManaged();
  const target = events.find((event) => event.slug === slug);
  if (!target) return NextResponse.json({ ok: false }, { status: 404 });
  removeLocalImage(target.imageUrl);
  writeManaged(events.filter((event) => event.slug !== slug));
  return NextResponse.json({ ok: true });
}
