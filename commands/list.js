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

    let printString = getGearListString(arr);
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('List of members sorted by gearscore')
        .setDescription(printString);
    interaction.reply({
        embeds: [embed]
    });
}

const getGearListString = function (gearList) {
    if (gearList.length === 0) return " ";
    let col1 = 0;
    let col2 = 0;
    const col3 = 5;
    const col4 = 5;
    //Name, class, gearscore, level, updated since
    for (const element of gearList) {
        if (element.name.length > col1) col1 = element.name.length;
        if (element.lclass.length > col2) col2 = element.lclass.length;
    }
    return getGrid(gearList, col1 + 1, col2 + 2, col3, col4);
}

const getGrid = function (gearList, col1, col2, col3, col4) {
    let str = [];
    const present = new Date();
    const dash = "-";
    const ldivider = dash.repeat(col1) + "+" + dash.repeat(col2) + "+" + dash.repeat(col3) + "+" + dash.repeat(col4) + "+" + dash.repeat(14);
    const divider = "";
    for (let i = 0; i < gearList.length; i++) {
        let name = gearList[i].name + getSpaces(col1 - gearList[i].name.length);
        let lclass = " " + gearList[i].lclass.charAt(0).toUpperCase() + gearList[i].lclass.substring(1) + getSpaces(col2 - gearList[i].lclass.length - 1);
        let gearscore = " " + gearList[i].gearscore + getSpaces(col3 - 3 - 1);
        let level = " " + gearList[i].level + getSpaces(col4 - 2 - 1);
        let updatedAt = "";
        if (gearList[i].updatedAt != null) {
            updatedAt = " " + ((present - new Date(gearList[i].updatedAt)) / (1000 * 60 * 60 * 24)).toFixed(0) + " Days ago\n";
        } else updatedAt = " 0 Days ago\n";
        str[i] = name + lclass + gearscore + level + updatedAt + divider;
    }
    let finalString = "```css\n" + "Name" + getSpaces(col1 - 4) + " Class" + getSpaces(col2 - 6) + " GS" + getSpaces(col3 - 3) + " Lvl " + getSpaces(0) + " Last updated  \n";
    finalString += ldivider + "\n" + str.join("") + "```";
    return finalString;

}

const getSpaces = function (i) {
    if (i < 0) i = 0;
    const space = " ";
    return space.repeat(i) + "|";
}