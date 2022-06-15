const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("Print out a list of members")
        .addSubcommand(subcommand =>
            subcommand
            .setName("gearscore")
            .setDescription("Update your gearscore")
            .addIntegerOption(option =>
                option
                .setName("ilevel")
                .setDescription("Item level")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("level")
            .setDescription("Update your level")
            .addIntegerOption(option =>
                option
                .setName("lvl")
                .setDescription("Character level")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("name")
            .setDescription("Update your name")
            .addStringOption(option =>
                option
                .setName("charname")
                .setDescription("Character name")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("class")
            .setDescription("Update your class")
            .addStringOption(option =>
                option
                .setName("charclass")
                .setDescription("Character class")
                .setRequired(true))),

    async execute(interaction) {
        let cmd = interaction.options.getSubcommand();
        switch (cmd) {
            case "gearscore":
                await updateGear(interaction);
                break;
            case "level":
                await updateLevel(interaction);
                break;
            case "name":
                await updateName(interaction);
                break;
            case "class":
                await updateClass(interaction);
                break;
        }
    }
}

const updateGear = async function (interaction) {
    let gs = interaction.options.getInteger("ilevel");

    if (gs < 9999 && gs > 0) {
        await User.updateOne({
            userid: interaction.user.id
        }, {
            $set: {
                'gearscore': gs
            }
        }).then((result) => {
            if (result.matchedCount == 1 && result.modifiedCount == 1) {
                interaction.reply("Successfully updated gearscore to " + gs + "!");
            } else if (result.matchedCount == 1 && result.modifiedCount == 0) {
                interaction.reply("Something went wrong!");
            } else {
                interaction.reply("Please add your gear first by typing !add");
            }
        }).catch((err) => {
            console.log(err);
            interaction.reply("Database error!");
        });
    } else {
        interaction.reply("Incorrect values");
    }
}



const updateLevel = async function (interaction) {
    let level = interaction.options.getInteger("lvl");

    if (level < 999 && level > 0) {
        await User.updateOne({
            userid: interaction.user.id
        }, {
            $set: {
                'level': level
            }
        }).then((result) => {
            if (result.matchedCount == 1 && result.modifiedCount == 1) {
                interaction.reply("Successfully updated Level to " + level + "!");
            } else if (result.matchedCount == 1 && result.modifiedCount == 0) {
                interaction.reply("Something went wrong!");
            } else {
                interaction.reply("Please add your gear first by using command /add gear");
            }
        }).catch((err) => {
            console.log(err);
            interaction.reply("Database error!");
        });
    } else {
        interaction.reply("Incorrect values");
    }
}



const updateName = async function (interaction) {
    let iname = interaction.options.getString("charname");
    if (iname.match("^([a-zA-Z]{1,20})$")) {
        await User.updateOne({
            userid: interaction.user.id
        }, {
            $set: {
                'name': iname,
                'lname': iname.toLowerCase()
            }
        }).then((result) => {
            if (result.matchedCount == 1 && result.modifiedCount == 1) {
                interaction.reply("Successfully updated username to " + iname + "!");
            } else if (result.matchedCount == 1 && result.modifiedCount == 0) {
                interaction.reply("Something went wrong!");
            } else {
                interaction.reply("Please add your gear first by using command /add gear");
            }
        }).catch((err) => {
            console.log(err);
            interaction.reply("Database error!");
        });
    } else {
        interaction.reply("Incorrect values");
    }
}



const updateClass = async function (interaction) {
    let iclass = interaction.options.getString("charclass");

    if (iclass.match("^([a-zA-Z]{1,20})$")) {
        await User.updateOne({
            userid: interaction.user.id
        }, {
            $set: {
                'class': iclass,
                'lclass': iclass.toLowerCase()
            }
        }).then((result) => {
            if (result.matchedCount == 1 && result.modifiedCount == 1) {
                interaction.reply("Successfully updated Class to " + iclass + "!");
            } else if (result.matchedCount == 1 && result.modifiedCount == 0) {
                interaction.reply("Something went wrong!");
            } else {
                interaction.reply("Please add your gear first by using command /add gear");
            }
        }).catch((err) => {
            console.log(err);
            interaction.reply("Database error!");
        });
    } else {
        interaction.reply("Incorrect values");
    }
}