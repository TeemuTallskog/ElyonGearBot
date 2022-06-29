const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const {
    execute
} = require("./add");
const {
    MessageEmbed
} = require("discord.js");

const msgreply = "If you haven't added your gear to the bot yet, start by using the command /add gear\n\n```\nAvailable commands:\n- /add\n   ├- gear \n   ├- url\n   └- attachment\n- /update\n   ├- level\n   ├- gearscore\n   ├- name\n   └- class\n- /average\n   ├- level\n   └- gearscore\n- /list (class)\n- /classes\n- /inspect (user)\n- /help\n- /export | admin req\n-/events | admin req\n    ├- attending\n    └- missing\n-/delete | admin req\n-/attendance | admin req\n    ├- create (name) (description) (unique id)\n    ├- attending (id)\n    ├- signedoff (id)\n    ├- missing (id)\n    └- delete (id) // id is optional, leaving it out deletes all events\n/remind | admin req\n    ├- remind all (attendance event id) \n// sends out reminders to people who haven't marked their attendance\n    └- remind user (member) (attendance event id)\n```";
module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Post a list of commands"),

    async execute(interaction) {
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Help")
            .setDescription(msgreply)
        interaction.reply({
            embeds: [embed]
        });
    }
}