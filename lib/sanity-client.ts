import { createClient, type SanityClient } from "next-sanity";
import {
  sanityDataset,
  sanityProjectId,
  sanityReadToken,
  sanityWriteToken,
} from "./env";

export function createSanityClient(mode: "read" | "write"): SanityClient | null {
  const projectId = sanityProjectId();
  if (!projectId) {
    return null;
  }
  const token = mode === "write" ? sanityWriteToken() : sanityReadToken();
  return createClient({
    projectId,
    dataset: sanityDataset(),
    apiVersion: "2026-10-01",
    useCdn: mode === "read" && !token,
    token,
    perspective: "published",
  });
}
