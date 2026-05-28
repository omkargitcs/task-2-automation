// 1. Load environment configurations immediately at the very top entry breakpoint
require("dotenv").config();

// 2. Load external framework middleware packages
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// 3. Load modular app routers
const authRoutes = require("./routes/authRoutes");
const routeRoutes = require("./routes/routeRoutes");

const app = express();

// Set the port fallback for Render environment synchronization
const PORT = process.env.PORT || 5000;

// Setup global request parsers
app.use(cors());
app.use(express.json());

// Mount Modular API Routes
app.use("/api/auth", authRoutes);
app.use("/api/routes", routeRoutes);

// 🔍 ADD THIS: Add a simple health check route so Render knows the server is alive
app.get("/", (req, res) => {
  res.status(200).send("CivicRoute Engine Is Live and Running!");
});

// Establish DB connection securely before starting the server listener
const startServer = async () => {
  try {
    console.log("[SERVER STARTUP] Connecting to MongoDB Atlas cluster...");
    await connectDB();
    console.log(
      "[SERVER STARTUP] Database connection established successfully.",
    );

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SERVER RUNNING] CivicRoute Core active on port ${PORT}`);
    });
  } catch (error) {
    console.error("[SERVER FATAL ERROR] Initialization failed:", error);
    process.exit(1); // Safely exit if database connection drops
  }
};

startServer();

// ==========================================
// TELEGRAM BOT BACKEND DAEMON WORKER (TASK 2)
// ==========================================
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (BOT_TOKEN) {
  const bot = new Telegraf(BOT_TOKEN);

  let todoList = [];
  let notesStorage = [];

  bot.start((ctx) => {
    ctx.reply(
      " 🌟 WELCOME TO YOUR TASK 2 BOT !\n\n" +
        " Available Commands:\n" +
        " /todo <task> - Add an item to your to-do list\n" +
        " /list - view your active to-do list \n" +
        " /note <text> - Quickly store a note\n" +
        " /viewnotes - View all saved notes",
    );
  });

  bot.command("todo", (ctx) => {
    const task = ctx.message.text.split(" ").slice(1).join(" ");
    if (!task)
      return ctx.reply("Please provide a task. Example: /todo Buy Milk");
    todoList.push(task);
    ctx.reply(`ADDED TO LIST: "${task}"`);
  });

  bot.command("list", (ctx) => {
    if (todoList.length === 0)
      return ctx.reply("Your to-do list is currently empty!");
    let response = "📋 **Your Current To-Do List:**\n";
    todoList.forEach((item, index) => {
      response += `${index + 1}. ${item}\n`;
    });
    ctx.reply(response);
  });

  bot.command("note", (ctx) => {
    const noteText = ctx.message.text.split(" ").slice(1).join(" ");
    if (!noteText)
      return ctx.reply(
        "Please provide text. Example: /note 9pm:FEELING SLEEPY",
      );
    notesStorage.push(noteText);
    ctx.reply("Note saved securely!");
  });

  bot.command("viewnotes", (ctx) => {
    if (notesStorage.length === 0) return ctx.reply("No notes found.");
    let response = "📝 **Saved Notes:**\n";
    notesStorage.forEach((note, index) => {
      response += `• ${note}\n`;
    });
    ctx.reply(response);
  });

  bot
    .launch()
    .then(() =>
      console.log(
        "✨ Telegram Bot engine initialized successfully inside Express Runtime!",
      ),
    )
    .catch((err) =>
      console.error("❌ Failed to launch Telegram Bot worker:", err),
    );
} else {
  console.log("⚠️ TELEGRAM_BOT_TOKEN not found. Skipping Bot initialization.");
}
// ==========================================
