export type Team = "offense" | "defense";

export type Player = {
  id: string;
  label: string;
  role: string;
  team: Team;
  x: number;
  y: number;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  coachingPoint: string;
  players: Player[];
};

const offense: Player[] = [
  { id: "o1", label: "H1", role: "Left handler", team: "offense", x: 28, y: 70 },
  { id: "o2", label: "H2", role: "Thrower", team: "offense", x: 50, y: 70 },
  { id: "o3", label: "H3", role: "Right handler", team: "offense", x: 72, y: 70 },
  { id: "o4", label: "C1", role: "Left cutter", team: "offense", x: 14, y: 43 },
  { id: "o5", label: "C2", role: "Inside-left cutter", team: "offense", x: 38, y: 43 },
  { id: "o6", label: "C3", role: "Inside-right cutter", team: "offense", x: 62, y: 43 },
  { id: "o7", label: "C4", role: "Right cutter", team: "offense", x: 86, y: 43 },
];

const personDefense: Player[] = [
  { id: "d1", label: "D1", role: "Mark", team: "defense", x: 54, y: 73 },
  { id: "d2", label: "D2", role: "Left handler defender", team: "defense", x: 25, y: 66 },
  { id: "d3", label: "D3", role: "Right handler defender", team: "defense", x: 75, y: 66 },
  { id: "d4", label: "D4", role: "Left cutter defender", team: "defense", x: 14, y: 39 },
  { id: "d5", label: "D5", role: "Inside-left defender", team: "defense", x: 38, y: 39 },
  { id: "d6", label: "D6", role: "Inside-right defender", team: "defense", x: 62, y: 39 },
  { id: "d7", label: "D7", role: "Right cutter defender", team: "defense", x: 86, y: 39 },
];

const switchDefense: Player[] = [
  ...personDefense.slice(0, 3),
  { id: "d4", label: "D4", role: "Front switch", team: "defense", x: 43, y: 54 },
  { id: "d5", label: "D5", role: "Lane help", team: "defense", x: 59, y: 49 },
  { id: "d6", label: "D6", role: "Deep switch", team: "defense", x: 42, y: 34 },
  { id: "d7", label: "D7", role: "Last back", team: "defense", x: 54, y: 20 },
];

const bracketDefense: Player[] = [
  ...personDefense.slice(0, 3),
  { id: "d4", label: "B1", role: "Under bracket", team: "defense", x: 50, y: 61 },
  { id: "d5", label: "B2", role: "Break-side help", team: "defense", x: 38, y: 43 },
  { id: "d6", label: "B3", role: "Open-side help", team: "defense", x: 62, y: 43 },
  { id: "d7", label: "B4", role: "Deep bracket", team: "defense", x: 50, y: 18 },
];

export const scenarios: Scenario[] = [
  {
    id: "person",
    name: "Person defense",
    description: "A neutral starting point for reading individual leverage.",
    coachingPoint: "Move a cutter to begin a pattern, then adjust their matchup.",
    players: [...offense, ...personDefense],
  },
  {
    id: "switch",
    name: "Switch the first cuts",
    description: "Defenders exchange assignments as cutters cross lanes.",
    coachingPoint: "Watch the temporary window behind the switching defenders.",
    players: [...offense, ...switchDefense],
  },
  {
    id: "bracket",
    name: "Bracket the stack",
    description: "Four defenders protect spaces instead of matching tightly.",
    coachingPoint: "The handlers must move the point of attack before cutters commit.",
    players: [...offense, ...bracketDefense],
  },
];
