import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.count());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-[#1b2838] border-b border-[#2a3f5a] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[#1a9fff] to-[#66c0f4] rounded flex items-center justify-center font-bold text-white text-sm">
            S
          </div>
          <span className="text-white font-semibold text-lg hidden sm:block">Steam</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <NavLink
            to="/store"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded transition-colors ${
                isActive
                  ? "text-white bg-[#2a475e]"
                  : "text-[#acb2b8] hover:text-white hover:bg-[#2a3f5a]"
              }`
            }
          >
            Store
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors ${
                  isActive
                    ? "text-white bg-[#2a475e]"
                    : "text-[#acb2b8] hover:text-white hover:bg-[#2a3f5a]"
                }`
              }
            >
              Library
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/cart"
            className="relative text-[#acb2b8] hover:text-white transition-colors p-2 rounded hover:bg-[#2a3f5a]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1a9fff] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-[#acb2b8] text-sm hidden md:block">
                {user?.displayName ?? user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-[#acb2b8] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-[#2a3f5a]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-[#acb2b8] hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-[#2a3f5a]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="text-sm bg-[#1a9fff] hover:bg-[#2db5ff] text-white px-3 py-1.5 rounded transition-colors"
              >
                Join free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
