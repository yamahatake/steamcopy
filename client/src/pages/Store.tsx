import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "../api/games";
import GameCard from "../components/games/GameCard";

const GENRES = ["Action", "RPG", "Strategy", "Simulation", "Racing", "Roguelike", "Casual", "Sports"];

export default function Store() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["games", { search: debouncedSearch, genre, isFree, page }],
    queryFn: () =>
      gamesApi.list({ search: debouncedSearch, genre, isFree: isFree || undefined, page, limit: 18 }),
    placeholderData: (prev) => prev,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((handleSearch as { timer?: ReturnType<typeof setTimeout> }).timer);
    (handleSearch as { timer?: ReturnType<typeof setTimeout> }).timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  const games = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">All Games</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-[#16202d] border border-[#2a3f5a] text-white placeholder-[#4c6b82] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#66c0f4] w-64"
        />

        <select
          value={genre}
          onChange={(e) => { setGenre(e.target.value); setPage(1); }}
          className="bg-[#16202d] border border-[#2a3f5a] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#66c0f4]"
        >
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-[#acb2b8] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => { setIsFree(e.target.checked); setPage(1); }}
            className="accent-[#1a9fff]"
          />
          Free to play
        </label>

        {(search || genre || isFree) && (
          <button
            onClick={() => { setSearch(""); setDebouncedSearch(""); setGenre(""); setIsFree(false); setPage(1); }}
            className="text-sm text-[#66c0f4] hover:text-white transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="bg-[#16202d] rounded overflow-hidden animate-pulse">
              <div className="aspect-[460/215] bg-[#0e1923]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-[#0e1923] rounded w-3/4" />
                <div className="h-3 bg-[#0e1923] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-20 text-[#4c6b82]">
          <p className="text-lg">No games found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#16202d] border border-[#2a3f5a] text-[#acb2b8] rounded text-sm disabled:opacity-40 hover:border-[#66c0f4] hover:text-white transition-colors"
              >
                Previous
              </button>
              <span className="text-[#acb2b8] text-sm">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-[#16202d] border border-[#2a3f5a] text-[#acb2b8] rounded text-sm disabled:opacity-40 hover:border-[#66c0f4] hover:text-white transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
