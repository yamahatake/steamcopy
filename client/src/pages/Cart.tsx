import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { cartApi } from "../api/cart";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

export default function Cart() {
  const { isAuthenticated } = useAuthStore();
  const { setItems, removeItem, clear, total } = useCartStore();
  const qc = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await cartApi.get();
      setItems(res.data);
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const items = useCartStore((s) => s.items);

  const removeMutation = useMutation({
    mutationFn: (gameId: string) => cartApi.remove(gameId),
    onSuccess: (_, gameId) => {
      removeItem(gameId);
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: cartApi.checkout,
    onSuccess: () => {
      clear();
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["library"] });
    },
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Your Cart</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#16202d] rounded p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#4c6b82] text-lg mb-4">Your cart is empty.</p>
          <Link
            to="/store"
            className="inline-block bg-[#1a9fff] hover:bg-[#2db5ff] text-white px-6 py-2.5 rounded font-medium transition-colors"
          >
            Browse the Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#16202d] rounded p-4 flex items-center gap-4"
              >
                {item.game.headerImage && (
                  <img
                    src={item.game.headerImage}
                    alt={item.game.title}
                    className="w-24 h-14 object-cover rounded shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/game/${item.game.slug}`}
                    className="text-white font-medium hover:text-[#66c0f4] transition-colors block truncate"
                  >
                    {item.game.title}
                  </Link>
                  <p className="text-[#4c6b82] text-xs mt-0.5">
                    {item.game.developer ?? "Unknown developer"}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-white font-semibold">
                    {item.game.isFree ? "Free" : `$${parseFloat(item.game.price).toFixed(2)}`}
                  </span>
                  <button
                    onClick={() => removeMutation.mutate(item.gameId)}
                    disabled={removeMutation.isPending}
                    className="text-[#4c6b82] hover:text-red-400 transition-colors text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#16202d] rounded p-5 h-fit space-y-4">
            <h2 className="text-white font-semibold text-lg">Order Summary</h2>
            <div className="space-y-2 border-t border-[#2a3f5a] pt-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#acb2b8] truncate max-w-[65%]">{item.game.title}</span>
                  <span className="text-white">
                    {item.game.isFree ? "Free" : `$${parseFloat(item.game.price).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t border-[#2a3f5a] pt-3 font-semibold">
              <span className="text-white">Total</span>
              <span className="text-[#66c0f4] text-lg">${total().toFixed(2)}</span>
            </div>

            {checkoutMutation.isSuccess && (
              <p className="text-green-400 text-sm text-center">Purchase successful!</p>
            )}
            {checkoutMutation.isError && (
              <p className="text-red-400 text-sm text-center">
                {(checkoutMutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Purchase failed"}
              </p>
            )}

            <button
              onClick={() => checkoutMutation.mutate()}
              disabled={checkoutMutation.isPending}
              className="w-full bg-[#1a9fff] hover:bg-[#2db5ff] disabled:opacity-50 text-white py-3 rounded font-medium transition-colors"
            >
              {checkoutMutation.isPending ? "Processing..." : "Purchase"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
