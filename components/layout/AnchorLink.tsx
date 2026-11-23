import type { ComponentPropsWithoutRef } from "react";

/**
 * Plain <a> for in-page section anchors ("/#programs").
 * Deliberately not next/link: on the landing page the cinematic scroll engine intercepts these clicks
 * and turns them into timeline jumps; from other pages they're a normal navigation to "/" + hash.
 */
export function AnchorLink(props: ComponentPropsWithoutRef<"a"> & { href: `/#${string}` }) {
  return <a {...props} />;
}
