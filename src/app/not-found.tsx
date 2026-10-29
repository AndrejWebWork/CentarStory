import en from "../../messages/en.json";
import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-5xl leading-none">{en.common.notFoundTitle}</h1>
      <p className="mt-4 text-ink-soft">{en.common.notFoundBody}</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center text-copper">
        {en.common.home}
      </Link>
    </div>
  );
}
