"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="main" className="page-wrap about-page">
      <h1>The catalog couldn’t load.</h1>
      <p>
        Please try again. You can still find the original submissions on
        GameBanana.
      </p>
      <button className="button primary-button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
