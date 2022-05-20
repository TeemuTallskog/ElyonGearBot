const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("../models/user");
const {
    MessageEmbed
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("inspect")
        .setDescription("Inspect gear.")
        .addUserOption(option =>
            option
            .setName("user")
            .setDescription("Name of the user you want to inspect.")
            .setRequired(false)),

    async execute(interaction) {
        await inspect(interaction);
    }
}

const inspect = async function (interaction) {
    let member = interaction.options.getUser("user");
    let targeted = true;
    if (member === null) {
        member = interaction.user;
        targeted = false;
    }
    const userdata = await User.findOne({
        userid: member.id
    }).then(result => {
        if(result === null) return result;
        if (result.length < 1) {
            return null;
        }
        return result;
    }).catch(err => {
        console.log(err);
        interaction.reply("Database error!");
        return null;
    });

    if (userdata !== null) {
        printGear(member, userdata, interaction);
        return;
    }

    if (targeted) interaction.reply("The member you are looking for doesn't have their gear added!");
    else interaction.reply("Please add your gear first by using command /add gear");

}


let printGear = function (member, resultArr, interaction) {
    if (member !== undefined) {
        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setAuthor({
                name: member.username,
                iconURL: member.avatarURL()
            })
            .setFields({
                name: resultArr.lclass + " " + resultArr.level,
                value: "ilvl: " + resultArr.gearscore
            });
        if (resultArr.link != null) {
            embed.setImage(resultArr.link);
        }
        interaction.reply({
            embeds: [embed]
        });
    } else {
        const embed = new MessageEmbed()
            .setColor("#0099ff")
            .setAuthor({
                name: resultArr.name
            })
            .setFields({
                name: resultArr.lclass + " " + resultArr.level,
                value: "Gearscore: " + resultArr.gearscore
            });
        if (resultArr.link != null) {
            embed.setImage(resultArr.link);
        }
        interaction.reply({
            embeds: [embed]
        });
    }
}