import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import FlipText from "../components/FlipText";

vi.mock("motion/react", () => ({
  useReducedMotion: () => false,
  motion: { span: ({ children, animate, className }: { children: ReactNode; animate: { rotateX: number }; className: string }) =>
    <span className={className} data-rotation={animate.rotateX}>{children}</span> },
}));
afterEach(cleanup);
it("finishes each hover-triggered turn after leaving and retriggers independently", () => {
  const { container } = render(<FlipText>AB</FlipText>);
  const [a, b] = container.querySelectorAll(".flip-text__character");
  fireEvent.mouseEnter(a);
  fireEvent.mouseLeave(a);
  expect(a.firstElementChild).toHaveAttribute("data-rotation", "360");
  fireEvent.mouseEnter(b);
  expect(b.firstElementChild).toHaveAttribute("data-rotation", "360");
  expect(a.firstElementChild).toHaveAttribute("data-rotation", "360");
  fireEvent.mouseEnter(a);
  expect(a.firstElementChild).toHaveAttribute("data-rotation", "720");
});
