import {
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
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("portfolio interactions without WebGL", () => {
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

  it("persists the chosen theme and follows changes from another tab", () => {
    render(<EditorialPortfolio />);
    const toggle = screen.getByRole("switch", { name: "Dark theme" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("portfolio-theme")).toBe("dark");
    cleanup();
    render(<EditorialPortfolio />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    fireEvent(window, new StorageEvent("storage", { key: "portfolio-theme", newValue: "light" }));
    expect(document.documentElement.dataset.theme).toBe("light");
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
