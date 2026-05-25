"use client";

import React, { useState, useEffect } from "react";

// 🌐 Dynamically resolve the backend URL from Vercel's environment variables, falling back to localhost for local development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export default function Home() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login or signup
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // App core state
  const [routeName, setRouteName] = useState("");
  const [milestones, setMilestones] = useState("");
  const [routes, setRoutes] = useState([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' or 'mine'

  // Persistent session checker
  useEffect(() => {
    const savedUser = localStorage.getItem("civic_username");
    const savedToken = localStorage.getItem("civic_token");
    if (savedUser && savedToken) {
      setUser({ username: savedUser, token: savedToken });
    }
    fetchGlobalRoutes();
  }, []);

  const fetchGlobalRoutes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes`);
      const data = await response.json();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error connecting to backend feed:", err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = authMode === "login" ? "login" : "signup";

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Authentication failed");

      localStorage.setItem("civic_token", data.token);
      localStorage.setItem("civic_username", data.username);
      setUser({ username: data.username, token: data.token });

      setUsernameInput("");
      setPasswordInput("");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("civic_token");
    localStorage.removeItem("civic_username");
    setUser(null);
    setFilterMode("all");
  };

  const handleDeleteRoute = async (routeId) => {
    if (!routeId) {
      alert(
        "Frontend Error: Cannot delete track because routeId is undefined or missing.",
      );
      return;
    }

    if (
      !confirm(
        "Are you sure you want to permanently delete this transit track?",
      )
    ) {
      return;
    }

    try {
      console.log("Dispatching DELETE request for ID:", routeId);

      const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token || ""}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || `Server responded with status ${response.status}`,
        );
      }

      setRoutes((prevRoutes) =>
        prevRoutes.filter((route) => route._id !== routeId),
      );
    } catch (err) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  const handleInitializeRoute = async (e) => {
    e.preventDefault();
    if (!routeName.trim() || !milestones.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token || ""}`,
        },
        body: JSON.stringify({ name: routeName, milestones: milestones }),
      });

      if (!response.ok) throw new Error("Processing error");
      const resData = await response.json();

      const freshRoute = resData.route || resData.data || resData;

      if (freshRoute && freshRoute._id) {
        setRoutes((prevRoutes) => [freshRoute, ...prevRoutes]);
        setRouteName("");
        setMilestones("");
      } else {
        console.error(
          "Missing expected _id property on the saved route structure.",
          resData,
        );
        fetchGlobalRoutes();
      }
    } catch (error) {
      alert("Session expired or database error. Please log in again.");
    }
  };

  // ADVANCED FILTER ENGINE
  const filteredRoutes = routes.filter((route) => {
    if (!route) return false;
    const matchesFilterMode =
      filterMode === "all" ||
      route.createdBy?.toLowerCase() === user?.username?.toLowerCase();

    const routePathString = route.path || "";
    const text = `${route.name || ""} ${routePathString}`.toLowerCase();

    return matchesFilterMode && text.includes(searchQuery.toLowerCase());
  });

  // Calculate Metrics
  const myPersonalRoutes = routes.filter(
    (r) => r?.createdBy?.toLowerCase() === user?.username?.toLowerCase(),
  ).length;

  const totalTriviaDiscovered = routes.reduce(
    (acc, curr) =>
      acc + (curr && Array.isArray(curr.trivia) ? curr.trivia.length : 0),
    0,
  );

  // AUTH SPLASH GATE SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 text-gray-100">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center">
            <span className="text-3xl font-black tracking-wider text-red-600 uppercase">
              CivicRoute
            </span>
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Persistent Authentication Portal
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                placeholder="enter handle"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-red-500 font-mono text-center">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3 rounded-lg transition uppercase tracking-wide"
            >
              {authMode === "login"
                ? "Secure Sign In"
                : "Register Core Profile"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() =>
                setAuthMode(authMode === "login" ? "signup" : "login")
              }
              className="text-xs text-gray-400 hover:text-white underline font-mono"
            >
              {authMode === "login"
                ? "Create an account instead"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      {/* Dynamic Header */}
      <header className="border-b border-[#1f1f1f] bg-[#111111] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black tracking-wider text-red-600 uppercase">
              CivicRoute
            </span>
            <span className="text-xs bg-[#222] text-green-400 border border-[#333] px-2 py-0.5 rounded font-mono">
              @{user?.username}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-transparent border border-gray-700 hover:border-red-600 text-gray-400 hover:text-white px-3 py-1.5 rounded font-mono transition"
          >
            Terminate Session (Logout)
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Dynamic Analytics Banner */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Your Contributions
            </span>
            <p className="text-3xl font-black mt-2">
              {myPersonalRoutes}{" "}
              <span className="text-sm font-normal text-gray-500">
                Paths Tracked
              </span>
            </p>
          </div>
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Global Infrastructure Size
            </span>
            <p className="text-3xl font-black mt-2 text-red-500">
              {routes.length}{" "}
              <span className="text-sm font-normal text-gray-500">
                Total System Paths
              </span>
            </p>
          </div>
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Global Trivia Discovered
            </span>
            <p className="text-3xl font-black mt-2 text-green-400">
              {totalTriviaDiscovered}{" "}
              <span className="text-sm font-normal text-gray-500">Facts</span>
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Creator Engine */}
          <section className="lg:col-span-4 bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-2 tracking-tight">
              Map a New Path
            </h2>
            <form className="space-y-4 mt-4" onSubmit={handleInitializeRoute}>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 font-mono">
                  Route Name
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g., South Mumbai Fast Lane"
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1 font-mono">
                  Milestone Nodes (Comma-separated)
                </label>
                <textarea
                  rows="2"
                  value={milestones}
                  onChange={(e) => setMilestones(e.target.value)}
                  placeholder="csmt, flora fountain, bandra"
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition resize-none"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 rounded-lg transition"
              >
                Publish to Global Network
              </button>
            </form>
          </section>

          {/* Right Panel: Global Dashboard Feed */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-[#111111] border border-[#1f1f1f] p-4 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search routes or specific milestones..."
                className="w-full sm:max-w-xs bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
              />

              <div className="flex bg-[#1c1c1c] p-1 border border-[#2e2e2e] rounded-lg">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-4 py-1.5 text-xs font-mono font-bold rounded-md transition ${filterMode === "all" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  All Global Tracks
                </button>
                <button
                  onClick={() => setFilterMode("mine")}
                  className={`px-4 py-1.5 text-xs font-mono font-bold rounded-md transition ${filterMode === "mine" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  My Paths
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRoutes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#1f1f1f] rounded-xl">
                  <p className="text-sm text-gray-500 font-mono">
                    No matching records found in this view pipeline.
                  </p>
                </div>
              ) : (
                filteredRoutes.map((route) => (
                  <div
                    key={route._id}
                    className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#2e2e2e] transition relative"
                  >
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <span className="text-[10px] font-mono bg-[#1c1c1c] text-gray-400 border border-[#222] px-2 py-0.5 rounded">
                        by @{route.createdBy}
                      </span>

                      {route.createdBy?.toLowerCase() ===
                        user?.username?.toLowerCase() && (
                        <button
                          onClick={() => handleDeleteRoute(route._id)}
                          className="text-[10px] font-mono text-red-500 hover:text-white bg-transparent hover:bg-red-600/20 border border-red-500/30 hover:border-red-600 rounded px-2 py-0.5 transition"
                        >
                          ✕ Delete
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight pr-32">
                      {route.name}
                    </h3>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {route.path &&
                        route.path.split(/\s*->\s*/).map((node, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono text-gray-400 bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2c2c2c]"
                          >
                            {node.trim()}
                          </span>
                        ))}
                    </div>

                    {route.trivia && route.trivia.length > 0 && (
                      <div className="mt-4 border-t border-[#1a1a1a] pt-3">
                        <ul className="space-y-1.5">
                          {route.trivia.map((fact, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-gray-300 flex items-start space-x-2"
                            >
                              <span className="text-red-500 font-bold">✦</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
