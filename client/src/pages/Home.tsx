import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { gamesApi } from "../api/games";
import GameCard from "../components/games/GameCard";

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ["games", "featured"],
    queryFn: gamesApi.featured,
  });

  const featured = data?.data ?? [];
  const hero = featured[0];

  return (
    <div className="min-h-full">
      {/* Hero */}
      {hero && (
        <div
          className="relative h-[420px] bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.backgroundImage ?? hero.headerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-[#1b2838]/60 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-12">
            <h1 className="text-4xl font-bold text-white mb-2">{hero.title}</h1>
            <p className="text-[#acb2b8] text-base max-w-xl mb-4 line-clamp-2">
              {hero.shortDescription}
            </p>
            <div className="flex items-center gap-4">
              <Link
                to={`/game/${hero.slug}`}
                className="bg-[#1a9fff] hover:bg-[#2db5ff] text-white px-6 py-2.5 rounded font-medium transition-colors"
              >
                View game
              </Link>
              <span className="text-[#acb2b8] text-sm">
                {hero.isFree ? "Free to Play" : `$${parseFloat(hero.price).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Featured section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">Featured & Recommended</h2>
          <Link to="/store" className="text-[#66c0f4] text-sm hover:text-white transition-colors">
            Browse all
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#16202d] rounded overflow-hidden animate-pulse">
                <div className="aspect-[460/215] bg-[#0e1923]" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-[#0e1923] rounded w-3/4" />
                  <div className="h-3 bg-[#0e1923] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featured.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>

      {/* CTA banner */}
      <div className="bg-[#171a21] border-y border-[#2a3f5a] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Discover your next favorite game</h2>
          <p className="text-[#acb2b8] mb-6">
            Thousands of games available. New deals every day.
          </p>
          <Link
            to="/store"
            className="inline-block bg-[#1a9fff] hover:bg-[#2db5ff] text-white px-8 py-3 rounded font-medium transition-colors"
          >
            Browse the Store
          </Link>
        </div>
      </div>
    </div>
  );
}
