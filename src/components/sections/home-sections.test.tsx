import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AUDIT_PATH } from "@/shared/constants";
import { About } from "./About";
import { ClosingCta } from "./ClosingCta";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { PastWork } from "./PastWork";
import { PlanSummary } from "./PlanSummary";
import { YourWeek } from "./YourWeek";

describe("Hero", () => {
  it("says what the company does, and repeats its philosophy", () => {
    render(<Hero />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("answering back while you sleep");
    expect(screen.getByText(/Every problem has a tech solution/)).toBeInTheDocument();
  });

  it("leads to the audit and to pricing", () => {
    render(<Hero />);

    expect(screen.getByRole("link", { name: "Book a free automation audit" })).toHaveAttribute("href", AUDIT_PATH);
    expect(screen.getByRole("link", { name: "See plans and prices" })).toHaveAttribute("href", "/pricing");
  });

  it("walks through the example from enquiry to sale", () => {
    render(<Hero />);

    const steps = within(screen.getByRole("figure")).getAllByRole("listitem");

    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveTextContent("A customer asks about your prices");
    expect(steps[3]).toHaveTextContent("Your team is ready to close the sale");
  });

  it("marks itself so the floating button stays off it", () => {
    const { container } = render(<Hero />);

    expect(container.querySelector("[data-page-hero]")).toBeInTheDocument();
  });
});

describe("How it works", () => {
  it("is the target of the navigation link", () => {
    const { container } = render(<HowItWorks />);

    expect(container.querySelector("#how-it-works")).toBeInTheDocument();
  });

  it("has the audit, build and run steps, in order", () => {
    render(<HowItWorks />);

    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Free automation audit",
      "We build and set up",
      "We run and improve",
    ]);
  });
});

describe("Your week", () => {
  it("matches six problems to fixes, and links to services", () => {
    render(<YourWeek />);

    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByRole("link", { name: "See all services" })).toHaveAttribute("href", "/services");
  });
});

describe("Plan summary", () => {
  const renderSummary = async () => render(await PlanSummary());
  const card = (name: string) => screen.getByRole("heading", { level: 3, name }).closest("li") as HTMLElement;

  it("shows the four plans with their prices", async () => {
    await renderSummary();

    expect(card("Starter")).toHaveTextContent("₦20,000 / month");
    expect(card("Growth")).toHaveTextContent("₦40,000 / month");
    expect(card("Pro")).toHaveTextContent("₦80,000 / month");
    expect(card("Custom")).toHaveTextContent("Let's talk");
  });

  it("highlights only Growth", async () => {
    await renderSummary();

    expect(card("Growth")).toHaveClass("surface-maroon");
    expect(within(card("Growth")).getByText("Recommended")).toBeInTheDocument();
    expect(screen.getAllByText("Recommended")).toHaveLength(1);
  });

  it("shows what each plan includes", async () => {
    await renderSummary();

    const items = (name: string) => within(card(name)).getAllByRole("listitem").map((item) => item.textContent);

    expect(items("Starter")).toEqual([
      "1 everyday automation",
      "1 social or content service",
      "Landing or link-in-bio page",
    ]);
    expect(items("Growth")).toContain("1 AI agent");
    expect(items("Pro")).toContain("2 AI agents, such as the call agent");
    expect(items("Custom")).toEqual([
      "Everything agreed around your needs",
      "Larger apps and platforms",
      "Quoted after the audit",
    ]);
  });

  it("links each plan to its full details on the pricing page, with that plan selected", async () => {
    await renderSummary();

    for (const [name, id] of [["Starter", "starter"], ["Growth", "growth"], ["Pro", "pro"], ["Custom", "custom"]]) {
      expect(within(card(name)).getByRole("link", { name: `See everything in ${name}` })).toHaveAttribute(
        "href",
        `/pricing?plan=${id}`
      );
    }
  });

  it("sends each plan's button to the audit with that plan, and links to pricing", async () => {
    await renderSummary();

    expect(within(card("Growth")).getByRole("link", { name: /Start with an audit/ })).toHaveAttribute(
      "href",
      `${AUDIT_PATH}?plan=growth`
    );
    expect(within(card("Custom")).getByRole("link", { name: "Talk to us: Custom" })).toHaveAttribute(
      "href",
      `${AUDIT_PATH}?plan=custom`
    );
    expect(screen.getByRole("link", { name: "See exactly what's in each plan" })).toHaveAttribute("href", "/pricing");
  });
});

describe("About", () => {
  it("is the target of the About link", () => {
    const { container } = render(<About />);

    expect(container.querySelector("#about")).toBeInTheDocument();
  });

  it("tells the company's story", () => {
    render(<About />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Technology with a purpose.");
    expect(screen.getByText(/created around a simple belief: technology should solve real problems/)).toBeInTheDocument();
  });

  it("says where the company is and who it serves, in words a visitor and search engine can read", () => {
    render(<About />);

    expect(screen.getByText(/based in Lagos, and we work with businesses, creators and organisations across Nigeria/)).toBeInTheDocument();
  });
});

describe("Past work", () => {
  it("isn't mistaken for the About section", () => {
    const { container } = render(<PastWork />);

    expect(container.querySelector("#about")).not.toBeInTheDocument();
  });

  it("shows past builds, with no founding client offer", () => {
    render(<PastWork />);

    expect(screen.getByText(/TravelMate Global/)).toBeInTheDocument();
    expect(screen.queryByText(/founding/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Talk to us about a larger build" })).toHaveAttribute(
      "href",
      `${AUDIT_PATH}?plan=custom`
    );
  });
});

describe("Closing call to action", () => {
  it("leads to the audit", () => {
    render(<ClosingCta title="A title" detail="A detail" />);

    expect(screen.getByRole("heading", { level: 2, name: "A title" })).toBeInTheDocument();
    expect(screen.getByText("A detail")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Book a free automation audit" })).toHaveAttribute("href", AUDIT_PATH);
  });
});
