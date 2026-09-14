export interface SplineScene {
  load(url: string): Promise<void>;
  play(): void;
  stop(): void;
  dispose(): void;
  setSize(width: number, height: number): void;
  setBackgroundColor(color: string): void;
}

export const WIRE_SCENE_URL = "https://prod.spline.design/wPyTzb77ryucbKu0/scene.splinecode?v=no-vignette-1";

export async function createSplineScene(canvas: HTMLCanvasElement): Promise<SplineScene> {
  const runtimeUrl = "https://unpkg.com/@splinetool/runtime@2.0.46/build/runtime.js";
  const { Application } = await import(/* @vite-ignore */ runtimeUrl) as {
    Application: new (canvas: HTMLCanvasElement) => SplineScene;
  };
  return new Application(canvas);
}
