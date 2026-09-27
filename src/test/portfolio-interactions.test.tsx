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
  it("keeps one persistent wire anchor outside every animated name layer", () => {
    vi.useFakeTimers();
    const { container } = render(<EditorialPortfolio />);
    const anchor = container.querySelector("[data-signal-origin]");
    expect(anchor).not.toBeNull();
    expect(anchor?.closest(".name-layer")).toBeNull();
    const layers = [...container.querySelectorAll(".name-word--last .name-layer")];
    expect(layers).toHaveLength(3);
    for (const style of ["outline", "editorial", "plain"]) {
      act(() => vi.advanceTimersByTime(5600));
      expect(container.querySelector("[data-signal-origin]")).toBe(anchor);
      expect(container.querySelectorAll("[data-signal-origin]")).toHaveLength(1);
      expect([...container.querySelectorAll(".name-word--last .name-layer")]).toEqual(layers);
      expect(container.querySelector(".name-word--last [aria-hidden='false']"))
        .toHaveClass(`name-layer--${style}`);
    }
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
    const workLink = screen.getByRole("link", { name: "Work" });
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
