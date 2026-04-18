import "dotenv/config";
import { db } from "./index.js";
import { games, gameGenres, gameTags, gameScreenshots } from "./schema.js";

const SAMPLE_GAMES = [
  {
    slug: "cyber-odyssey-2077",
    title: "Cyber Odyssey 2077",
    shortDescription: "An open-world RPG set in a dystopian future megacity.",
    description:
      "Immerse yourself in the neon-drenched streets of Nova Prime. Cyber Odyssey 2077 is a massive open-world RPG where you play as a mercenary navigating a world of corporate intrigue, cybernetic enhancements, and moral choices that shape the city's fate.",
    price: "59.99",
    originalPrice: "69.99",
    developer: "RedStar Studios",
    publisher: "RedStar Publishing",
    releaseDate: new Date("2024-03-15"),
    headerImage: "https://picsum.photos/seed/game1/460/215",
    capsuleImage: "https://picsum.photos/seed/game1cap/231/87",
    backgroundImage: "https://picsum.photos/seed/game1bg/1920/620",
    isFree: false,
    isEarlyAccess: false,
    reviewScore: 87,
    reviewCount: 24500,
  },
  {
    slug: "galactic-frontier",
    title: "Galactic Frontier",
    shortDescription: "Build, explore, and survive across procedural galaxies.",
    description:
      "Galactic Frontier puts you in command of a starship crew tasked with exploring uncharted galaxies. Mine asteroids, build space stations, form alliances with alien civilizations, and defend your territory from pirates.",
    price: "29.99",
    developer: "Nebula Forge",
    publisher: "Nebula Forge",
    releaseDate: new Date("2023-09-01"),
    headerImage: "https://picsum.photos/seed/game2/460/215",
    capsuleImage: "https://picsum.photos/seed/game2cap/231/87",
    backgroundImage: "https://picsum.photos/seed/game2bg/1920/620",
    isFree: false,
    isEarlyAccess: true,
    reviewScore: 92,
    reviewCount: 8300,
  },
  {
    slug: "shadow-realm-chronicles",
    title: "Shadow Realm Chronicles",
    shortDescription: "A dark fantasy action RPG with brutal combat.",
    description:
      "Descend into a cursed realm where the line between life and death has been shattered. Master a deep combat system, unlock powerful abilities, and face terrifying bosses in this punishing yet rewarding action RPG.",
    price: "49.99",
    developer: "Obsidian Blade Games",
    publisher: "Dark Horse Interactive",
    releaseDate: new Date("2024-01-20"),
    headerImage: "https://picsum.photos/seed/game3/460/215",
    capsuleImage: "https://picsum.photos/seed/game3cap/231/87",
    backgroundImage: "https://picsum.photos/seed/game3bg/1920/620",
    isFree: false,
    isEarlyAccess: false,
    reviewScore: 94,
    reviewCount: 41200,
  },
  {
    slug: "pixel-dungeon-heroes",
    title: "Pixel Dungeon Heroes",
    shortDescription: "A free-to-play roguelike dungeon crawler.",
    description:
      "Dive into endless procedurally-generated dungeons in this charming pixel-art roguelike. Unlock heroes, collect powerful relics, and discover synergies in this infinitely replayable adventure.",
    price: "0.00",
    developer: "BitCraft Studios",
    publisher: "BitCraft Studios",
    releaseDate: new Date("2022-06-10"),
    headerImage: "https://picsum.photos/seed/game4/460/215",
    capsuleImage: "https://picsum.photos/seed/game4cap/231/87",
    backgroundImage: "https://picsum.photos/seed/game4bg/1920/620",
    isFree: true,
    isEarlyAccess: false,
    reviewScore: 78,
    reviewCount: 156000,
  },
  {
    slug: "formula-rush-24",
    title: "Formula Rush 24",
    shortDescription: "The most realistic racing simulation of the year.",
    description:
      "Experience the pinnacle of motorsport simulation. Formula Rush 24 features official teams, authentic physics, dynamic weather, and a comprehensive career mode that takes you from karting to the championship podium.",
    price: "39.99",
    developer: "Apex Dynamics",
    publisher: "Racing World",
    releaseDate: new Date("2024-05-30"),
    headerImage: "https://picsum.photos/seed/game5/460/215",
    capsuleImage: "https://picsum.photos/seed/game5cap/231/87",
    backgroundImage: "https://picsum.photos/seed/game5bg/1920/620",
    isFree: false,
    isEarlyAccess: false,
    reviewScore: 82,
    reviewCount: 12700,
  },
  {
    slug: "verdant-valley",
    title: "Verdant Valley",
    shortDescription: "A cozy farming and life simulation game.",
    description:
      "Escape to the peaceful countryside of Verdant Valley. Build your dream farm, befriend villagers, explore mysterious caves, and uncover the ancient secrets of the valley. There's always something new to discover each season.",
    price: "19.99",
    developer: "Sunrise Pixel Co.",
    publisher: "Sunrise Pixel Co.",
    releaseDate: new Date("2023-04-15"),
    headerImage: "https://picsum.photos/seed/game6/460/215",
    capsuleImage: "https://picsum.photos/seed/game6cap/231/87",
    backgroundImage: "https://picsum.photos/seed/game6bg/1920/620",
    isFree: false,
    isEarlyAccess: false,
    reviewScore: 97,
    reviewCount: 89400,
  },
];

const GENRES: Record<string, string[]> = {
  "cyber-odyssey-2077": ["RPG", "Open World", "Action"],
  "galactic-frontier": ["Strategy", "Simulation", "Space"],
  "shadow-realm-chronicles": ["Action RPG", "Souls-like", "Dark Fantasy"],
  "pixel-dungeon-heroes": ["Roguelike", "Dungeon Crawler", "Free to Play"],
  "formula-rush-24": ["Racing", "Simulation", "Sports"],
  "verdant-valley": ["Simulation", "RPG", "Casual"],
};

const TAGS: Record<string, string[]> = {
  "cyber-odyssey-2077": ["cyberpunk", "open-world", "story-rich", "choices-matter"],
  "galactic-frontier": ["space", "building", "survival", "multiplayer"],
  "shadow-realm-chronicles": ["dark", "challenging", "lore-rich", "boss-fights"],
  "pixel-dungeon-heroes": ["pixel-art", "roguelike", "free-to-play", "replayable"],
  "formula-rush-24": ["racing", "realistic", "career-mode", "controller-support"],
  "verdant-valley": ["cozy", "farming", "relaxing", "cute"],
};

async function seed() {
  console.log("Seeding database...");

  for (const gameData of SAMPLE_GAMES) {
    const [game] = await db.insert(games).values(gameData).returning();
    console.log(`Created game: ${game.title}`);

    const genres = GENRES[game.slug] ?? [];
    if (genres.length > 0) {
      await db.insert(gameGenres).values(genres.map((genre) => ({ gameId: game.id, genre })));
    }

    const tags = TAGS[game.slug] ?? [];
    if (tags.length > 0) {
      await db.insert(gameTags).values(tags.map((name) => ({ gameId: game.id, name })));
    }

    await db.insert(gameScreenshots).values([
      {
        gameId: game.id,
        thumbnailUrl: `https://picsum.photos/seed/${game.slug}s1/116/65`,
        fullUrl: `https://picsum.photos/seed/${game.slug}s1/1920/1080`,
        order: 0,
      },
      {
        gameId: game.id,
        thumbnailUrl: `https://picsum.photos/seed/${game.slug}s2/116/65`,
        fullUrl: `https://picsum.photos/seed/${game.slug}s2/1920/1080`,
        order: 1,
      },
      {
        gameId: game.id,
        thumbnailUrl: `https://picsum.photos/seed/${game.slug}s3/116/65`,
        fullUrl: `https://picsum.photos/seed/${game.slug}s3/1920/1080`,
        order: 2,
      },
    ]);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
