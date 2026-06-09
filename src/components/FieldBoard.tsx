import type { PointerEvent as ReactPointerEvent } from "react";
import type { Player } from "../scenarios";
import { DangerSpace } from "./DangerSpace";

export const FIELD_WIDTH = 480;
export const FIELD_HEIGHT = 800;

export type Position = {
  x: number;
  y: number;
};

export type DragState = {
  target: { type: "player"; id: string } | { type: "disc" };
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

type FieldBoardProps = {
  players: Player[];
  disc: Position;
  selectedId: string;
  showDanger: boolean;
  onSelectPlayer: (id: string) => void;
  onStartDrag: (drag: DragState) => void;
  onMovePiece: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onEndDrag: () => void;
};

export function getFieldPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;

  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}

function toFieldPoint(position: Position) {
  return {
    x: (position.x / 100) * FIELD_WIDTH,
    y: (position.y / 100) * FIELD_HEIGHT,
  };
}

function findThrower(players: Player[], disc: Position) {
  const discPoint = toFieldPoint(disc);
  return players
    .filter((player) => player.team === "offense")
    .reduce<Player | undefined>((closest, player) => {
      if (!closest) return player;
      const point = toFieldPoint(player);
      const closestPoint = toFieldPoint(closest);
      const distance = Math.hypot(point.x - discPoint.x, point.y - discPoint.y);
      const closestDistance = Math.hypot(
        closestPoint.x - discPoint.x,
        closestPoint.y - discPoint.y,
      );
      return distance < closestDistance ? player : closest;
    }, undefined);
}

function findMark(players: Player[], thrower: Player | undefined) {
  if (!thrower) return undefined;
  const throwerPoint = toFieldPoint(thrower);

  return players
    .filter((player) => player.team === "defense")
    .reduce<Player | undefined>((closest, player) => {
      if (!closest) return player;
      const point = toFieldPoint(player);
      const closestPoint = toFieldPoint(closest);
      const distance = Math.hypot(point.x - throwerPoint.x, point.y - throwerPoint.y);
      const closestDistance = Math.hypot(
        closestPoint.x - throwerPoint.x,
        closestPoint.y - throwerPoint.y,
      );
      return distance < closestDistance ? player : closest;
    }, undefined);
}

export function FieldBoard({
  players,
  disc,
  selectedId,
  showDanger,
  onSelectPlayer,
  onStartDrag,
  onMovePiece,
  onEndDrag,
}: FieldBoardProps) {
  const thrower = findThrower(players, disc);
  const mark = findMark(players, thrower);
  const throwerPoint = thrower ? toFieldPoint(thrower) : null;
  const markPoint = mark ? toFieldPoint(mark) : null;
  const discPoint = toFieldPoint(disc);

  return (
    <svg
      className="mx-auto block h-auto w-[min(100%,640px,calc((100dvh-48px)*0.6))] touch-none select-none rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.28)] [-webkit-touch-callout:none] max-[760px]:w-[min(100%,calc((100dvh-105px)*0.6))]"
      viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
      role="img"
      aria-label="Interactive ultimate field. Drag players to workshop positioning."
      onDragStart={(event) => event.preventDefault()}
      onPointerMove={onMovePiece}
      onPointerUp={onEndDrag}
      onPointerCancel={onEndDrag}
    >
      <rect className="fill-[#276c4b]" width={FIELD_WIDTH} height={FIELD_HEIGHT} rx="12" />
      <rect
        className="fill-[#225f43] stroke-[rgba(255,255,255,0.56)] stroke-2"
        x="2"
        y="2"
        width="476"
        height="128"
      />
      <rect
        className="fill-[#225f43] stroke-[rgba(255,255,255,0.56)] stroke-2"
        x="2"
        y="670"
        width="476"
        height="128"
      />
      <line
        className="stroke-[rgba(255,255,255,0.72)] stroke-2"
        x1="0"
        y1="130"
        x2="480"
        y2="130"
      />
      <line
        className="stroke-[rgba(255,255,255,0.72)] stroke-2"
        x1="0"
        y1="670"
        x2="480"
        y2="670"
      />
      <circle
        className="fill-none stroke-[rgba(255,255,255,0.72)] stroke-2"
        cx="240"
        cy="240"
        r="4"
      />
      <circle
        className="fill-none stroke-[rgba(255,255,255,0.72)] stroke-2"
        cx="240"
        cy="560"
        r="4"
      />
      {showDanger && throwerPoint && markPoint ? (
        <DangerSpace thrower={throwerPoint} mark={markPoint} />
      ) : null}
      <path
        className="fill-none stroke-[rgba(255,255,255,0.2)] stroke-2 [stroke-dasharray:8_9]"
        d="M67 344 L413 344"
      />
      {players.map((player) => {
        const point = toFieldPoint(player);
        const isSelected = player.id === selectedId;
        return (
          <g
            className="cursor-grab outline-none active:cursor-grabbing"
            key={player.id}
            transform={`translate(${point.x} ${point.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${player.label}, ${player.role}`}
            onPointerDown={(event) => {
              event.preventDefault();
              const svg = event.currentTarget.ownerSVGElement;
              if (!svg) return;
              const pointer = getFieldPoint(svg, event.clientX, event.clientY);
              if (!pointer) return;
              svg.setPointerCapture(event.pointerId);
              onSelectPlayer(player.id);
              onStartDrag({
                target: { type: "player", id: player.id },
                pointerId: event.pointerId,
                offsetX: pointer.x - point.x,
                offsetY: pointer.y - point.y,
              });
            }}
            onFocus={() => onSelectPlayer(player.id)}
          >
            <circle
              className={`${player.team === "offense" ? "fill-white stroke-zinc-300" : "fill-black stroke-zinc-700"} ${
                isSelected
                  ? "stroke-5 filter-[drop-shadow(0_0_8px_rgba(255,255,255,0.65))]"
                  : "stroke-3 filter-[drop-shadow(0_3px_3px_rgba(0,0,0,0.25))]"
              }`}
              r="18"
            />
            <text
              className={`pointer-events-none select-none text-xs font-extrabold ${
                player.team === "defense" ? "fill-white" : "fill-black"
              }`}
              textAnchor="middle"
              dy="5"
            >
              {player.label}
            </text>
          </g>
        );
      })}
      <g
        className="cursor-grab outline-none filter-[drop-shadow(0_2px_3px_rgba(0,0,0,0.45))] active:cursor-grabbing"
        transform={`translate(${discPoint.x} ${discPoint.y})`}
        role="button"
        tabIndex={0}
        aria-label="Disc"
        onPointerDown={(event) => {
          event.preventDefault();
          const svg = event.currentTarget.ownerSVGElement;
          if (!svg) return;
          const pointer = getFieldPoint(svg, event.clientX, event.clientY);
          if (!pointer) return;
          svg.setPointerCapture(event.pointerId);
          onStartDrag({
            target: { type: "disc" },
            pointerId: event.pointerId,
            offsetX: pointer.x - discPoint.x,
            offsetY: pointer.y - discPoint.y,
          });
        }}
      >
        <circle className="fill-transparent pointer-events-all" r="18" />
        <ellipse className="fill-[#f8fcff] stroke-[#24546a] stroke-3" rx="11" ry="5" />
        <path
          className="pointer-events-none fill-none stroke-[#8ab4c7] stroke-[1.5]"
          d="M-7 -1 Q0 3 7 -1"
        />
      </g>
    </svg>
  );
}
