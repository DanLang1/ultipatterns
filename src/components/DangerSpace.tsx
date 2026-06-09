type Point = {
  x: number;
  y: number;
};

type DangerSpaceProps = {
  thrower: Point;
  mark: Point;
};

const MIN_MARK_DISTANCE = 1;

export function DangerSpace({ thrower, mark }: DangerSpaceProps) {
  const dx = mark.x - thrower.x;
  const dy = mark.y - thrower.y;
  const distance = Math.hypot(dx, dy);
  const angle = distance > MIN_MARK_DISTANCE ? (Math.atan2(dy, dx) * 180) / Math.PI : -90;

  return (
    <g pointerEvents="none" transform={`translate(${thrower.x} ${thrower.y}) rotate(${angle})`}>
      <path
        className="fill-[rgba(240,185,63,0.18)] stroke-[rgba(245,202,91,0.68)] stroke-2 [stroke-dasharray:8_7]"
        d="M22 -16 C105 -74 235 -137 390 -174 L390 174 C235 137 105 74 22 16 Q13 0 22 -16 Z"
      />
      <path
        className="fill-[rgba(20,67,49,0.72)] stroke-[rgba(185,220,204,0.44)] stroke-[1.5] [stroke-dasharray:5_8]"
        d="M20 -13 C118 -30 250 -36 390 0 C250 36 118 30 20 13 Q13 0 20 -13 Z"
      />
    </g>
  );
}
