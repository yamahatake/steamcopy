import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../stores/authStore";

export default function Register() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await authApi.register(form);
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
          <h1 className="text-white text-2xl font-semibold">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#16202d] rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-[#acb2b8] text-sm mb-1.5">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={set("username")}
              required
              minLength={3}
              maxLength={32}
              autoFocus
              className="w-full bg-[#0e1923] border border-[#2a3f5a] text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#acb2b8] text-sm mb-1.5">Display Name (optional)</label>
            <input
              type="text"
              value={form.displayName}
              onChange={set("displayName")}
              maxLength={64}
              className="w-full bg-[#0e1923] border border-[#2a3f5a] text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#acb2b8] text-sm mb-1.5">Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              className="w-full bg-[#0e1923] border border-[#2a3f5a] text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#acb2b8] text-sm mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              minLength={8}
              className="w-full bg-[#0e1923] border border-[#2a3f5a] text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#66c0f4] transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a9fff] hover:bg-[#2db5ff] disabled:opacity-50 text-white py-2.5 rounded font-medium transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-[#4c6b82] text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#66c0f4] hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
