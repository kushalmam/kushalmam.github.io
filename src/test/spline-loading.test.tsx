import { expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import SystemsScene from "../components/SystemsScene";

it("does not show placeholder geometry before the Spline scene loads", () => {
  const markup = renderToString(<SystemsScene />);
  expect(markup).not.toContain("<svg");
  expect(markup).not.toContain("data-ready");
});
