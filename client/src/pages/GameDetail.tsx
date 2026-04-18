import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesApi } from "../api/games";
import { cartApi, usersApi } from "../api/cart";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

function ReviewBadge({ score }: { score: number }) {
  const label = score >= 80 ? "Very Positive" : score >= 70 ? "Mostly Positive" : score >= 40 ? "Mixed" : "Negative";
  const color = score >= 80 ? "text-[#66c0f4]" : score >= 40 ? "text-yellow-400" : "text-red-400";
  return <span className={`font-medium ${color}`}>{label} ({score}%)</span>;
}

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, items } = useCartStore();
  const qc = useQueryClient();

  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const { data: gameData, isLoading } = useQuery({
    queryKey: ["game", slug],
    queryFn: () => gamesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: ownership } = useQuery({
    queryKey: ["ownership", slug],
    queryFn: () => gamesApi.getOwnership(slug!),
    enabled: !!slug && isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.add(game!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: () =>
      ownership?.wishlisted
        ? usersApi.removeFromWishlist(game!.id)
        : usersApi.addToWishlist(game!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ownership", slug] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-8 bg-[#16202d] rounded w-64" />
        <div className="h-64 bg-[#16202d] rounded" />
      </div>
    );
  }

  const game = gameData?.data;
  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#4c6b82]">
        Game not found.
      </div>
    );
  }

  const inCart = items.some((i) => i.gameId === game.id);

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    addToCartMutation.mutate();
  };

  const discount =
    game.originalPrice && parseFloat(game.originalPrice) > parseFloat(game.price)
      ? Math.round(
          ((parseFloat(game.originalPrice) - parseFloat(game.price)) /
            parseFloat(game.originalPrice)) *
            100
        )
      : 0;

  return (
    <div
      className="min-h-full"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(27,40,56,0.95), #1b2838 400px), url(${game.backgroundImage ?? ""})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">{game.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: screenshots */}
          <div className="lg:col-span-2">
            {game.screenshots.length > 0 && (
              <div className="mb-4">
                <div className="aspect-video bg-black rounded overflow-hidden mb-2">
                  <img
                    src={game.screenshots[activeScreenshot]?.fullUrl ?? game.headerImage ?? ""}
                    alt="Screenshot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {game.screenshots.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveScreenshot(i)}
                      className={`shrink-0 w-20 h-12 rounded overflow-hidden border-2 transition-colors ${
                        i === activeScreenshot ? "border-[#66c0f4]" : "border-transparent"
                      }`}
                    >
                      <img src={s.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#16202d] rounded p-4">
              <p className="text-[#acb2b8] text-sm leading-relaxed">{game.description}</p>
            </div>
          </div>

          {/* Right: purchase panel */}
          <div className="space-y-4">
            {game.headerImage && (
              <img src={game.headerImage} alt={game.title} className="w-full rounded" />
            )}

            <div className="bg-[#c6d4df]/10 rounded p-4 space-y-3">
              <p className="text-[#acb2b8] text-sm">{game.shortDescription}</p>

              <div className="border-t border-[#2a3f5a] pt-3 text-sm text-[#acb2b8] space-y-1">
                {game.developer && <p><span className="text-white">Developer:</span> {game.developer}</p>}
                {game.publisher && <p><span className="text-white">Publisher:</span> {game.publisher}</p>}
                {game.releaseDate && (
                  <p>
                    <span className="text-white">Release Date:</span>{" "}
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </p>
                )}
                {game.reviewScore !== null && game.reviewScore > 0 && (
                  <p>
                    <span className="text-white">Reviews:</span>{" "}
                    <ReviewBadge score={game.reviewScore} />
                    <span className="text-[#4c6b82] ml-1">({game.reviewCount?.toLocaleString()})</span>
                  </p>
                )}
              </div>

              {game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {game.genres.map((g) => (
                    <span key={g.id} className="text-xs text-[#66c0f4] bg-[#1a3a52] px-2 py-0.5 rounded">
                      {g.genre}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price + CTA */}
            <div className="bg-[#c6d4df]/10 rounded p-4">
              {ownership?.owned ? (
                <div className="text-center">
                  <p className="text-[#66c0f4] font-medium mb-3">In your library</p>
                  <button className="w-full bg-[#4c7a1e] hover:bg-[#5a8f23] text-white py-2.5 rounded font-medium transition-colors">
                    Play Game
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    {discount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-[#4c6b22] text-[#beee11] text-sm px-2 py-0.5 rounded font-bold">
                          -{discount}%
                        </span>
                        <div>
                          <div className="text-[#738895] text-xs line-through">
                            ${parseFloat(game.originalPrice!).toFixed(2)}
                          </div>
                          <div className="text-[#beee11] text-xl font-bold">
                            ${parseFloat(game.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ) : game.isFree ? (
                      <span className="text-[#66c0f4] text-xl font-bold">Free to Play</span>
                    ) : (
                      <span className="text-white text-xl font-bold">
                        ${parseFloat(game.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={inCart || addToCartMutation.isPending}
                    className="w-full bg-[#1a9fff] hover:bg-[#2db5ff] disabled:bg-[#1a3a52] disabled:text-[#4c6b82] text-white py-2.5 rounded font-medium transition-colors mb-2"
                  >
                    {inCart ? "In cart" : addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </button>

                  {isAuthenticated && (
                    <button
                      onClick={() => wishlistMutation.mutate()}
                      disabled={wishlistMutation.isPending}
                      className="w-full border border-[#2a3f5a] hover:border-[#66c0f4] text-[#acb2b8] hover:text-white py-2 rounded text-sm transition-colors"
                    >
                      {ownership?.wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
