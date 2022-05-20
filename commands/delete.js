const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Delete a user from database")
        .addStringOption(option =>
            option
            .setName("user")
            .setDescription("Name of the user you want to delete")
            .setRequired(true)),

    async execute(interaction) {
        const adminroles = process.env.ADMIN_ROLES.split(" ");
        if (adminroles.some( r => interaction.member.roles.cache.has(r))) {
            await deleteUser(interaction);
        } else {
            interaction.reply("Missing permissions!");
        }
    }
}

const deleteUser = async function (interaction){
    let u = interaction.options.getString("user");
    await User.deleteOne({name: u}).then((result) =>{
        if(result.deletedCount == 1){
            interaction.reply("Deleted user: " + u);
        }else{
            interaction.reply("Couldn't find user " + u);
        }

    }).catch((err) =>{
        console.log(err);
    })
}