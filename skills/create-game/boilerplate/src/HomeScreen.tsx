import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import HomeOptions, { DEFAULT_OPTIONS, type GameOptions } from "./HomeOptions";
import "./HomeScreen.css";

interface Props {
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onHelp: () => void;
  onStart: (options: GameOptions) => void;
  onResume: () => void;
  hasGame: boolean;
}

export default function HomeScreen({
  theme,
  onThemeToggle,
  onHelp,
  onStart,
  onResume,
  hasGame,
}: Props) {
  const [options, setOptions] = useState<GameOptions>(DEFAULT_OPTIONS);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, []);

  return (
    <div className="card">
      <Header variant="home" theme={theme} onThemeToggle={onThemeToggle} onHelp={onHelp} />
      <main className="home-content" ref={mainRef} tabIndex={-1}>
        <HomeOptions value={options} onChange={setOptions} />
        <div className="home-actions">
          <button className="btn btn-primary" onClick={() => onStart(options)}>
            New Game
          </button>
          {hasGame && (
            <button className="btn btn-secondary" onClick={onResume}>
              Resume Game
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
