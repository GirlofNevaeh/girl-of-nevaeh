export function drawNeonBanner(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
  stroke: string,
  size = 42,
) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${size}px "Cormorant Garamond", serif`;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(6, size / 7);
  ctx.strokeStyle = stroke;
  ctx.shadowColor = stroke;
  ctx.shadowBlur = 14;
  ctx.strokeText(text, x, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawLevelCall(ctx: CanvasRenderingContext2D, level: number, w: number, h: number) {
  drawNeonBanner(ctx, `Level ${level}`, w / 2, h / 2, "#3cf0ff", "#ff2bd6", 52);
}

export function drawLoseCall(ctx: CanvasRenderingContext2D, w: number, h: number) {
  drawNeonBanner(ctx, "Better Luck Next Time", w / 2, h / 2, "#ff2bd6", "#3cf0ff", 36);
}
