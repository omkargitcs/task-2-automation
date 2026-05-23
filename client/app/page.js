"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [routeName, setRouteName] = useState("");
  const [milestones, setMilestones] = useState("");
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchSavedRoutes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/routes");
        if (!response.ok) throw new Error("Failed to sync with database.");
        const data = await response.json();
        setRoutes(data);
      } catch (error) {
        console.error("[SYNC ERROR]:", error);
      }
    };
    fetchSavedRoutes();
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
        "Could not reach processing engine server.Ensure your backend node script is active",
      );
    }
  };

  // Static mockup data simulating our database outputs

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
              v1.0.0-mvp
            </span>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block font-mono">
            System Status: Connected to Core Engine
          </p>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (35% width on large screens) */}
        <section className="lg:col-span-4 bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-2 tracking-tight text-white">
            Create New Journey
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Input your regular transit nodes to extract localized historic data
            points.
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
                placeholder="e.g., Churchgate, Marine Drive, Bandra (separated by commas)"
                className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-3 rounded-lg transition shadow-lg shadow-red-900/20 active:scale-[0.99]"
            >
              Initialize Route Processing Engine
            </button>
          </form>
        </section>

        {/* Right Column: Output Grid View (65% width on large screens) */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Your Monitored Urban Paths
            </h2>
            <span className="text-xs bg-red-950/40 text-red-400 border border-red-900/50 px-2.5 py-1 rounded-full font-mono">
              {routes.length} Tracks Active
            </span>
          </div>

          {/* Map Loop Rendering the Premium Grid Rows */}
          <div className="grid grid-cols-1 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 hover:border-[#2e2e2e] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {route.name}
                  </h3>
                  <span className="text-xs font-mono text-gray-500 bg-[#1c1c1c] px-3 py-1 rounded-md border border-[#262626]">
                    {route.path}
                  </span>
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
