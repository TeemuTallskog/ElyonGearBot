const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");
const {MessageEmbed} = require("discord.js");
const listPrinter = require("../functions/listPrinter");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("list")
        .setDescription("Print out a list of members")
        .addStringOption(option =>
            option
            .setName("class")
            .setDescription("Filter by class")
            .setRequired(false)),

    async execute(interaction) {
        await fetchData(interaction);
    }
}

const fetchData = async function (interaction) {
    let iclass = interaction.options.getString("class");
    if (iclass != undefined) {
        if (iclass.match("^([a-zA-Z]{1,20})$")) {
            await User.find({
                lclass: iclass.toLowerCase()
            }).then((result) => {
                postList(result, interaction);
            }).catch((err) => {
                console.log(err)
            })
        } else {
            interaction.reply("Incorrect value!");
            return
        }
    } else {
        User.find().then((result) => {
            postList(result, interaction);
        }).catch((err) => {
            console.log(err)
        });
    }
}

const postList = function (arr, interaction) {
    if (arr.length != 0) {
        if (arr.length != 1) {
            arr.sort(function (a, b) {
                return b.gearscore - a.gearscore;
            });
        }
    } else {
        interaction.reply("Oops seems like there's no data...");
        return
    }

    let printString = listPrinter.getPrintString(arr);
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('List of members sorted by gearscore')
        .setDescription(printString);
    interaction.reply({
        embeds: [embed]
    });
}