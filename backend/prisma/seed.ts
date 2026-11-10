/**
 * Seed script — populates the database with:
 *   - 7 canonical games (slugs match the prototype)
 *   - 3 demo users (niwantha, user, player) with password "1234"
 *   - 20 random Run records spread across users and games
 *
 * Run via:  npx prisma db seed
 * (Wired in package.json under "prisma.seed")
 * Drafted with an LLM coding assistant.
 */

import { PrismaClient, GameType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Game catalogue — slugs, names, categories and emojis must match
// frontend/src/games/registry.ts (which mirrors the prototype's GAMES object)
// ---------------------------------------------------------------------------
const GAMES = [
  { id: 'snake',         name: 'Snake',          category: 'banana', type: GameType.SNAKE,  emoji: '🐍' },
  { id: 'fruit-ninja',   name: 'Fruit Slash',    category: 'smile',  type: GameType.SLASH,  emoji: '🍉' },
  { id: 'star-scraper',  name: 'Star Scraper',   category: 'tomato', type: GameType.ARCADE, emoji: '🚀' },
  { id: 'fish-count',    name: 'Fish Count',     category: 'fish',   type: GameType.PUZZLE, emoji: '🐟' },
  { id: 'banana-streak', name: 'Banana Streak',  category: 'banana', type: GameType.PUZZLE, emoji: '🍌' },
  { id: 'tomato-rush',   name: 'Tomato Rush',    category: 'tomato', type: GameType.PUZZLE, emoji: '🍅' },
  { id: 'smile-cove',    name: 'Smile Cove',     category: 'smile',  type: GameType.PUZZLE, emoji: '😀' },
];

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------
const DEMO_USERS = [
  { username: 'niwantha' },
  { username: 'user' },
  { username: 'player' },
];

async function main() {
  const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const passwordHash = await bcrypt.hash('1234', bcryptRounds);

  // Upsert games
  for (const game of GAMES) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: game,
      create: game,
    });
  }
  console.log(`✅ Seeded ${GAMES.length} games`);

  // Upsert demo users
  const users = [];
  for (const { username } of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, passwordHash },
    });
    users.push(user);
  }
  console.log(`✅ Seeded ${users.length} users`);

  // Create 20 random Run records for the leaderboard demo
  const existing = await prisma.run.count();
  if (existing < 20) {
    for (let i = 0; i < 20; i++) {
      const user  = users[i % users.length];
      const game  = GAMES[i % GAMES.length];
      const score = Math.floor(Math.random() * 1000);
      const startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      // Keep the numbers believable: correct <= attempts, maxCombo <= correct
      const attempts = Math.floor(Math.random() * 10) + 1;
      const correct  = Math.floor(Math.random() * (attempts + 1));
      const maxCombo = Math.floor(Math.random() * (correct + 1));
      await prisma.run.create({
        data: {
          userId:    user.id,
          gameId:    game.id,
          score,
          attempts,
          correct,
          maxCombo,
          startedAt,
        },
      });
    }
    console.log('✅ Seeded 20 demo runs');
  } else {
    console.log('⏭  Runs already seeded — skipping');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

