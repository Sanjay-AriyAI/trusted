"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusPage } from "@/components/layout/StatusPage";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="Something went wrong"
      title="We hit"
      accent="an unexpected error."
      body="It’s on our side, not yours. Try again, or head back to the academy."
      actions={
        <>
          <button type="button" className="button button-gold button-large" onClick={reset}>
            Try again
          </button>
          <Link className="button button-ghost button-large" href="/">
            Back to the academy
          </Link>
        </>
      }
    />
  );
}
