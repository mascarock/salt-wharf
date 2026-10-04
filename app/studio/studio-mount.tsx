"use client";

import dynamic from "next/dynamic";

// Studio only renders in the browser. Loading it with ssr: false keeps
// Sanity Studio out of the server bundle, so the Cloudflare worker stays small.
const Studio = dynamic(() => import("./studio"), { ssr: false });

export function StudioMount() {
  return <Studio />;
}
