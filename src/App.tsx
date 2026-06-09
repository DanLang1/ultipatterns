import { useState } from "react";
import { scenarios, type Player } from "./scenarios";

const FIELD_WIDTH = 480;
const FIELD_HEIGHT = 800;
const INITIAL_DISC = { x: 54, y: 66 };
const panelClass =
  "rounded-2xl border border-[#264138] bg-[rgba(16,35,29,0.94)] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md max-[760px]:p-3.5";
const panelLabelClass = "text-[11px] font-bold uppercase tracking-[0.15em] text-[#8ba899]";
const summaryClass =
  "flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden";
const chevronClass =
  "h-2 w-2 rotate-45 border-r-2 border-b-2 border-[#789487] transition-transform duration-150 group-open:rotate-[225deg]";
const noteClass = "mt-[22px] rounded-[11px] bg-[#0d1d18] p-3.5";
const noteLabelClass = "text-[11px] font-bold uppercase tracking-[0.09em] text-[#e5b951]";
const noteTextClass = "mt-2 text-[13px] leading-5 text-[#9fb3a9]";

type DragState = {
  target: { type: "player"; id: string } | { type: "disc" };
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

function clonePlayers(players: Player[]) {
  return players.map((player) => ({ ...player }));
}

function getFieldPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;

  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}

export function App() {
  const [scenarioId, setScenarioId] = useState(scenarios[0]!.id);
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]!;
  const [players, setPlayers] = useState(() => clonePlayers(scenario.players));
  const [selectedId, setSelectedId] = useState<string>(scenario.players[0]!.id);
  const [disc, setDisc] = useState(INITIAL_DISC);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [showDanger, setShowDanger] = useState(true);
  const selectedPlayer = players.find((player) => player.id === selectedId);

  function loadScenario(nextId: string) {
    const nextScenario = scenarios.find((item) => item.id === nextId);
    if (!nextScenario) return;
    setScenarioId(nextId);
    setPlayers(clonePlayers(nextScenario.players));
    setSelectedId(nextScenario.players[0]!.id);
    setDisc(INITIAL_DISC);
    setDrag(null);
  }

  function resetScenario() {
    setPlayers(clonePlayers(scenario.players));
    setDisc(INITIAL_DISC);
    setDrag(null);
  }

  function moveBoardPiece(event: React.PointerEvent<SVGSVGElement>) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const point = getFieldPoint(event.currentTarget, event.clientX, event.clientY);
    if (!point) return;
    const x = ((point.x - drag.offsetX) / FIELD_WIDTH) * 100;
    const y = ((point.y - drag.offsetY) / FIELD_HEIGHT) * 100;
    const nextPosition = {
      x: Math.max(3, Math.min(97, x)),
      y: Math.max(3, Math.min(97, y)),
    };

    if (drag.target.type === "disc") {
      setDisc(nextPosition);
      return;
    }

    const playerId = drag.target.id;
    setPlayers((current) =>
      current.map((player) => (player.id === playerId ? { ...player, ...nextPosition } : player)),
    );
  }

  return (
    <main className="relative min-h-dvh min-w-80 overflow-x-hidden bg-[radial-gradient(circle_at_50%_0%,#19382d_0,#0b1713_43%)] px-5 py-3 font-['DM_Sans',sans-serif] text-[#eaf2ed] antialiased max-[760px]:px-3.5 max-[760px]:py-3">
      <section className="relative mx-auto min-h-[calc(100dvh-24px)] w-full max-w-[1320px] max-[1050px]:grid max-[1050px]:grid-cols-[190px_minmax(0,1fr)] max-[1050px]:items-start max-[1050px]:gap-[18px] max-[760px]:grid-cols-1">
        <details
          className={`${panelClass} group absolute top-3 left-0 z-10 w-[230px] max-[1050px]:static max-[1050px]:w-auto max-[760px]:order-2`}
          open
        >
          <summary className={summaryClass}>
            <span className={panelLabelClass}>Defensive look</span>
            <span className={chevronClass} aria-hidden="true" />
          </summary>
          <div className="overflow-hidden">
            <div className="mt-4 grid gap-[9px]">
              {scenarios.map((item) => (
                <button
                  className={`w-full cursor-pointer rounded-[11px] border p-[13px] text-left ${
                    item.id === scenarioId
                      ? "border-[#bd9132] bg-[#3a321d] text-[#fff6dc]"
                      : "border-transparent bg-[#162c24] text-[#cbd8d2] hover:border-[#456659]"
                  }`}
                  type="button"
                  key={item.id}
                  onClick={() => loadScenario(item.id)}
                >
                  <span className="mb-[5px] block font-bold">{item.name}</span>
                  <small
                    className={`block leading-[1.4] ${
                      item.id === scenarioId ? "text-[#cfbd8a]" : "text-[#789487]"
                    }`}
                  >
                    {item.description}
                  </small>
                </button>
              ))}
            </div>
            <div className={noteClass}>
              <span className={noteLabelClass}>Workshop prompt</span>
              <p className={noteTextClass}>{scenario.coachingPoint}</p>
            </div>
            <button
              className="mt-3 w-full cursor-pointer rounded-full border border-[#355247] bg-[#12241e] px-3 py-2.5 text-sm text-[#c9d7d0] hover:border-[#668575]"
              type="button"
              onClick={resetScenario}
            >
              Reset board
            </button>
          </div>
        </details>

        <section className="mx-auto min-w-0 w-full max-w-[680px] rounded-2xl border border-[#264138] bg-[rgba(16,35,29,0.9)] p-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] max-[1050px]:mx-0 max-[1050px]:max-w-none max-[760px]:order-1 max-[760px]:p-2">
          <svg
            className="mx-auto block h-auto w-[min(100%,640px,calc((100dvh-48px)*0.6))] touch-none select-none rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.28)] [-webkit-touch-callout:none] max-[760px]:w-[min(100%,calc((100dvh-105px)*0.6))]"
            viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
            role="img"
            aria-label="Interactive ultimate field. Drag players to workshop positioning."
            onDragStart={(event) => event.preventDefault()}
            onPointerMove={moveBoardPiece}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}
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
            {showDanger && (
              <g className="fill-[rgba(240,185,63,0.16)] stroke-[rgba(245,202,91,0.55)] stroke-2 [stroke-dasharray:8_7]">
                <path d="M240 630 C155 570 115 485 130 380 C178 405 210 430 240 470 Z" />
                <path d="M240 630 C325 570 365 485 350 380 C302 405 270 430 240 470 Z" />
                <ellipse cx="240" cy="230" rx="118" ry="76" />
              </g>
            )}
            <path
              className="fill-none stroke-[rgba(255,255,255,0.2)] stroke-2 [stroke-dasharray:8_9]"
              d="M67 344 L413 344"
            />
            {players.map((player) => {
              const x = (player.x / 100) * FIELD_WIDTH;
              const y = (player.y / 100) * FIELD_HEIGHT;
              const isSelected = player.id === selectedId;
              return (
                <g
                  className="cursor-grab outline-none active:cursor-grabbing"
                  key={player.id}
                  transform={`translate(${x} ${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${player.label}, ${player.role}`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    const svg = event.currentTarget.ownerSVGElement;
                    if (!svg) return;
                    const point = getFieldPoint(svg, event.clientX, event.clientY);
                    if (!point) return;
                    svg.setPointerCapture(event.pointerId);
                    setSelectedId(player.id);
                    setDrag({
                      target: { type: "player", id: player.id },
                      pointerId: event.pointerId,
                      offsetX: point.x - x,
                      offsetY: point.y - y,
                    });
                  }}
                  onFocus={() => setSelectedId(player.id)}
                >
                  <circle
                    className={`${
                      player.team === "offense"
                        ? "fill-white stroke-zinc-300"
                        : "fill-black stroke-zinc-700"
                    } ${
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
              transform={`translate(${(disc.x / 100) * FIELD_WIDTH} ${(disc.y / 100) * FIELD_HEIGHT})`}
              role="button"
              tabIndex={0}
              aria-label="Disc"
              onPointerDown={(event) => {
                event.preventDefault();
                const svg = event.currentTarget.ownerSVGElement;
                if (!svg) return;
                const point = getFieldPoint(svg, event.clientX, event.clientY);
                if (!point) return;
                const x = (disc.x / 100) * FIELD_WIDTH;
                const y = (disc.y / 100) * FIELD_HEIGHT;
                svg.setPointerCapture(event.pointerId);
                setDrag({
                  target: { type: "disc" },
                  pointerId: event.pointerId,
                  offsetX: point.x - x,
                  offsetY: point.y - y,
                });
              }}
            >
              <ellipse className="fill-[#f8fcff] stroke-[#24546a] stroke-3" rx="11" ry="5" />
              <path
                className="pointer-events-none fill-none stroke-[#8ab4c7] stroke-[1.5]"
                d="M-7 -1 Q0 3 7 -1"
              />
            </g>
          </svg>
        </section>

        <details
          className={`${panelClass} group absolute top-3 right-0 z-10 min-h-[300px] w-[220px] max-[1050px]:static max-[1050px]:col-span-full max-[1050px]:min-h-0 max-[1050px]:w-auto max-[760px]:order-3 max-[760px]:col-auto`}
          open
        >
          <summary className={summaryClass}>
            <span className={panelLabelClass}>UltiPattern</span>
            <span className={chevronClass} aria-hidden="true" />
          </summary>
          <div className="overflow-hidden">
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e5b951]">
              Hostack sandbox
            </p>
            <h1 className="mt-1 font-['Manrope',sans-serif] text-xl leading-[1.2] font-bold">
              {scenario.name}
            </h1>
            <button
              className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-sm ${
                showDanger
                  ? "border-[#d7ac44] bg-[#e5b951] text-[#132017]"
                  : "border-[#355247] bg-[#12241e] text-[#c9d7d0] hover:border-[#668575]"
              }`}
              type="button"
              aria-pressed={showDanger}
              onClick={() => setShowDanger((value) => !value)}
            >
              <span
                className={`h-2 w-2 rounded-full ${showDanger ? "bg-[#183128]" : "bg-[#5d7569]"}`}
              />
              Dangerous spaces
            </button>
            <div className="my-4 h-px bg-[#264138]" />
            <p className={panelLabelClass}>Selection</p>
            {selectedPlayer ? (
              <>
                <div
                  className={`mt-5 grid h-[52px] w-[52px] place-items-center rounded-full font-extrabold ${
                    selectedPlayer.team === "offense"
                      ? "bg-white text-black"
                      : "bg-black text-white"
                  }`}
                >
                  {selectedPlayer.label}
                </div>
                <h3 className="mt-3.5 font-['Manrope',sans-serif] text-lg leading-[1.2] font-bold">
                  {selectedPlayer.role}
                </h3>
                <p className="mt-1 text-[13px] text-[#718c7f] capitalize">
                  {selectedPlayer.team === "offense" ? "Offense" : "Defense"}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <span className="rounded-[9px] bg-[#162c24] p-2.5 font-bold text-[#d8e3dd]">
                    <small className="mb-[3px] block text-[10px] font-semibold uppercase text-[#718c7f]">
                      Width
                    </small>
                    {Math.round(selectedPlayer.x)}%
                  </span>
                  <span className="rounded-[9px] bg-[#162c24] p-2.5 font-bold text-[#d8e3dd]">
                    <small className="mb-[3px] block text-[10px] font-semibold uppercase text-[#718c7f]">
                      Field
                    </small>
                    {Math.round(100 - selectedPlayer.y)}%
                  </span>
                </div>
                <div className={noteClass}>
                  <span className={noteLabelClass}>Read the field</span>
                  <p className={noteTextClass}>
                    Compare this player&apos;s leverage against the highlighted lanes and the next
                    defender available to help.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </details>
      </section>
    </main>
  );
}
