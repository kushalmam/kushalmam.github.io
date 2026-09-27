import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EditorialPortfolio from "../components/EditorialPortfolio";

vi.mock("../components/SignalRoute", () => ({ default: () => null }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("portfolio interactions without WebGL", () => {
  it("keeps one persistent name dot while the name cleans itself up", () => {
    vi.useFakeTimers();
    const { container } = render(<EditorialPortfolio />);
    const heading = screen.getByRole("heading", { level: 1, name: "Kushal Mamillapalli" });
    const anchor = container.querySelector("[data-name-dot]");
    expect(anchor).not.toBeNull();
    expect(heading).toContainElement(anchor as HTMLElement);
    const letters = heading.querySelectorAll("[data-cut]");
    expect(letters).toHaveLength("KushalMamillapalli".length);
    expect(letters[0]).toHaveAttribute("data-cut", "0");
    act(() => vi.advanceTimersByTime(7200));
    expect(container.querySelectorAll("[data-name-dot]")).toHaveLength(1);
    expect(container.querySelector("[data-name-dot]")).toBe(anchor);
  });

  it("offers four direct project links with real image previews", () => {
    render(<EditorialPortfolio />);
    for (const name of ["Rekindle", "MarketMind", "AutoCPT", "NBAnomaly"]) {
      const link = screen.getByRole("link", { name: `View ${name} on GitHub` });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.querySelector("img")).toHaveAttribute("alt");
      expect(link.querySelector("img")?.getAttribute("src")).toMatch(/images\/projects\//);
    }
    expect(document.querySelectorAll(".project-card")).toHaveLength(4);
  });

  it("uses one authored sequence of section colors without a theme switch", () => {
    render(<EditorialPortfolio />);
    expect(screen.queryByRole("switch", { name: "Dark theme" })).not.toBeInTheDocument();
    expect(document.querySelectorAll("main > section")).toHaveLength(4);
  });

  it("moves focus to the destination landmark after section navigation", async () => {
    render(<EditorialPortfolio />);
    const workLink = screen.getByRole("link", { name: "Transform — Work" });
    workLink.focus();
    fireEvent.click(workLink, { ctrlKey: true });
    expect(workLink).toHaveFocus();

    fireEvent.click(workLink);
    await waitFor(() => expect(document.getElementById("work")).toHaveFocus());
    expect(document.getElementById("work")).toHaveAttribute("tabindex", "-1");
  });

  it("keeps all navigation targets and the résumé available", () => {
    render(<EditorialPortfolio />);
    for (const link of screen.getAllByRole("link")) {
      const href = link.getAttribute("href")!;
      if (href.startsWith("#"))
        expect(document.querySelector(href)).not.toBeNull();
      if (link.getAttribute("target") === "_blank")
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    for (const resume of screen.getAllByRole("link", { name: /Résumé/ }))
      expect(resume).toHaveAttribute(
        "href",
        "/documents/kushal-mamillapalli-resume.pdf",
      );
  });
});
