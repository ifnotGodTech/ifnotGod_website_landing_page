import { describe, expect, it } from "vitest";
import { buildPageMetadata } from "./metadata";

describe("buildPageMetadata", () => {
  const metadata = buildPageMetadata({ title: "Pricing | Site", description: "Plans.", path: "/pricing" });

  it("uses the same title and description for search and sharing", () => {
    expect(metadata).toMatchObject({
      title: "Pricing | Site",
      description: "Plans.",
      openGraph: { title: "Pricing | Site", description: "Plans.", url: "/pricing", locale: "en_NG" },
      twitter: { card: "summary_large_image", title: "Pricing | Site", description: "Plans." },
    });
  });

  it("always includes the sharing image, with alt text matching the image file's", async () => {
    const { readFile } = await import("node:fs/promises");
    const alt = await readFile("src/app/opengraph-image.alt.txt", "utf8");
    const image = { url: "/opengraph-image.png", width: 1200, height: 630, alt: alt.trim() };

    expect(metadata.openGraph?.images).toEqual([image]);
    expect(metadata.twitter?.images).toEqual([image]);
  });

  it("gives the page its own canonical URL", () => {
    expect(metadata.alternates?.canonical).toBe("/pricing");
  });

  it("lets search engines index the page unless told not to", () => {
    expect(metadata.robots).toBeUndefined();
    expect(buildPageMetadata({ title: "", description: "", path: "/x", index: false }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
