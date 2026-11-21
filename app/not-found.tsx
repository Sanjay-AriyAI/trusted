import type { Metadata } from "next";
import Link from "next/link";
import { StatusPage } from "@/components/layout/StatusPage";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <StatusPage
      code="404 — Off the map"
      title="This page"
      accent="didn’t make the cohort."
      body="The link may be broken or the page may have moved. Head back to the academy to find your program."
      actions={
        <Link className="button button-gold button-large" href="/">
          Back to the academy
        </Link>
      }
    />
  );
}
