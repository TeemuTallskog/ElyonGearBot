const {Client, Intents}= require("discord.js");
require('dotenv').config();
const mongoose = require('./database/mongoose');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

client.once('ready', () => {
    console.log("Bot is online")
});

mongoose.init();
client.login(process.env.TOKEN).then(r => {
    console.log("Successful login");
});