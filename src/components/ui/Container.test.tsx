import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Container } from "./Container";

describe("Container", () => {
  it("uses the default page width unless told otherwise", () => {
    render(<Container>Content</Container>);

    expect(screen.getByText("Content")).toHaveClass("max-w-[1180px]");
  });

  it("offers a narrow width for long reading text", () => {
    render(<Container width="narrow">Content</Container>);

    expect(screen.getByText("Content")).toHaveClass("max-w-[860px]");
  });

  it("keeps extra classes and attributes", () => {
    render(
      <Container className="py-14" data-testid="section">
        Content
      </Container>
    );

    expect(screen.getByTestId("section")).toHaveClass("py-14", "mx-auto");
  });
});
