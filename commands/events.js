const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const {
    execute
} = require("./add");
const {
    MessageEmbed
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("events")
        .setDescription("Retrieve a list of events and their attendees.")
        .addSubcommand(subcommand =>
            subcommand
            .setName("attending")
            .setDescription("Returns a list of attending members"))
        .addSubcommand(subcommand =>
            subcommand
            .setName("missing")
            .setDescription("Retruns a list of missing attendees.")),
    async execute(interaction) {
        const adminroles = process.env.ADMIN_ROLES.split(" ");
        if (adminroles.some(r => interaction.member.roles.cache.has(r))) {
            await showEvents(interaction, interaction.options.getSubcommand() === "missing");
        } else {
            interaction.reply("Missing permissions!");
        }
    }
}

const showEvents = async function (interaction, missing) {
    await interaction.guild.scheduledEvents.fetch().then(
        async (result) => {
            if (result != null && result.size > 0) {
                interaction.deferReply();
                let memberArr = null;
                if (missing) memberArr = await User.find().exec().catch(err =>
                    console.error(err));
                if (memberArr == null && missing) {
                    interaction.reply("Database error!");
                    return;
                }
                result.forEach(async (e) => {
                    let attendingUsers = [];
                    let fallback = [];
                    await interaction.guild.scheduledEvents.fetchSubscribers(e).then((users) => {
                        users.forEach((eventUser => {
                            fallback.push({
                                userid: eventUser.user.id,
                                username: eventUser.user.username
                            });
                            attendingUsers.push(eventUser.user);
                        }))
                    })
                    let printString = "";
                    let title = "";
                    if (missing) {
                        printString = getGearListString(retrieveMissingUsers(fallback, memberArr));
                        title = e.name + " - Missing attendees";
                    } else {
                        console.log("jere");
                        printString = getGearListString(await retrieveUsers(attendingUsers, fallback));
                        title = e.name + " - Attending users: " + attendingUsers.length;
                    }
                    const embed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(title)
                        .setDescription(printString);
                    interaction.channel.send({
                        embeds: [embed]
                    });
                    interaction.editReply("Found " + result.size + " events!");
                })
            } else {
                interaction.reply("No events found!");
            }
        }
    )
}

let retrieveMissingUsers = function (users, memberArr) {
    try {
        const arr = memberArr.filter(x => !users.some(e => e.userid == x.userid));
        return arr;
    } catch (e) {
        console.log(e);
        return [];
    }


}

let retrieveUsers = async function (users, arr) {
    try {
        let gearList = await User.find({
            userid: {
                $in: users
            }
        });
        let nonFound = arr.filter(x => !gearList.some(e => e.userid == x.userid));
        nonFound.forEach((u) => {
            gearList.push(new User({
                userid: u.userid,
                name: u.username,
                gearscore: 100,
                lclass: "?",
                level: 10
            }));
        });
        return gearList;
    } catch (e) {
        console.log(e);
        return [];
    }
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