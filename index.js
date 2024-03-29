const {
    Client,
    Intents,
    Collection,
    SystemChannelFlags,
    DiscordAPIError
} = require("discord.js");
require('dotenv').config();
const mongoose = require('./database/mongoose');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
const {
    REST
} = require('@discordjs/rest');
const {
    Routes
} = require('discord-api-types/v9');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    console.log("Bot has logged in");

    const rest = new REST({
        version: "9"
    }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID), {
                    body: commands
                },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
})


client.on("interactionCreate", async interaction => {
    if (interaction.isCommand()) {
        if(interaction.guildId === null){
            interaction.reply("Slashcommands are disabled in DM's");
            return;
        }
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        console.log(interaction.commandName);
        try {
            if(interaction.commandName === "remind"){
                await command.execute(interaction, client);
            }else{
                await command.execute(interaction);
            }
        } catch (e) {
            if (e) console.log(e);
            errorReply(interaction);
        }
    }
    if(interaction.isButton()){
        console.log(interaction.message.interaction.commandName);
        let command = client.commands.get(interaction.message.interaction.commandName);
        if(!command && (interaction.customId == "signup" || interaction.customId == "signoff" || interaction.customId == "refresh")){
            command = client.commands.get("attendance");
        }
        if(!command) return;
        try{
            await command.execute(interaction);
        }catch(e){
            if(e) console.error(e);
            errorReply(interaction);
        }
    }

});

const errorReply = async function(interaction){
    await interaction.reply({
        content: "An error occured",
        ephemeral: true
    })
}

mongoose.init();

client.login(process.env.TOKEN).then(console.log("Successful login"));