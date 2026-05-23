"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [routeName, setRouteName] = useState("");
  const [milestones, setMilestones] = useState("");
  const [routes, setRoutes] = useState([]);

  // FETCH PIPELINE: Syncs live data directly from Neon PostgreSQL on page load
  useEffect(() => {
    const fetchSavedRoutes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/routes");
        if (!response.ok) throw new Error("Failed to sync with database.");
        const data = await response.json();
        setRoutes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[SYNC ERROR]: Backend server is offline.", error);
        setRoutes([]);
      }
    };
  }, []);

  const handleInitializeRoute = async (e) => {
    e.preventDefault();
    if (!routeName.trim() || !milestones.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: routeName, milestones: milestones }),
      });
      if (!response.ok) throw new Error("Network processing failed");
      const freshRouteOutput = await response.json();

      setRoutes([freshRouteOutput, ...routes]);

      setRouteName("");
      setMilestones("");
    } catch (error) {
      console.error("[INTEGRATION ERROR]:", error);
      alert(
        "Could not reach processing engine server. Ensure your backend node script is active",
      );
    }
  };

  // METRICS ENGINE: Computes application analytics dynamically from live states
  const totalRoutes = routes.length;
  const totalTriviaDiscovered = routes.reduce(
    (acc, curr) => acc + (curr.trivia ? curr.trivia.length : 0),
    0,
  );
  const civicRank =
    totalRoutes > 4
      ? "ELITE URBANIST"
      : totalRoutes > 1
        ? "Local Explorer"
        : "Novice Transit Cartographer";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Navbar Section */}
      <header className="border-b border-[#1f1f1f] bg-[#111111] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black tracking-wider text-red-600 uppercase">
              CivicRoute
            </span>
            <span className="text-xs bg-[#222] text-gray-400 border border-[#333] px-2 py-0.5 rounded font-mono">
              v1.1.0-production
            </span>
          </div>
          <p className="text-xs text-green-500 hidden sm:block font-mono animate-pulse">
            ● System Status: Connected to Neon PostgreSQL
          </p>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* PREMIUM METRICS PANEL */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Total Commutes Tracked
            </span>
            <span className="text-3xl font-black mt-2 text-white">
              {totalRoutes}{" "}
              <span className="text-sm font-normal text-gray-500">Paths</span>
            </span>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Historical Facts Unlocked
            </span>
            <span className="text-3xl font-black mt-2 text-red-500">
              {totalTriviaDiscovered}{" "}
              <span className="text-sm font-normal text-gray-500">
                Data Points
              </span>
            </span>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
              Explorer Citizenship Standing
            </span>
            <span className="text-lg font-bold mt-2 text-green-400 tracking-tight">
              {civicRank}
            </span>
          </div>
        </section>

        {/* WORKSPACE SIDE-BY-SIDE SPLITTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form Engine */}
          <section className="lg:col-span-4 bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-2 tracking-tight text-white">
              Create New Journey
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Input your regular transit nodes to extract localized historic
              data points.
            </p>

            <form className="space-y-4" onSubmit={handleInitializeRoute}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                  Route Identifier Name
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g., Daily College Route"
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                  Transit Milestones & Locations
                </label>
                <textarea
                  rows="3"
                  value={milestones}
                  onChange={(e) => setMilestones(e.target.value)}
                  placeholder="e.g., Churchgate, Marine Drive, Bandra"
                  className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition resize-none"
                  required
                ></textarea>
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                  Supported nodes: churchgate, marine drive, bandra, csmt, flora
                  fountain, kala ghoda
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3 rounded-lg transition shadow-lg shadow-red-900/20 active:scale-[0.99]"
              >
                Initialize Route Processing Engine
              </button>
            </form>
          </section>

          {/* Right Column: Output Card Display Pipeline */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Your Monitored Urban Paths
              </h2>
              <span className="text-xs bg-red-950/40 text-red-400 border border-red-900/50 px-2.5 py-1 rounded-full font-mono">
                {totalRoutes} Active Tracks
              </span>
            </div>

            {/* Map Loop Rendering Cards */}
            <div className="grid grid-cols-1 gap-6">
              {totalRoutes === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#1f1f1f] rounded-xl bg-[#111111]/30">
                  <p className="text-sm text-gray-500 font-mono">
                    No active tracks discovered in database storage.
                  </p>
                </div>
              ) : (
                routes.map((route) => (
                  <div
                    key={route.id}
                    className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 hover:border-[#2e2e2e] transition relative overflow-hidden group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {route.name}
                      </h3>

                      {/* GLOWING RECTANGLE TRANSIT GRAPH BADGES */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {route.path.split(/➔|->/).map((node, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono font-medium text-gray-300 bg-[#1c1c1c] px-2.5 py-1 rounded border border-[#2e2e2e] hover:border-red-600 transition"
                          >
                            {node.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-[#1a1a1a] pt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-red-500 font-mono">
                        Extracted Civic & Historical Insights:
                      </h4>
                      <ul className="space-y-2">
                        {route.trivia.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-300 flex items-start space-x-2.5 leading-relaxed"
                          >
                            <span className="text-red-600 mt-1 flex-shrink-0">
                              ✦
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
