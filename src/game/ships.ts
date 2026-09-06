import type { CharacterId } from "@/game/types";

const bag: Partial<Record<CharacterId, HTMLImageElement>> = {};

export function shipSrc(who: CharacterId, facing: "up" | "right" = "up") {
  if (who === "nancy" && facing === "right") return "/art/ships/nancy-right.png?v=ship11";
  return `/art/ships/${who}.png?v=ship11`;
}

export function preloadShips(ids: CharacterId[]) {
  if (typeof Image === "undefined") return;
  const first = ids.includes("nancy") ? ["nancy" as CharacterId, ...ids.filter((id) => id !== "nancy")] : ids;
  for (const id of first) {
    if (!bag[id]) {
      const img = new Image();
      img.src = shipSrc(id, "up");
      bag[id] = img;
    }
    if (id === "nancy" && !bagRight.nancy) {
      const side = new Image();
      side.src = shipSrc("nancy", "right");
      bagRight.nancy = side;
    }
  }
}

const bagRight: Partial<Record<CharacterId, HTMLImageElement>> = {};

export function drawShip(
  ctx: CanvasRenderingContext2D,
  who: CharacterId,
  x: number,
  y: number,
  _face: HTMLImageElement | null,
  facing: "up" | "right" = "up",
  _showFace = false,
) {
  const pre = facing === "right" && who === "nancy";
  if (pre && !bagRight.nancy) {
    const img = new Image();
    img.src = shipSrc("nancy", "right");
    bagRight.nancy = img;
  }
  if (!bag[who]) {
    const img = new Image();
    img.src = shipSrc(who);
    bag[who] = img;
  }
  const art = pre ? bagRight.nancy! : bag[who]!;
  const size = facing === "right" ? 110 : 96;
  ctx.save();
  ctx.translate(x, y);
  if (facing === "right" && !pre) ctx.rotate(Math.PI / 2);
  if (art.complete && art.naturalWidth > 4) {
    const dw = who === "nancy" ? (facing === "right" ? 150 : 92) : size;
    const dh = who === "nancy" ? (facing === "right" ? 84 : 120) : size;
    ctx.drawImage(art, -dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.strokeStyle = who === "nancy" || who === "veronika" ? "#ff2bd6" : "#12d8ff";
    ctx.fillStyle = "#1a2030";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (facing === "right") {
      ctx.moveTo(36, 0);
      ctx.lineTo(-28, 16);
      ctx.lineTo(-18, 0);
      ctx.lineTo(-28, -16);
    } else {
      ctx.moveTo(0, -40);
      ctx.lineTo(22, 28);
      ctx.lineTo(0, 16);
      ctx.lineTo(-22, 28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
