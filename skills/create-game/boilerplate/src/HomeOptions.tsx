import SegmentedControl from "./components/SegmentedControl";
import StatsRow from "./components/StatsRow";
import "./HomeOptions.css";

export interface GameOptions {
  opponent: "computer" | "2player";
  mode: "3x3" | "5x5" | "7x7";
}

export const DEFAULT_OPTIONS: GameOptions = {
  opponent: "computer",
  mode: "3x3",
};

interface Props {
  value: GameOptions;
  onChange: (value: GameOptions) => void;
}

export default function HomeOptions({ value, onChange }: Props) {
  const wins = 0; // load from storage
  return (
    <div className="home-options">
      <div className="game-heading">
        <h1 className="game-title">Game Name</h1>
        <p className="game-subtitle">A short description</p>
      </div>
      {/* Opponent select - delete for solo games */}
      <SegmentedControl
        label="Opponent"
        className="opponent-select"
        options={[
          { label: "vs Computer", value: "computer" },
          { label: "2 Player", value: "2player" },
        ]}
        value={value.opponent}
        onChange={(opponent) => onChange({ ...value, opponent })}
      />
      {value.opponent === "computer" && (
        <>
          {/* Records - modify as needed */}
          <StatsRow stats={[{ label: "Wins", value: wins }]} />
          {/* Mode select - delete if no modes */}
          <SegmentedControl
            label="Mode"
            small
            options={[
              { label: "3x3", value: "3x3" },
              { label: "5x5", value: "5x5" },
              { label: "7x7", value: "7x7" },
            ]}
            value={value.mode}
            onChange={(mode) => onChange({ ...value, mode })}
          />
        </>
      )}
    </div>
  );
}
