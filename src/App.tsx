import { useState } from "react";
import { scenarios, type Player } from "./scenarios";

const FIELD_WIDTH = 480;
const FIELD_HEIGHT = 800;
const INITIAL_DISC = { x: 54, y: 66 };
const panelClass =
  "rounded-2xl border border-[#264138] bg-[rgba(16,35,29,0.9)] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.2)] max-[760px]:p-3.5";
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
    <main className="min-h-dvh min-w-80 bg-[radial-gradient(circle_at_50%_0%,#19382d_0,#0b1713_43%)] px-[34px] pt-7 pb-1.5 font-['DM_Sans',sans-serif] text-[#eaf2ed] antialiased max-[760px]:px-3.5 max-[760px]:py-5">
      <header className="mx-auto mb-3.5 flex w-full max-w-[966px] items-center justify-between gap-5 max-[760px]:flex-col max-[760px]:items-start">
        <div>
          <p className="mb-[7px] text-[11px] font-bold uppercase tracking-[0.15em] text-[#e5b951]">
            Ultimate tactics lab
          </p>
          <h1 className="font-['Manrope',sans-serif] text-[28px] leading-none font-extrabold tracking-[-0.04em]">
            UltiPattern
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="cursor-pointer rounded-full border border-[#355247] bg-[#12241e] px-[15px] py-2.5 text-[#c9d7d0] hover:border-[#668575]"
            type="button"
            onClick={resetScenario}
          >
            Reset board
          </button>
          <button
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-[15px] py-2.5 ${
              showDanger
                ? "border-[#d7ac44] bg-[#e5b951] text-[#132017]"
                : "border-[#355247] bg-[#12241e] text-[#c9d7d0] hover:border-[#668575]"
            }`}
            type="button"
            aria-pressed={showDanger}
            onClick={() => setShowDanger((value) => !value)}
          >
            <span
              className={`h-[9px] w-[9px] rounded-full ${
                showDanger ? "bg-[#183128]" : "bg-[#5d7569]"
              }`}
            />
            Dangerous spaces
          </button>
        </div>
      </header>

      <section className="mx-auto grid w-fit max-w-full grid-cols-[210px_minmax(440px,530px)_190px] items-start gap-[18px] max-[1050px]:w-auto max-[1050px]:grid-cols-[190px_minmax(0,1fr)] max-[760px]:grid-cols-1">
        <details className={`${panelClass} group max-[760px]:order-2`} open>
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
          </div>
        </details>

        <section className="min-w-0 rounded-2xl border border-[#264138] bg-[rgba(16,35,29,0.9)] px-5 py-[22px] shadow-[0_18px_60px_rgba(0,0,0,0.2)] max-[760px]:order-1 max-[760px]:p-3">
          <div className="mb-3.5 flex items-end justify-between max-[760px]:items-start">
            <div>
              <p className={panelLabelClass}>Hostack sandbox</p>
              <h2 className="mt-1 font-['Manrope',sans-serif] text-[22px] leading-[1.2] font-bold">
                {scenario.name}
              </h2>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#829c90] max-[760px]:hidden">
              <span className="flex items-center gap-1.5">
                <i className="h-[9px] w-[9px] rounded-full bg-[#f2cd67]" /> Offense
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-[9px] w-[9px] rounded-full bg-[#dd6e67]" /> Defense
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-[9px] w-[9px] rounded-full border-2 border-[#d8efff] bg-white" />{" "}
                Disc
              </span>
            </div>
          </div>

          <svg
            className="mx-auto block h-auto w-[min(100%,490px,calc((100dvh-225px)*0.6))] touch-none select-none rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.28)] [-webkit-touch-callout:none] max-[760px]:w-[min(100%,calc((100dvh-210px)*0.6))]"
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
                        ? "fill-[#f2cd67] stroke-[#fff0b3]"
                        : "fill-[#dd6e67] stroke-[#ffc0b8]"
                    } ${
                      isSelected
                        ? "stroke-[5] [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.65))]"
                        : "stroke-[3] [filter:drop-shadow(0_3px_3px_rgba(0,0,0,0.25))]"
                    }`}
                    r="18"
                  />
                  <text
                    className={`pointer-events-none select-none text-xs font-extrabold ${
                      player.team === "defense" ? "fill-[#2c1010]" : "fill-[#102018]"
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
              className="cursor-grab outline-none [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.45))] active:cursor-grabbing"
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
              <ellipse className="fill-[#f8fcff] stroke-[#24546a] stroke-[3]" rx="11" ry="5" />
              <path
                className="pointer-events-none fill-none stroke-[#8ab4c7] stroke-[1.5]"
                d="M-7 -1 Q0 3 7 -1"
              />
            </g>
          </svg>
          <p className="mt-3 text-center text-xs text-[#789286]">
            Drag any player or the disc. Select defensive presets to compare spacing.
          </p>
        </section>

        <details
          className={`${panelClass} group min-h-[300px] max-[1050px]:col-span-full max-[1050px]:min-h-0 max-[760px]:order-3 max-[760px]:col-auto`}
          open
        >
          <summary className={summaryClass}>
            <span className={panelLabelClass}>Selection</span>
            <span className={chevronClass} aria-hidden="true" />
          </summary>
          <div className="overflow-hidden">
            {selectedPlayer ? (
              <>
                <div
                  className={`mt-5 grid h-[52px] w-[52px] place-items-center rounded-full font-extrabold text-[#16231d] ${
                    selectedPlayer.team === "offense" ? "bg-[#f2cd67]" : "bg-[#dd6e67]"
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
