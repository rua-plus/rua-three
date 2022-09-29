export function getCanvasRelativePosition(
  e: MouseEvent | Touch,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * canvas.width) / rect.width,
    y: ((e.clientY - rect.top) * canvas.height) / rect.height,
  };
}
