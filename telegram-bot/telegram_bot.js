import { Telegraf } from "telegraf";

const BOT_TOKEN = "8927265644:AAFatQEL6Rv4xgQfKG2C_AI3gswf91Uh9D8";
const bot = new Telegraf(BOT_TOKEN);

let todoList = [];
let notesStorage = [];

bot.start((ctx) => {
  ctx.reply(
    " WELCOME TO YOUR TASK 2 BOT !\n\n" +
      " Available Commands:\n" +
      " /todo <task> - Add an item to your to-do list\n" +
      " /list - view your active to-do list \n" +
      " /note <text> - Quickly store a note\n" +
      " /viewnotes - View all saved notes",
  );
});

bot.command("todo", (ctx) => {
  const task = ctx.message.text.split(" ").slice(1).join(" ");
  if (!task) {
    return ctx.reply(
      "Please provide a task .Example :/todo Buy Milk from dairy",
    );
  }
  todoList.push(task);
  ctx.reply(`ADDED TO LIST :"${task}"`);
});

bot.command("list", (ctx) => {
  if (todoList.length === 0) {
    return ctx.reply("Your to-do list is currently empty!");
  }

  let response = "**Your Current To-Do List:**\n";
  todoList.forEach((item, index) => {
    response += `${index + 1}. ${item}\n`;
  });
  ctx.reply(response);
});

bot.command("note", (ctx) => {
  const noteText = ctx.message.text.split(" ").slice(1).join(" ");

  if (!noteText) {
    return ctx.reply(
      "Please provide some text for the note. Example: /note  9pm:FELT SLEPPY",
    );
  }
  notesStorage.push(noteText);
  ctx.reply("Note saved securely!");
});

bot.command("viewnotes", (ctx) => {
  if (notesStorage.length === 0) {
    return ctx.reply("No notes found.");
  }

  let response = "**Saved Notes:**\n";
  notesStorage.forEach((note, index) => {
    response += `• ${note}\n`;
  });
  ctx.reply(response);
});

bot.launch();
console.log("Telegram Bot is running locally and listening for inputs...");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
