"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { ManagedEvent } from "@/lib/events/managed-types";

const empty = {
  slug: "",
  name: "",
  summary: "",
  story: "",
  season: "",
  startDate: "",
  endDate: "",
  officialUrl: "",
  placeLabel: "",
  imageUrl: "",
  linkLabel1: "",
  linkUrl1: "",
  linkLabel2: "",
  linkUrl2: "",
};

export function EventDesk({ events }: { events: ManagedEvent[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function fill(event: ManagedEvent) {
    setForm({
      slug: event.slug,
      name: event.name,
      summary: event.summary,
      story: event.story,
      season: event.season,
      startDate: event.startDate,
      endDate: event.endDate,
      officialUrl: event.officialUrl,
      placeLabel: event.placeLabel,
      imageUrl: event.imageUrl.startsWith("/events/") ? "" : event.imageUrl,
      linkLabel1: event.links[0]?.label ?? "",
      linkUrl1: event.links[0]?.url ?? "",
      linkLabel2: event.links[1]?.label ?? "",
      linkUrl2: event.links[1]?.url ?? "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    if (form.slug) data.set("slug", form.slug);
    const response = await fetch("/api/admin/events", { method: "POST", body: data });
    setPending(false);
    if (!response.ok) {
      setMessage("Провери ги насловот, описот, линкот и сликата. Сликата може да е jpg, png или webp до 5 MB.");
      return;
    }
    setForm(empty);
    (event.target as HTMLFormElement).reset();
    setMessage("Настанот е зачуван и веќе е на страницата Настани.");
    router.refresh();
  }

  async function remove(slug: string) {
    if (!window.confirm("Да се избрише овој настан?")) return;
    const response = await fetch(`/api/admin/events?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Настанот не се избриша.");
      return;
    }
    if (form.slug === slug) setForm(empty);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  function set(key: keyof typeof empty, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-copper uppercase">Настани</p>
          <h1 className="mt-2 font-display text-4xl leading-none">Додај или смени настан</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            Текстот се прикажува како што е напишан, на секој јазик. Сликата, описот и линковите остануваат на серверот.
          </p>
        </div>
        <button type="button" className="cs-btn cs-btn-ghost" onClick={logout}>
          Одјава
        </button>
      </div>

      <form onSubmit={save} className="grid gap-4 border border-line bg-foam p-5">
        <input type="hidden" name="slug" value={form.slug} />
        <Field label="Наслов" name="name" value={form.name} onChange={(value) => set("name", value)} required />
        <Field label="Краток опис" name="summary" value={form.summary} onChange={(value) => set("summary", value)} required long />
        <Field label="Подолг опис" name="story" value={form.story} onChange={(value) => set("story", value)} long />
        <Field label="Период, на пример ноември 2026" name="season" value={form.season} onChange={(value) => set("season", value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Почеток" name="startDate" type="date" value={form.startDate} onChange={(value) => set("startDate", value)} />
          <Field label="Крај" name="endDate" type="date" value={form.endDate} onChange={(value) => set("endDate", value)} />
        </div>
        <Field label="Место" name="placeLabel" value={form.placeLabel} onChange={(value) => set("placeLabel", value)} />
        <Field label="Официјален линк" name="officialUrl" type="url" value={form.officialUrl} onChange={(value) => set("officialUrl", value)} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Име на втор линк" name="linkLabel1" value={form.linkLabel1} onChange={(value) => set("linkLabel1", value)} />
          <Field label="Втор линк" name="linkUrl1" type="url" value={form.linkUrl1} onChange={(value) => set("linkUrl1", value)} />
          <Field label="Име на трет линк" name="linkLabel2" value={form.linkLabel2} onChange={(value) => set("linkLabel2", value)} />
          <Field label="Трет линк" name="linkUrl2" type="url" value={form.linkUrl2} onChange={(value) => set("linkUrl2", value)} />
        </div>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">Слика од компјутер</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-11" />
        </label>
        <Field label="Или адреса на слика" name="imageUrl" type="url" value={form.imageUrl} onChange={(value) => set("imageUrl", value)} />
        {form.slug ? <p className="text-sm text-ink-soft">Ја менуваш постоечката објава. Празно поле за слика ја остава старата.</p> : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="cs-btn cs-btn-ink" disabled={pending}>
            {pending ? "Се чува" : form.slug ? "Зачувај измена" : "Објави настан"}
          </button>
          {form.slug ? (
            <button type="button" className="cs-btn cs-btn-ghost" onClick={() => setForm(empty)}>
              Нова објава
            </button>
          ) : null}
        </div>
        {message ? <p className="text-sm">{message}</p> : null}
      </form>

      <ul className="divide-y divide-line border-y border-line">
        {events.length === 0 ? <li className="py-6 text-sm text-ink-soft">Уште нема додадени настани.</li> : null}
        {events.map((event) => (
          <li key={event.slug} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-display text-2xl leading-none">{event.name}</p>
              <p className="mt-1 text-xs text-ink-soft">{event.startDate || event.season || "Без датум"}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="cs-btn cs-btn-ghost" onClick={() => fill(event)}>
                Измени
              </button>
              <button type="button" className="cs-btn cs-btn-ghost" onClick={() => remove(event.slug)}>
                Избриши
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  long = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  long?: boolean;
}) {
  const className = "min-h-11 w-full border border-line bg-paper px-3 py-2";
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      {long ? (
        <textarea name={name} required={required} value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={className} />
      ) : (
        <input name={name} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
    </label>
  );
}

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setPending(false);
    if (!response.ok) {
      setError("Лозинката не е точна.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-md gap-4 px-4 py-16">
      <h1 className="font-display text-4xl leading-none">Настани</h1>
      <p className="text-sm leading-relaxed text-ink-soft">Влези за да додаваш и менуваш настани.</p>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Лозинка</span>
        <input name="password" type="password" required autoComplete="current-password" className="min-h-11 border border-line bg-foam px-3" />
      </label>
      <button type="submit" className="cs-btn cs-btn-ink" disabled={pending}>
        {pending ? "Се проверува" : "Влез"}
      </button>
      {error ? <p className="text-sm">{error}</p> : null}
    </form>
  );
}
