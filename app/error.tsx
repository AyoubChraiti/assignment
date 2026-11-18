'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <section><h1>Could not load this page</h1><p>Please try again.</p><button onClick={reset}>Try again</button></section>;
}
