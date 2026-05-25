const axios = require("axios");
// FIX 1: Correct SDK extraction for the official @google/genai module
const { GoogleGenAI } = require("@google/genai");
const { getCollection } = require("../config/db");
const { ObjectId } = require("mongodb");

// ✅ FIX 2: Pass an empty object configuration {} so the SDK can safely inspect fallbacks and pull from process.env
const ai = new GoogleGenAI({});

// SOURCE 1: Wikipedia Fetcher
async function fetchWikipediaTrivia(locationName) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(locationName)}&limit=1&namespace=0&format=json`;
    const searchResponse = await axios.get(searchUrl);
    const exactTitle = searchResponse.data[1]?.[0];

    if (!exactTitle) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(exactTitle)}`;
    const summaryResponse = await axios.get(summaryUrl);

    if (summaryResponse.data && summaryResponse.data.extract) {
      return summaryResponse.data.extract;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// SOURCE 2: AI Generation Engine
async function generateAITrivia(locationName) {
  try {
    console.log(
      `[AI ENGINE] Activating AI fallback generation for: ${locationName}`,
    );

    // Using the correct structural syntax for gemini-2.5-flash content generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a single, highly compelling historical or geographic fact about "${locationName}" located in India. The response must be a single sentence, completely plain text, no markdown, and strictly under 30 words.`,
    });

    if (response && response.text) {
      return response.text.trim();
    }
    return null;
  } catch (error) {
    console.error("[AI ERROR] Generation failed:", error.message);
    return null;
  }
}

exports.getAllRoutes = async (req, res) => {
  try {
    const routesCollection = getCollection("routes");
    const result = await routesCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public stream" });
  }
};

exports.createRoute = async (req, res) => {
  const { name, milestones } = req.body;
  if (!name || !milestones) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const locationArray = milestones
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const extractedTrivia = [];

  try {
    const landmarksCollection = getCollection("landmarks");

    for (let loc of locationArray) {
      const normalizedLoc = loc.toLowerCase();
      console.log(`[HYBRID PIPELINE] Processing milestone: ${loc}`);

      // STEP 1: Check Database Cache Layer
      const cachedLandmark = await landmarksCollection.findOne({
        name: normalizedLoc,
      });

      if (cachedLandmark) {
        console.log(
          `[DATABASE CACHE] Cache hit! Found data locally for: ${loc}`,
        );
        extractedTrivia.push(`[via DB Cache] ${cachedLandmark.fact}`);
        continue;
      }

      // STEP 2: Cache Miss -> Attempt Wikipedia
      let fact = await fetchWikipediaTrivia(loc);
      let source = "Wikipedia";

      // STEP 3: Wikipedia Miss -> Attempt Gemini AI
      if (!fact) {
        fact = await generateAITrivia(loc);
        source = "CivicAI Intelligence Engine";
      }

      if (fact) {
        const formattedFact = `${fact} (${source === "Wikipedia" ? "Wiki" : "AI Source"})`;
        extractedTrivia.push(`[via Network Fetch] ${formattedFact}`);

        // STEP 4: Save to MongoDB cache layer
        await landmarksCollection.insertOne({
          name: normalizedLoc,
          fact: formattedFact,
          created_at: new Date(),
        });
        console.log(
          `[DATABASE CACHE] Fresh data cached for future requests: ${loc}`,
        );
      } else {
        extractedTrivia.push(
          `Route passed through ${loc}. Local landmark verified.`,
        );
      }
    }

    const newRoute = {
      name,
      path: locationArray.join(" -> "),
      trivia: extractedTrivia,
      createdBy: req.user?.username || "anonymous",
      created_at: new Date(),
    };

    const routesCollection = getCollection("routes");
    const result = await routesCollection.insertOne(newRoute);

    // Smooth frontend spread-payload mapping compatibility
    res.status(201).json({ _id: result.insertedId, ...newRoute });
  } catch (err) {
    console.error("[CREATE ROUTE ERROR]", err);
    res.status(500).json({ error: "Database or server pipeline failure" });
  }
};

// PROTECTED DELETE ROUTE: Verifies ownership before removing a document
exports.deleteRoute = async (req, res) => {
  try {
    const routeId = req.params.id;
    console.log(
      `[BACKEND DEBUG] Incoming target delete request payload for ID: "${routeId}"`,
    );

    // 1. Verify parameter presence
    if (!routeId || routeId === "undefined" || routeId === "null") {
      console.error(
        "[BACKEND ERROR] Rejected: Route ID parameter string is literally undefined or null.",
      );
      return res.status(400).json({
        error: "Invalid route ID parameter passed to server structure.",
      });
    }

    // 2. Structural ObjectId Hex-String validations (Prevents engine crashes)
    if (!ObjectId.isValid(routeId)) {
      console.error(
        `[BACKEND ERROR] Rejected: "${routeId}" is not a valid 24-character hex MongoDB ObjectId string.`,
      );
      return res
        .status(400)
        .json({ error: "Malformatted standard database lookup ID sequence." });
    }

    // 3. Perform Deletion Task execution via your established getCollection database utility configuration
    const routesCollection = getCollection("routes");

    const result = await routesCollection.deleteOne({
      _id: new ObjectId(routeId),
      createdBy: req.user.username, // Guarantees authorization lock patterns
    });

    console.log("[BACKEND DB RESULT] Documents removed:", result.deletedCount);

    if (result.deletedCount === 0) {
      console.warn(
        `[BACKEND WARN] Delete targeted route matching ID ${routeId} from user ${req.user.username} was not found.`,
      );
      return res.status(404).json({
        error:
          "Route not found or you are unauthorized to clear this log track.",
      });
    }

    return res.status(200).json({
      message: "Transit infrastructure path completely cleared successfully.",
    });
  } catch (error) {
    console.error("[SERVER BREAKPOINT EXCEPTION]:", error);
    return res
      .status(500)
      .json({ error: "Internal core engine runtime processing failure." });
  }
};
