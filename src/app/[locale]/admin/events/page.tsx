import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminLogin, EventDesk } from "@/components/admin/event-desk";
import { ADMIN_COOKIE, adminPassword, isAdminCookie, readManaged } from "@/lib/events/managed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Настани",
  robots: { index: false, follow: false },
};

export default async function AdminEventsPage() {
  const password = adminPassword();
  if (!password) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-4xl leading-none">Настани</h1>
        <p className="mt-4 text-sm leading-relaxed">
          Стави лозинка во ADMIN_PASSWORD во .env и пушти го серверот повторно. Потоа оваа страница ќе го отвори уредувањето.
        </p>
      </div>
    );
  }
  const jar = await cookies();
  if (!isAdminCookie(jar.get(ADMIN_COOKIE)?.value)) return <AdminLogin />;
  return <EventDesk events={readManaged()} />;
}
