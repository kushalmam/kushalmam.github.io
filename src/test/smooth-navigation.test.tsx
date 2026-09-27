import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import EditorialPortfolio from "../components/EditorialPortfolio";

const { scrollTo } = vi.hoisted(() => ({ scrollTo: vi.fn() }));
vi.mock("lenis/react", () => ({ useLenis: () => ({ scrollTo }) }));

afterEach(() => {
  cleanup();
  scrollTo.mockClear();
  window.history.replaceState(null, "", "/");
});

it("routes unmodified section clicks through smooth scrolling", () => {
  render(<EditorialPortfolio />);
  const link = screen.getByRole("link", { name: "Transform — Work" });

  fireEvent.click(link, { ctrlKey: true });
  expect(scrollTo).not.toHaveBeenCalled();

  fireEvent.click(link);
  expect(scrollTo).toHaveBeenCalledWith(document.getElementById("work"));
  expect(window.location.hash).toBe("#work");
  expect(document.getElementById("work")).toHaveFocus();
});
