import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/SystemsScene", () => ({ default: () => null }));

import EditorialPortfolio from "../components/EditorialPortfolio";

describe("EditorialPortfolio experience content", () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("shows one unified timeline row per company for Spotify and ARC", () => {
    render(<EditorialPortfolio />);

    expect(
      screen.getAllByRole("heading", { level: 4, name: "Spotify" }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("heading", {
        level: 4,
        name: "ARC Robotics: Team Ultraviolet",
      }),
    ).toHaveLength(1);
    expect(
      screen.getByText("Data Engineer (Emerging Talent) · Sep 2026–Present"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Data Engineering Intern · Jun–Aug 2026"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Computer Vision Lead · Jan 2025–Jul 2026"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Computer Vision / DevOps Engineer · Jan–Dec 2024"),
    ).toBeInTheDocument();
    expect(screen.getByText("Jun 2026–Present")).toBeInTheDocument();
    expect(screen.getByText("Jan 2024–Jul 2026")).toBeInTheDocument();
  });
});
