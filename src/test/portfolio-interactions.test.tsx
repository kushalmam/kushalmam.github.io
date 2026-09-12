import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EditorialPortfolio from "../components/EditorialPortfolio";

vi.mock("../components/SystemsScene", () => ({ default: () => null }));
afterEach(() => {
  cleanup();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("portfolio interactions without WebGL", () => {
  it("keeps evidence visible and allows opening, switching, and closing case studies", async () => {
    render(<EditorialPortfolio />);
    screen.getAllByText("0.0104").forEach((value) => {
      expect(value).toBeVisible();
    });
    const first = screen.getByText("Inside Rekindle").closest("details")!;
    const second = screen.getByText("Inside AutoCPT").closest("details")!;
    expect(first.open).toBe(false);
    fireEvent.click(first.querySelector("summary")!);
    await waitFor(() => expect(first.open).toBe(true));
    expect(screen.getByText(/An 18 GB M3 Pro shaped/)).toBeVisible();
    fireEvent.click(second.querySelector("summary")!);
    await waitFor(() => {
      expect(first.open).toBe(false);
      expect(second.open).toBe(true);
    });
    fireEvent.click(second.querySelector("summary")!);
    await waitFor(() => expect(second.open).toBe(false));
    expect(
      screen.getByRole("link", { name: "Read the Rekindle experiment report" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/Techdude01/rekindle/blob/main/docs/rekindle-report.md",
    );
  });

  it("starts from the system theme, then toggles, persists, and follows other tabs", () => {
    render(<EditorialPortfolio />);
    const toggle = screen.getByRole("switch", { name: "Dark theme" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.dataset.theme).toBe("light");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("portfolio-theme")).toBe("dark");

    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("portfolio-theme")).toBe("light");

    fireEvent(
      window,
      new StorageEvent("storage", { key: "portfolio-theme", newValue: "dark" }),
    );
    expect(toggle).toHaveAttribute("aria-checked", "true");
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
    expect(screen.getByRole("link", { name: /Résumé/ })).toHaveAttribute(
      "href",
      "/documents/kushal-mamillapalli-resume.pdf",
    );
  });
});
