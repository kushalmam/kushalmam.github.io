export interface SplineScene {
  load(url: string): Promise<void>;
  play(): void;
  stop(): void;
  dispose(): void;
  setSize(width: number, height: number): void;
  setBackgroundColor(color: string): void;
  findObjectByName(name: string): { rotation: { x: number; y: number; z: number }; position: { x: number; y: number; z: number } } | undefined;
  requestRender(): void;
  getAllObjects(): { name: string; visible: boolean }[];
}

// Earlier, unrepublished Flow export used by the portfolio. Its authored wires
// and animation are kept intact; presentation-only changes happen at runtime.
export const WIRE_SCENE_URL = "https://prod.spline.design/wsJFrnRqL89Q5Hh6/scene.splinecode";

export async function createSplineScene(canvas: HTMLCanvasElement): Promise<SplineScene> {
  const runtimeUrl = "https://unpkg.com/@splinetool/runtime@2.0.46/build/runtime.js";
  const { Application } = await import(/* @vite-ignore */ runtimeUrl) as {
    Application: new (canvas: HTMLCanvasElement) => SplineScene;
  };
  return new Application(canvas);
}
