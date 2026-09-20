// Original ray-traced Blender frames. No inter-frame blending or realtime glass.
export const ASSEMBLY_FRAME_COUNT = 25;
export const ASSEMBLY_SOURCE_SIZE = 1600;

export function assemblyFrame(top: number, height: number, viewport: number) {
  const start = Math.min(viewport * .24, 180);
  const end = -height * .65;
  const progress = Math.max(0, Math.min(1, (start - top) / (start - end)));
  return Math.round(Math.sin(Math.PI * progress) ** 2 * (ASSEMBLY_FRAME_COUNT - 1));
}

export function assemblyBufferSize(cssSize: number, dpr: number) {
  return Math.min(ASSEMBLY_SOURCE_SIZE, Math.max(1, Math.round(cssSize * Math.min(dpr, 2))));
}

export async function createAssemblyScroll(canvas: HTMLCanvasElement, baseUrl: string, signal: AbortSignal) {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas unavailable");
  const blobs: Blob[] = [];
  let next = 0;
  // Keep compressed frames; decode only four at a time, including on Retina.
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (next < ASSEMBLY_FRAME_COUNT) {
      const index = next++;
      const response = await fetch(`${baseUrl}/${String(index).padStart(2, "0")}.webp`, { signal });
      if (!response.ok) throw new Error("Assembly frame unavailable");
      blobs[index] = await response.blob();
    }
  }));
  signal.throwIfAborted();
  const cache = new Map<number, ImageBitmap>();
  let requested = 0;
  let shown = -1;
  let drawing = false;
  let disposed = false;
  let size = 0;
  let generation = 0;
  const clearCache = () => {
    cache.forEach(bitmap => bitmap.close());
    cache.clear();
  };
  const draw = async () => {
    if (drawing || disposed) return;
    drawing = true;
    try {
      while (!disposed && shown !== requested) {
        const index = requested;
        const version = generation;
        let bitmap = cache.get(index);
        if (!bitmap) {
          bitmap = await createImageBitmap(blobs[index], {
            resizeWidth: size, resizeHeight: size, resizeQuality: "high",
          });
          if (disposed || version !== generation) { bitmap.close(); continue; }
          cache.set(index, bitmap);
        }
        if (index === requested) {
          context.clearRect(0, 0, size, size);
          context.drawImage(bitmap, 0, 0, size, size);
          shown = index;
          canvas.dataset.frame = String(index);
        }
        cache.delete(index);
        cache.set(index, bitmap);
        while (cache.size > 4) {
          const oldest = cache.keys().next().value!;
          cache.get(oldest)!.close();
          cache.delete(oldest);
        }
      }
    } finally { drawing = false; }
  };
  const resize = () => {
    const nextSize = assemblyBufferSize(canvas.clientWidth, window.devicePixelRatio || 1);
    if (nextSize === size) return;
    size = nextSize;
    canvas.width = canvas.height = size;
    generation++;
    shown = -1;
    clearCache();
  };
  resize();
  await draw();
  return {
    async update(frame: number) {
      requested = Math.max(0, Math.min(ASSEMBLY_FRAME_COUNT - 1, frame));
      resize();
      await draw();
    },
    dispose() { disposed = true; clearCache(); blobs.length = 0; },
  };
}
