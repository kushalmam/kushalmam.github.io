import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useSectionSettling from "../components/useSectionSettling";

describe("downward section settling", () => {
  let y: number;
  let reduced = false;
  beforeEach(() => {
    vi.useFakeTimers();
    y = 80;
    reduced = false;
    document.body.innerHTML = '<main><section id="about"></section></main>';
    document.documentElement.style.scrollPaddingTop = "66px";
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => y);
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
      3000,
    );
    vi.spyOn(
      document.querySelector("section")!,
      "getBoundingClientRect",
    ).mockImplementation(() => ({ top: 200 - y }) as DOMRect);
    vi.stubGlobal("matchMedia", () => ({
      get matches() {
        return reduced;
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.spyOn(window, "scrollTo").mockImplementation((options) => {
      y = (options as ScrollToOptions).top ?? y;
      window.dispatchEvent(new Event("scroll"));
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    document.documentElement.style.scrollPaddingTop = "";
  });
  const scroll = (delta: number, position: number) => {
    window.dispatchEvent(new WheelEvent("wheel", { deltaY: delta }));
    y = position;
    window.dispatchEvent(new Event("scroll"));
  };
  it("settles forward to the header-aligned boundary after a downward pause", () => {
    const hook = renderHook(() => useSectionSettling());
    act(() => scroll(10, 90));
    act(() => vi.advanceTimersByTime(500));
    expect(y).toBe(134);
    expect(window.scrollTo).toHaveBeenCalled();
    hook.unmount();
  });
  it("leaves upward scrolling entirely alone", () => {
    const hook = renderHook(() => useSectionSettling());
    act(() => scroll(-10, 70));
    act(() => vi.advanceTimersByTime(500));
    expect(y).toBe(70);
    expect(window.scrollTo).not.toHaveBeenCalled();
    hook.unmount();
  });
  it("uses the smooth controller for settling and cancels on upward input", () => {
    const scrollTo = vi.fn();
    const controller = { current: { scrollTo } };
    const hook = renderHook(() => useSectionSettling(controller));
    act(() => scroll(10, 90));
    act(() => vi.advanceTimersByTime(200));
    expect(scrollTo).toHaveBeenCalledWith(
      134,
      expect.objectContaining({ duration: 0.28 }),
    );
    expect(window.scrollTo).not.toHaveBeenCalled();
    act(() => scroll(-10, 85));
    expect(scrollTo).toHaveBeenLastCalledWith(90, { immediate: true });
    act(() => vi.advanceTimersByTime(500));
    expect(scrollTo).toHaveBeenCalledTimes(2);
    hook.unmount();
  });
  it("cancels a pending settle when the user reverses direction", () => {
    const hook = renderHook(() => useSectionSettling());
    act(() => scroll(10, 90));
    act(() => vi.advanceTimersByTime(100));
    act(() => scroll(-10, 85));
    act(() => vi.advanceTimersByTime(500));
    expect(y).toBe(85);
    expect(window.scrollTo).not.toHaveBeenCalled();
    hook.unmount();
  });
  it("does not settle with reduced motion or far from a boundary", () => {
    reduced = true;
    const hook = renderHook(() => useSectionSettling());
    act(() => scroll(10, 90));
    act(() => vi.advanceTimersByTime(500));
    expect(window.scrollTo).not.toHaveBeenCalled();
    reduced = false;
    act(() => scroll(10, 10));
    act(() => vi.advanceTimersByTime(500));
    expect(window.scrollTo).not.toHaveBeenCalled();
    hook.unmount();
  });
});
