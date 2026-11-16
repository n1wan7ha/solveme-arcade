/**
 * Why this exists: SolveMe's own pixel-art icon set, replacing emojis. Every
 * icon is a 16 x 16 bitmap drawn in the arcade palette, so icons look the same
 * on every OS (emojis do not) and match the flat red / white / blue style.
 *
 * Legend:  .  empty    k  ink    r  red    b  blue    w  white
 *          c  currentColor (UI glyphs that follow the text colour)
 * Drafted with an LLM (Claude Code).
 */

type Bitmap = readonly string[];

/** Turns a bitmap 90° clockwise, so one arrow can point four ways. */
const rotate = (rows: Bitmap): Bitmap =>
  rows[0].split('').map((_, x) => rows.map((row) => row[x]).reverse().join(''));

// ---------------------------------------------------------------------------
// UI glyphs (currentColor)
// ---------------------------------------------------------------------------
const TRIANGLE_RIGHT: Bitmap = [
  '................',
  '................',
  '....c...........',
  '....ccc.........',
  '....ccccc.......',
  '....ccccccc.....',
  '....ccccccccc...',
  '....cccccccccc..',
  '....cccccccccc..',
  '....ccccccccc...',
  '....ccccccc.....',
  '....ccccc.......',
  '....ccc.........',
  '....c...........',
  '................',
  '................',
];
const TRIANGLE_DOWN = rotate(TRIANGLE_RIGHT);
const TRIANGLE_LEFT = rotate(TRIANGLE_DOWN);
const TRIANGLE_UP = rotate(TRIANGLE_LEFT);

const PAUSE: Bitmap = [
  '................',
  '................',
  '................',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '....ccc..ccc....',
  '................',
  '................',
  '................',
];

const SOUND: Bitmap = [
  '................',
  '................',
  '................',
  '.......c........',
  '......cc...c....',
  '.....ccc....c...',
  '.ccccccc..c..c..',
  '.ccccccc...c.c..',
  '.ccccccc...c.c..',
  '.ccccccc..c..c..',
  '.....ccc....c...',
  '......cc...c....',
  '.......c........',
  '................',
  '................',
  '................',
];

const MUSIC: Bitmap = [
  '................',
  '................',
  '......cccccccc..',
  '......cccccccc..',
  '......cc....cc..',
  '......cc....cc..',
  '......cc....cc..',
  '......cc....cc..',
  '......cc....cc..',
  '......cc..cccc..',
  '..cccccc.ccccc..',
  '.ccccccc.ccccc..',
  '.ccccccc..ccc...',
  '..ccccc.........',
  '................',
  '................',
];

const FULLSCREEN: Bitmap = [
  '................',
  '................',
  '..cccc....cccc..',
  '..cccc....cccc..',
  '..cc........cc..',
  '..cc........cc..',
  '................',
  '................',
  '................',
  '................',
  '..cc........cc..',
  '..cc........cc..',
  '..cccc....cccc..',
  '..cccc....cccc..',
  '................',
  '................',
];

const CLOSE: Bitmap = [
  '................',
  '................',
  '................',
  '...cc......cc...',
  '...ccc....ccc...',
  '....ccc..ccc....',
  '.....cccccc.....',
  '......cccc......',
  '......cccc......',
  '.....cccccc.....',
  '....ccc..ccc....',
  '...ccc....ccc...',
  '...cc......cc...',
  '................',
  '................',
  '................',
];

const CHECK: Bitmap = [
  '................',
  '................',
  '................',
  '................',
  '............cc..',
  '...........ccc..',
  '..........ccc...',
  '..cc.....ccc....',
  '..ccc...ccc.....',
  '...ccc.ccc......',
  '....ccccc.......',
  '.....ccc........',
  '................',
  '................',
  '................',
  '................',
];

const SKIP: Bitmap = [
  '................',
  '................',
  '................',
  '.c.....c.....cc.',
  '.cc....cc....cc.',
  '.ccc...ccc...cc.',
  '.cccc..cccc..cc.',
  '.ccccc.ccccc.cc.',
  '.ccccc.ccccc.cc.',
  '.cccc..cccc..cc.',
  '.ccc...ccc...cc.',
  '.cc....cc....cc.',
  '.c.....c.....cc.',
  '................',
  '................',
  '................',
];

const REPLAY: Bitmap = [
  '................',
  '................',
  '....cccccc.c....',
  '...ccccccccc....',
  '..ccc....cccc...',
  '..cc....ccccc...',
  '.cc.............',
  '.cc.............',
  '.cc..........cc.',
  '.cc..........cc.',
  '..cc........cc..',
  '..ccc......ccc..',
  '...cccccccccc...',
  '.....cccccc.....',
  '................',
  '................',
];

// ---------------------------------------------------------------------------
// Coloured icons
// ---------------------------------------------------------------------------
const HEART: Bitmap = [
  '................',
  '................',
  '................',
  '...kkkk..kkkk...',
  '..krrwrkkrrrrk..',
  '.krrwrrrrrrrrrk.',
  '.krrrrrrrrrrrrk.',
  '.krrrrrrrrrrrrk.',
  '..krrrrrrrrrrk..',
  '...krrrrrrrrk...',
  '....krrrrrrk....',
  '.....krrrrk.....',
  '......krrk......',
  '.......kk.......',
  '................',
  '................',
];

const BULB: Bitmap = [
  '................',
  '.....kkkkkk.....',
  '....krrrrrrk....',
  '...krwwrrrrrk...',
  '...krwrrrrrrk...',
  '...krrrrrrrrk...',
  '...krrrrrrrrk...',
  '....krrrrrrk....',
  '.....krrrrk.....',
  '.....kkkkkk.....',
  '.....kwwwwk.....',
  '.....kkkkkk.....',
  '.....kwwwwk.....',
  '......kkkk......',
  '................',
  '................',
];

const PHONE: Bitmap = [
  '....kkkkkkkk....',
  '...kwwwwwwwwk...',
  '...kwkkkkkkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkbbbbkwk...',
  '...kwkkkkkkwk...',
  '...kwwwwwwwwk...',
  '...kwwwkkwwwk...',
  '...kwwwwwwwwk...',
  '....kkkkkkkk....',
];

const JOYSTICK: Bitmap = [
  '................',
  '......kkkk......',
  '.....krrrrk.....',
  '.....krwrrk.....',
  '.....krrrrk.....',
  '......kkkk......',
  '.......kk.......',
  '.......kk.......',
  '.......kk.......',
  '...kkkkkkkkkk...',
  '..kwwwwwwwwwwk..',
  '.kwwbbwwwwrrwwk.',
  '.kwwbbwwwwrrwwk.',
  '.kwwwwwwwwwwwwk.',
  '..kkkkkkkkkkkk..',
  '................',
];

const GAMEPAD: Bitmap = [
  '................',
  '................',
  '................',
  '................',
  '..kkkkkkkkkkkk..',
  '.kwwwwwwwwwwwwk.',
  'kwwwkwwwwwwwrwwk',
  'kwwkkkwwwwwrwwwk',
  'kwwwkwwwwwwwwwwk',
  'kwwwwwkkkkwwwwwk',
  'kwwwwk....kwwwwk',
  '.kkkk......kkkk.',
  '................',
  '................',
  '................',
  '................',
];

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------
const SNAKE: Bitmap = [
  '...........kkk..',
  '..bbbbbbbbbkwkr.',
  '..bbbbbbbbbkkk.r',
  '..bb............',
  '..bb............',
  '..bbbbbbbbbbbb..',
  '..bbbbbbbbbbbb..',
  '............bb..',
  '............bb..',
  '..bbbbbbbbbbbb..',
  '..bbbbbbbbbbbb..',
  '..bb............',
  '..bb.......rr...',
  '..bb......rrrr..',
  '..bb.......rr...',
  '................',
];

const MELON: Bitmap = [
  '................',
  '................',
  '................',
  'kkkkkkkkkkkkkkkk',
  'krrrrrrrrrrrrrrk',
  'krrkrrrrrrkrrrrk',
  '.krrrrrkrrrrrrk.',
  '.kwrrrrrrrrrrwk.',
  '..kwrrrkrrrrwk..',
  '...kwwrrrrwwk...',
  '....kbwwwwbk....',
  '.....kbbbbk.....',
  '......kkkk......',
  '................',
  '................',
  '................',
];

const ROCKET: Bitmap = [
  '.......kk.......',
  '......krrk......',
  '.....krrrrk.....',
  '.....kwwwwk.....',
  '.....kwbbwk.....',
  '.....kwbbwk.....',
  '.....kwwwwk.....',
  '.....kwwwwk.....',
  '....kkwwwwkk....',
  '...krkwwwwkrk...',
  '..krrkwwwwkrrk..',
  '..kkkkkkkkkkkk..',
  '.....krrrrk.....',
  '......krrk......',
  '.......kk.......',
  '................',
];

const FISH: Bitmap = [
  '................',
  '................',
  '................',
  '.....kkkkk......',
  '...kkbbbbbkk..kk',
  '..kbwkbbbbbbkkbk',
  '.kbbkkbbbbbbbbbk',
  '.kbbbbbbbbbbbbbk',
  '.kbbbbbbbbbbbbbk',
  '..krbbbbbbbbkkbk',
  '...kkbbbbbkk..kk',
  '.....kkkkk......',
  '................',
  '................',
  '................',
  '................',
];

const BANANA: Bitmap = [
  '................',
  '............kk..',
  '...........kwk..',
  '...........kwwk.',
  '..........kwwwk.',
  '..........kwwwk.',
  '.........kwwwwk.',
  '........kwwwwk..',
  '.......kwwwwbk..',
  '.....kkwwwwbk...',
  '..kkkwwwwwbk....',
  '.kwwwwwwbbk.....',
  '.kkbbbbbkk......',
  '...kkkkk........',
  '................',
  '................',
];

const TOMATO: Bitmap = [
  '................',
  '......kk.kk.....',
  '.....kbbkbbk....',
  '...kkkkbbkkkk...',
  '..krrrkkkkrrrk..',
  '.krwwrrrrrrrrrk.',
  '.krwrrrrrrrrrrk.',
  'krrrrrrrrrrrrrrk',
  'krrrrrrrrrrrrrrk',
  'krrrrrrrrrrrrrrk',
  'krrrrrrrrrrrrrrk',
  '.krrrrrrrrrrrrk.',
  '.krrrrrrrrrrrrk.',
  '..krrrrrrrrrrk..',
  '...kkkkkkkkkk...',
  '................',
];

const SMILE: Bitmap = [
  '................',
  '.....kkkkkk.....',
  '...kkwwwwwwkk...',
  '..kwwwwwwwwwwk..',
  '.kwwwwwwwwwwwwk.',
  '.kwwkkwwwwkkwwk.',
  'kwwwkkwwwwkkwwwk',
  'kwwwwwwwwwwwwwwk',
  'kwwwwwwwwwwwwwwk',
  'kwwkwwwwwwwwkwwk',
  'kwwwkrrrrrrkwwwk',
  '.kwwwkrrrrkwwwk.',
  '.kwwwwkkkkwwwwk.',
  '..kwwwwwwwwwwk..',
  '...kkwwwwwwkk...',
  '.....kkkkkk.....',
];

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
const FLAG: Bitmap = [
  '................',
  '.kk.............',
  '.kkkkkkkkkkkkkk.',
  '.kwwkkwwkkwwkkk.',
  '.kwwkkwwkkwwkkk.',
  '.kkkwwkkwwkkwwk.',
  '.kkkwwkkwwkkwwk.',
  '.kwwkkwwkkwwkkk.',
  '.kwwkkwwkkwwkkk.',
  '.kkkkkkkkkkkkkk.',
  '.kk.............',
  '.kk.............',
  '.kk.............',
  '.kk.............',
  '.kk.............',
  'kkkk............',
];

const STAR: Bitmap = [
  '.......kk.......',
  '.......kk.......',
  '......krrk......',
  '......krrk......',
  '.....krrrrk.....',
  'kkkkkkrrrrkkkkkk',
  '.krrrrrrrrrrrrk.',
  '..krwrrrrrrrrk..',
  '...krrrrrrrrk...',
  '....krrrrrrk....',
  '....krrrrrrk....',
  '...krrrkkrrrk...',
  '...krrk..krrk...',
  '..krk......krk..',
  '..kk........kk..',
  '................',
];

const FLAME: Bitmap = [
  '......k.........',
  '......kk........',
  '.....krk........',
  '.....krrk...k...',
  '....krrrk..kk...',
  '....krrrrkkrk...',
  '...krrrrrrrrk...',
  '..krrrwrrrrrrk..',
  '..krrwwrrrrrrk..',
  '.krrrwwwrrwrrrk.',
  '.krrwwbwwwwrrrk.',
  '.krrwbbbwwwrrrk.',
  '.krrwbbbbwrrrk..',
  '..krrwbbwrrrk...',
  '...kkrrrrkkk....',
  '.....kkkk.......',
];

const TARGET: Bitmap = [
  '................',
  '.....kkkkkk.....',
  '...kkrrrrrrkk...',
  '..krrrrrrrrrrk..',
  '.krrwwwwwwwwrrk.',
  '.krwwwwwwwwwwrk.',
  '.krwwrrrrrrwwrk.',
  '.krwwrrkkrrwwrk.',
  '.krwwrrkkrrwwrk.',
  '.krwwrrrrrrwwrk.',
  '.krwwwwwwwwwwrk.',
  '.krrwwwwwwwwrrk.',
  '..krrrrrrrrrrk..',
  '...kkrrrrrrkk...',
  '.....kkkkkk.....',
  '................',
];

const TROPHY: Bitmap = [
  '................',
  '..kkkkkkkkkkkk..',
  'kkkrrrrrrrrrrkkk',
  'k.krrwrrrrrrrk.k',
  'k.krrwrrrrrrrk.k',
  '.kkrrwrrrrrrrkk.',
  '...krrrrrrrrk...',
  '....krrrrrrk....',
  '.....kkrrkk.....',
  '......krrk......',
  '......krrk......',
  '.....kkkkkk.....',
  '....kbbbbbbk....',
  '....kbbbbbbk....',
  '....kkkkkkkk....',
  '................',
];

export const ICONS = {
  play: TRIANGLE_RIGHT,
  right: TRIANGLE_RIGHT,
  left: TRIANGLE_LEFT,
  up: TRIANGLE_UP,
  down: TRIANGLE_DOWN,
  pause: PAUSE,
  sound: SOUND,
  music: MUSIC,
  fullscreen: FULLSCREEN,
  close: CLOSE,
  check: CHECK,
  skip: SKIP,
  replay: REPLAY,
  heart: HEART,
  bulb: BULB,
  phone: PHONE,
  joystick: JOYSTICK,
  gamepad: GAMEPAD,
  snake: SNAKE,
  melon: MELON,
  rocket: ROCKET,
  fish: FISH,
  banana: BANANA,
  tomato: TOMATO,
  smile: SMILE,
  flag: FLAG,
  star: STAR,
  flame: FLAME,
  target: TARGET,
  trophy: TROPHY,
} satisfies Record<string, Bitmap>;

export type IconName = keyof typeof ICONS;
