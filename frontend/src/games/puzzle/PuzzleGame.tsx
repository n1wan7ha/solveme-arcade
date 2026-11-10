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
import { Card } from '../../ui/Card';
import { play } from '../shared/audio';
import { GameHeader } from '../shared/GameHeader';
import type { GameProps } from '../shared/props';
import { ResultModal } from '../shared/ResultModal';
import type { RunStats } from '../shared/types';
import { useRunRecorder } from '../shared/useRunRecorder';
import { PuzzleEngine } from './engine';
import type { AnswerOutcome, PuzzleRules } from './engine';

type LoadStatus = 'loading' | 'ready' | 'error';

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

  const boxAnimation = feedback?.outcome === 'correct' ? 'pop' : feedback ? 'shake' : '';

  return (
    <section className="fade-in flex-1 flex flex-col items-center gap-3">
      <GameHeader
        meta={meta}
        score={engine.state.score}
        livesLabel={engine.statusLabel()}
        comboLabel={engine.comboLabel()}
        onExit={exit}
      />

      <Card className="w-full max-w-4xl p-4 sm:p-5 grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2">
          <div
            key={feedback?.id}
            className={`min-h-[260px] rounded-xl bd bg-[#eef2ff] flex items-center justify-center overflow-hidden ${boxAnimation}`}
          >
            {status === 'ready' ? (
              <img key={imageSrc} src={imageSrc} alt="Puzzle" className="max-h-[380px] max-w-full fade-in" />
            ) : (
              <span className={`opacity-60 ${status === 'loading' ? 'animate-pulse' : ''}`}>
                {status === 'loading' ? 'Decrypting puzzle…' : 'Puzzle service unreachable. Press Skip to retry.'}
              </span>
            )}
          </div>
          <p className="text-center font-bold mt-3">{rules.question}</p>
          <div className="h-3 mt-3 rounded bd bg-white overflow-hidden">
            <i className="block h-full bg-r transition-all" style={{ width: `${engine.progress() * 100}%` }} />
          </div>
        </div>

        <form className="flex flex-col gap-3 justify-center" onSubmit={submit}>
          <label className="lab" htmlFor="answer">Your answer</label>
          <input
            id="answer"
            ref={answerInput}
            type="number"
            inputMode="numeric"
            className="inp dot text-3xl text-center"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
          <Button type="submit">CHECK</Button>
          <div className="grid grid-cols-2 gap-3">
            {rules.hintCost ? (
              <Button variant="secondary" onClick={() => { setHint(engine.takeHint() ?? ''); refresh(); }}>
                💡 Hint (-{rules.hintCost})
              </Button>
            ) : (
              <span />
            )}
            <Button variant="secondary" onClick={() => { setFeedback(null); nextPuzzle(); }}>⏭ Skip</Button>
          </div>
          <div className={`min-h-[2rem] text-center font-bold ${feedback?.outcome === 'correct' ? 'text-emerald-500' : 'text-red-500'}`}>
            {feedback && (feedback.outcome === 'correct' ? 'Correct! 🎉' : 'Not quite. Try again!')}
          </div>
          <div className="text-xs tx-b text-center font-bold">{hint}</div>
        </form>
      </Card>

      {result && (
        <ResultModal meta={meta} stats={result} recorder={recorder} onPlayAgain={onPlayAgain} onHome={() => navigate('/dashboard')} />
      )}
    </section>
  );
}
