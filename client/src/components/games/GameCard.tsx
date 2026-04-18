import { Link } from "react-router-dom";
import type { Game } from "../../api/games";

interface Props {
  game: Game;
}

export default function GameCard({ game }: Props) {
  const discount =
    game.originalPrice && parseFloat(game.originalPrice) > parseFloat(game.price)
      ? Math.round(
          ((parseFloat(game.originalPrice) - parseFloat(game.price)) /
            parseFloat(game.originalPrice)) *
            100
        )
      : 0;

  return (
    <Link
      to={`/game/${game.slug}`}
      className="group block bg-[#16202d] rounded overflow-hidden hover:shadow-lg hover:shadow-black/40 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="aspect-[460/215] overflow-hidden bg-[#0e1923]">
        {game.headerImage ? (
          <img
            src={game.headerImage}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4c6b82]">
            No image
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-white text-sm font-medium truncate mb-1 group-hover:text-[#66c0f4] transition-colors">
          {game.title}
        </h3>

        {game.genres.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {game.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="text-[10px] text-[#66c0f4] bg-[#1a3a52] px-1.5 py-0.5 rounded"
              >
                {g.genre}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          {game.reviewScore !== null && game.reviewScore > 0 && (
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  game.reviewScore >= 80
                    ? "bg-[#66c0f4]"
                    : game.reviewScore >= 60
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
              />
              <span className="text-xs text-[#acb2b8]">{game.reviewScore}%</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            {discount > 0 && (
              <span className="text-xs bg-[#4c6b22] text-[#beee11] px-1.5 py-0.5 rounded font-semibold">
                -{discount}%
              </span>
            )}
            {game.isFree ? (
              <span className="text-sm font-semibold text-[#66c0f4]">Free</span>
            ) : (
              <div className="flex items-center gap-1.5">
                {game.originalPrice && parseFloat(game.originalPrice) > parseFloat(game.price) && (
                  <span className="text-xs text-[#738895] line-through">
                    ${parseFloat(game.originalPrice).toFixed(2)}
                  </span>
                )}
                <span className="text-sm font-semibold text-white">
                  ${parseFloat(game.price).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
