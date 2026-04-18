import { useQuery } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { usersApi } from "../api/cart";
import { useAuthStore } from "../stores/authStore";

export default function Library() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: usersApi.library,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const items = data?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">
        Your Library
        {items.length > 0 && (
          <span className="ml-2 text-base font-normal text-[#4c6b82]">({items.length} games)</span>
        )}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#16202d] rounded overflow-hidden animate-pulse">
              <div className="aspect-[231/87] bg-[#0e1923]" />
              <div className="p-2 h-8 bg-[#0e1923] mt-2 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#4c6b82] text-lg mb-4">Your library is empty.</p>
          <Link
            to="/store"
            className="inline-block bg-[#1a9fff] hover:bg-[#2db5ff] text-white px-6 py-2.5 rounded font-medium transition-colors"
          >
            Browse the Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {items.map((entry: { id: string; game: { id: string; slug: string; title: string; capsuleImage: string | null }; playTimeMinutes: number }) => (
            <Link
              key={entry.id}
              to={`/game/${entry.game.slug}`}
              className="group block bg-[#16202d] rounded overflow-hidden hover:shadow-lg hover:shadow-black/40 transition-all hover:-translate-y-0.5"
            >
              <div className="aspect-[231/87] bg-[#0e1923] overflow-hidden">
                {entry.game.capsuleImage ? (
                  <img
                    src={entry.game.capsuleImage}
                    alt={entry.game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#4c6b82] text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-white text-xs font-medium truncate group-hover:text-[#66c0f4] transition-colors">
                  {entry.game.title}
                </p>
                <p className="text-[#4c6b82] text-xs mt-0.5">
                  {entry.playTimeMinutes === 0
                    ? "Never played"
                    : `${Math.round(entry.playTimeMinutes / 60)}h played`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
