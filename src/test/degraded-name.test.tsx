import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import DegradedName from "../components/DegradedName";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("waits for a still name, then varies it every four seconds", () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  const { container } = render(<DegradedName />);
  const heading = container.querySelector("h1")!;
  const letters = [...heading.querySelectorAll<HTMLElement>("[data-cut]")];
  const clean = () => letters.every(letter => letter.dataset.cut === "4");

  act(() => vi.advanceTimersByTime(3500));
  expect(clean()).toBe(true);
  act(() => vi.advanceTimersByTime(800));
  expect(clean()).toBe(false);

  act(() => vi.advanceTimersByTime(3000));
  expect(clean()).toBe(true);
  act(() => vi.advanceTimersByTime(1000));
  expect(clean()).toBe(false);
});

it("resumes ambient changes after the pointer rests on a letter", () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0);
  const { container } = render(<DegradedName />);
  const letters = [...container.querySelectorAll<HTMLElement>("[data-cut]")];
  const clean = () => letters.every(letter => letter.dataset.cut === "4");

  act(() => vi.advanceTimersByTime(3500));
  fireEvent.pointerEnter(letters[0]);
  act(() => vi.advanceTimersByTime(2200));
  expect(clean()).toBe(true);

  act(() => vi.advanceTimersByTime(600));
  expect(clean()).toBe(false);
});
