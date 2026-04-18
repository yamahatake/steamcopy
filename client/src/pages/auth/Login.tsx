import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";

export default function Login() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authApi.login({ email, password });
      setAuth(user, token);
      navigate("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1b2838] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1a9fff] to-[#66c0f4] rounded-lg flex items-center justify-center font-bold text-white text-xl mx-auto mb-3">
            S
          </div>
          <h1 className="text-white text-2xl font-semibold">Sign in to Steam</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#16202d] rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-[#acb2b8] text-sm mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#0e1923] border border-[#2a3f5a] text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#acb2b8] text-sm mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0e1923] border border-[#2a3f5a] text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a9fff] hover:bg-[#2db5ff] disabled:opacity-50 text-white py-2.5 rounded font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[#4c6b82] text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#66c0f4] hover:text-white transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
