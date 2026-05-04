"use client";

import React, { useState } from "react";
import { login } from "../actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await login(password);
    if (success) {
      router.push("/");
    } else {
      setError("Invalid access key. Access denied.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel p-8 relative z-10 border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-3xl">🛡️</span>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">SigInt Secure</h1>
            <p className="text-zinc-400 text-sm">Enter your private access key to enter the terminal.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Key"
                className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600"
                required
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center font-medium animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Authenticate"}
            </button>
          </form>

          <p className="text-zinc-600 text-[10px] uppercase tracking-widest mt-4">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
