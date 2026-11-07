import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AUDIT_PATH } from "@/shared/constants";
import { LegacyContactRedirect } from "./LegacyContactRedirect";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

describe("LegacyContactRedirect", () => {
  afterEach(() => {
    replace.mockReset();
    window.history.replaceState(null, "", "/");
  });

  it("sends old /#contact links to the audit page", () => {
    window.history.replaceState(null, "", "/#contact");
    render(<LegacyContactRedirect />);

    expect(replace).toHaveBeenCalledWith(AUDIT_PATH);
  });

  it.each(["", "#about", "#how-it-works"])("leaves the home page alone for %j", (hash) => {
    window.history.replaceState(null, "", `/${hash}`);
    render(<LegacyContactRedirect />);

    expect(replace).not.toHaveBeenCalled();
  });
});
