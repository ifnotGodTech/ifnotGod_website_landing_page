import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// motion's whileInView relies on IntersectionObserver, which jsdom doesn't implement.
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
