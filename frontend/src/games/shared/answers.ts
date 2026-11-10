/**
 * Why this exists: the action games are driven by hidden Fish API answers (the
 * answer picks the golden fruit, the safe lane, or bonus food). This keeps two
 * answers ready ahead of time so play never waits on the network.
 * Engines only see the AnswerSource interface and know nothing about HTTP.
 * Ported from PuzzleAPI.next() and fill() in solveme-arcade.html.
 */

export interface AnswerSource {
  /** The next ready answer (0-9), or undefined if none has arrived yet. */
  take(): number | undefined;
}

const BUFFER_SIZE = 2;
const randomDigit = () => Math.floor(Math.random() * 10);

export class AnswerQueue implements AnswerSource {
  private readonly fetchAnswer: () => Promise<number>;
  private readonly ready: number[] = [];
  private pending = 0;
  private stopped = false;

  constructor(fetchAnswer: () => Promise<number>) {
    this.fetchAnswer = fetchAnswer;
  }

  start(): void {
    this.stopped = false;
    this.fill();
  }

  stop(): void {
    this.stopped = true;
  }

  take(): number | undefined {
    const answer = this.ready.shift();
    this.fill();
    return answer;
  }

  private fill(): void {
    while (!this.stopped && this.ready.length + this.pending < BUFFER_SIZE) {
      this.pending++;
      this.fetchAnswer()
        .catch(randomDigit) // if the puzzle service is down, keep the game playable
        .then((answer) => {
          this.pending--;
          if (!this.stopped) this.ready.push(answer);
        });
    }
  }
}
