import { describe, expect, it } from "vitest";
import { CONTACT_INFO } from "@/shared/constants";
import { buildOrganizationJsonLd } from "./structuredData";

describe("buildOrganizationJsonLd", () => {
  it("describes the organisation and its contact details", () => {
    const data = JSON.parse(buildOrganizationJsonLd("https://example.com"));

    expect(data["@type"]).toBe("Organization");
    expect(data.url).toBe("https://example.com");
    expect(data.logo).toBe("https://example.com/ifnotgod-icon.png");
    expect(data.email).toBe(CONTACT_INFO.email);
    expect(data.telephone).toBe("+2348061464092");
    expect(data.address).toMatchObject({ addressLocality: "Lagos", addressCountry: "NG" });
  });

  it("escapes characters that could close the script tag", () => {
    expect(buildOrganizationJsonLd("https://example.com/</script>")).not.toContain("</script>");
  });
});
