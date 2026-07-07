import { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import GameBoard from "./GameBoard";
import ConfirmModal from "./components/ConfirmModal";
import GameOverModal from "./components/GameOverModal";
import { useGame } from "./hooks/useGame";
import type { GameOptions } from "./HomeOptions";
import "./GameScreen.css";

interface Props {
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onHelp: () => void;
  onClose: () => void;
  options: GameOptions;
  onGameOver: () => void;
  onPlayAgain: () => void;
}

export default function GameScreen({
  theme,
  onThemeToggle,
  onHelp,
  onClose,
  options,
  onGameOver,
  onPlayAgain,
}: Props) {
  // REPLACE: const { ... } = useGame(options)
  void useGame(options);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, []);
  // REPLACE: const isGameOver = state.phase === 'over'
  const isGameOver = false;
  const showGameOver = isGameOver && !gameOverDismissed;

  return (
    <div className="card">
      <Header
        variant="game"
        theme={theme}
        onThemeToggle={onThemeToggle}
        onHelp={onHelp}
        onClose={() => (isGameOver ? setGameOverDismissed(false) : setShowConfirm(true))}
        center="Your turn"
      />
      <main className="game-content" ref={mainRef} tabIndex={-1}>
        <GameBoard />
      </main>
      {showConfirm && (
        <ConfirmModal
          message="Return to the main menu? You can resume your game from there."
          confirmLabel="Quit"
          cancelLabel="Cancel"
          onConfirm={onClose}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showGameOver && (
        <GameOverModal
          result="You Win!"
          resultType="win"
          note="Optional note about what happened"
          onDismiss={() => setGameOverDismissed(true)}
          onPlayAgain={onPlayAgain}
          onHome={onClose}
        />
      )}
    </div>
  );
}
