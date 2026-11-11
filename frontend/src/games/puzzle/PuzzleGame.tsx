/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + React glue for rubric theme #1.
 *
 * Why this exists: the React side of every puzzle game. It fetches puzzles
 * from our backend (GET /fish/puzzle, never marcconrad.com), shows the image,
 * reads answers, and hands each one to PuzzleEngine for scoring.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fishApi } from '../../api/fish.api';
import { Button } from '../../ui/Button';
import { ArcadeCabinet } from '../shared/ArcadeCabinet';
import { play } from '../shared/audio';
import type { GameProps } from '../shared/props';
import { ResultModal } from '../shared/ResultModal';
import type { RunStats } from '../shared/types';
import { useRunRecorder } from '../shared/useRunRecorder';
import { PuzzleEngine } from './engine';
import type { AnswerOutcome, PuzzleRules } from './engine';

type LoadStatus = 'loading' | 'ready' | 'error';

const PROGRESS_SEGMENTS = 20;

/** What the HUD calls the puzzle's status box. */
function statusTitle(rules: PuzzleRules): string {
  if (rules.lives) return 'LIVES';
  if (rules.timeLimit) return 'TIME';
  if (rules.rounds) return 'ROUND';
  return 'SOLVED';
}

export function PuzzleGame({ meta, onPlayAgain, rules }: GameProps & { rules: PuzzleRules }) {
  const navigate = useNavigate();
  const recorder = useRunRecorder(meta);
  const [engine] = useState(() => new PuzzleEngine(rules));
  const [, setVersion] = useState(0); // the engine is mutable, so bump this to re-render
  const refresh = () => setVersion((v) => v + 1);

  const [imageSrc, setImageSrc] = useState('');
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ outcome: AnswerOutcome; id: number } | null>(null);
  const [hint, setHint] = useState('');
  const [result, setResult] = useState<RunStats | null>(null);
  const latestRequest = useRef(0);
  const answerInput = useRef<HTMLInputElement>(null);

  const finish = useCallback(() => {
    const stats = engine.stats();
    setResult(stats);
    void recorder.save(stats);
  }, [engine, recorder]);

  // Status starts as 'loading'; nextPuzzle() resets it for later puzzles.
  const loadPuzzle = useCallback(async () => {
    const request = ++latestRequest.current; // ignore answers to older requests
    engine.setSolution(null);
    try {
      const puzzle = await fishApi.getPuzzle(meta.category);
      if (request !== latestRequest.current) return;
      engine.setSolution(puzzle.sol);
      setImageSrc(puzzle.imageSrc);
      setAnswer('');
      setHint('');
      setStatus('ready');
      answerInput.current?.focus();
    } catch {
      if (request === latestRequest.current) setStatus('error');
    }
  }, [engine, meta.category]);

  useEffect(() => {
    // Fetching is the external system here; loadPuzzle only sets state after its await.
    // oxlint-disable-next-line react/set-state-in-effect
    void loadPuzzle();
  }, [loadPuzzle]);

  function nextPuzzle() {
    setStatus('loading');
    void loadPuzzle();
  }

  // Tomato Rush's countdown.
  useEffect(() => {
    if (!rules.timeLimit) return;
    const timer = setInterval(() => {
      if (engine.state.over) return clearInterval(timer);
      engine.tick();
      refresh();
      if (engine.state.over) finish();
    }, 1000);
    return () => clearInterval(timer);
  }, [engine, rules.timeLimit, finish]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const outcome = engine.answer(Number.parseInt(answer, 10));
    if (outcome === 'ignored') return;

    setFeedback({ outcome, id: Date.now() });
    play({ kind: outcome === 'correct' ? 'good' : 'bad' });
    refresh();

    if (engine.state.over) finish();
    else if (outcome === 'correct') nextPuzzle();
    else setAnswer('');
  }

  function exit() {
    if (!engine.state.over) void recorder.save(engine.stats());
    navigate('/dashboard');
  }

  const hiScore = Math.max(0, ...recorder.history.filter((r) => r.gameId === meta.slug).map((r) => r.score));
  const litSegments = Math.round(engine.progress() * PROGRESS_SEGMENTS);
  const lowTime = rules.timeLimit !== undefined && engine.state.timeLeft <= 10;

  const screen = (
    <div className="screen crt stage-wide">
      <div
        key={feedback?.id}
        className={`relative min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] bg-[#f4f7ff] flex items-center justify-center overflow-hidden ${
          feedback?.outcome === 'wrong' ? 'shake' : ''
        }`}
      >
        {status === 'ready' ? (
          <img key={imageSrc} src={imageSrc} alt="Puzzle" className="max-h-[56vh] max-w-full fade-in" />
        ) : (
          <span className={`pixel text-xs text-[#1c1543] text-center px-4 ${status === 'loading' ? 'blink' : ''}`}>
            {status === 'loading' ? 'LOADING PUZZLE…' : 'PUZZLE SERVICE OFFLINE · PRESS SKIP TO RETRY'}
          </span>
        )}
        {feedback && (
          <div
            className={`absolute inset-x-0 top-4 z-[4] text-center pixel text-lg sm:text-2xl fade-in ${
              feedback.outcome === 'correct' ? 'neon-green' : 'neon-pink'
            }`}
          >
            {feedback.outcome === 'correct' ? 'CORRECT!' : 'MISS!'}
          </div>
        )}
      </div>
      <div className="bg-[#05030f] px-3 py-2 flex items-center gap-3">
        <span className="pixel text-[0.55rem] muted shrink-0">{statusTitle(rules)}</span>
        <div className="flex-1 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${PROGRESS_SEGMENTS}, 1fr)` }}>
          {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
            <i
              key={i}
              className={`seg ${i < litSegments ? 'on' : ''}`}
              style={{ ['--seg' as string]: lowTime ? 'var(--pink)' : 'var(--green)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const deck = (
    <form className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end" onSubmit={submit}>
      <div>
        <label className="lab" htmlFor="answer">{rules.question}</label>
        <div className="flex gap-2">
          <input
            id="answer"
            ref={answerInput}
            type="number"
            inputMode="numeric"
            placeholder="?"
            className="inp pixel text-xl text-center"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="shrink-0 glow">CHECK ▶</Button>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {rules.hintCost ? (
          <Button variant="secondary" onClick={() => { setHint(engine.takeHint() ?? ''); refresh(); }}>
            💡 HINT -{rules.hintCost}
          </Button>
        ) : null}
        <Button variant="secondary" onClick={() => { setFeedback(null); nextPuzzle(); }}>⏭ SKIP</Button>
      </div>
      {hint && <p className="md:col-span-2 text-sm neon-cyan text-center">{hint}</p>}
    </form>
  );

  return (
    <>
      <ArcadeCabinet
        meta={meta}
        score={engine.state.score}
        hiScore={hiScore}
        status={{ label: statusTitle(rules), value: engine.statusLabel() }}
        combo={engine.comboLabel()}
        onExit={exit}
        screen={screen}
        deck={deck}
        controls="Read the picture, type the number and press Enter. Skip loads a new puzzle."
      />

      {result && (
        <ResultModal meta={meta} stats={result} recorder={recorder} onPlayAgain={onPlayAgain} onHome={() => navigate('/dashboard')} />
      )}
    </>
  );
}
