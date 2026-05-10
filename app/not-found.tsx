import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-x flex min-h-screen flex-col items-center justify-center text-center">
      <div className="font-display text-7xl font-bold tracking-tight text-accent">404</div>
      <p className="mt-4 max-w-md text-ink-muted">
        Lost in the void. Let&rsquo;s get you back home.
      </p>
      <Link href="/en" className="btn-primary mt-8">Home →</Link>
    </main>
  );
}
