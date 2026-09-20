import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EditorialPortfolio from "../components/EditorialPortfolio";
vi.mock("../components/SignalRoute", () => ({ default: () => null }));
afterEach(cleanup);
describe("portfolio introduction", () => {
  it("identifies Kushal and preserves current work and education in the short introduction", () => {
    render(<EditorialPortfolio />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Kushal Mamillapalli");
    expect(screen.getAllByText("Data Engineer")[0]).toBeVisible();
    expect(screen.getByText("Spotify")).toBeVisible();
    expect(screen.getByText("NYU Tandon")).toBeVisible();
    expect(screen.getByRole("img", { name: /Kushal overlooking/ })).toHaveAttribute("src", "/images/portrait.jpg");
    expect(screen.getByRole("link", { name: /Résumé/ })).toHaveAttribute("href", "/documents/kushal-mamillapalli-resume.pdf");
  });
});
