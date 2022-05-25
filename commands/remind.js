const {
    SlashCommandBuilder
} = require("@discordjs/builders");
const User = require("./../models/user");
const CustomEvent = require("./../models/customevent");
const {
    execute
} = require("./add");
const {
    MessageEmbed,
    Message
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("Delete a user from database")
        .addSubcommand(subcommand =>
            subcommand
            .setName("user")
            .setDescription("Name of the user you want to delete")
            .addUserOption(option =>
                option
                .setName("member")
                .setDescription("Member to remind")
                .setRequired(true))
            .addStringOption(option =>
                option
                .setName("eventid")
                .setDescription("Id of the event you want to remind the user of!")
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName("all")
            .setDescription("Send a reminder to all members for event")
            .addStringOption(option =>
                option
                .setName("eventid")
                .setDescription("Id of the event you want to send a reminder about")
                .setRequired(true))),

    async execute(interaction, client) {
        const adminroles = process.env.ADMIN_ROLES.split(" ");
        if (adminroles.some(r => interaction.member.roles.cache.has(r))) {
            if (interaction.options.getSubcommand() === "all") {
                await remindAll(interaction, client);
            } else if (interaction.options.getSubcommand() === "user") {
                await remindOne(interaction);
            }
        } else {
            interaction.reply("Missing permissions!");
        }
    }
}

const remindAll = async function (interaction, client) {
    const eventid = interaction.options.getString("eventid");
    const event = await CustomEvent.findOne({
        eventid: eventid
    }).then(res => {
        return res;
    }).catch(_err => {
        return null;
    })
    if (event == null) {
        interaction.reply({
            content: "No event with the given id was found!",
            ephemeral: true
        });
        return;
    }

    const members = await User.find().catch(err => console.log(err));
    if (members == null || members.length == 0) {
        interaction.reply({
            content: "No members found",
            ephemeral: true
        });
        return;
    }

    const remindList = members.filter(x => !event.attendees.some(e => e.userid == x.userid));

    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle("You've yet to sign up to " + event.name)
        .setDescription("Please inform us of your attendace, event can be found from #cw-attendance");

    let unableToSend = []
    interaction.reply({
        content: "Sending out reminders...",
        ephemeral: false
    });
    for (const member of remindList) {
        const response = await sendDM(member, embed, client, interaction);
        if (!response) {
            unableToSend.push(member.name);
        }
    }

    if (remindList.size != 0) {
        const missingUsersString = "\n```\n" + unableToSend.join("\n") + "```";
        const replyEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle("Reminders sent to " + (remindList.length - unableToSend.length) + " out of " + remindList.length + " members")
            .setDescription("List of users who weren't able to recieve a reminder" + missingUsersString);
        await interaction.editReply({
            content: "Missing reminders...",
            embeds: [replyEmbed],
            ephemeral: false
        });
    } else {
        await interaction.editReply({
            content: "Successfully sent out reminders to " + remindList.length + " members!",
            ephemeral: false
        });
    }

}

const remindOne = async function (interaction) {
    const eventid = interaction.options.getString("eventid");
    const event = await CustomEvent.findOne({
        eventid: eventid
    }).catch(e => {
        console.error(e);
    });
    if (event == null) {
        interaction.reply({
            content: "Event with the given id was not found!",
            ephemeral: true
        });
        return;
    }
    const user = interaction.options.getUser("member");
    if (event.attendees.some(e => e.userid == user.id)) {
        interaction.reply({
            content: "User has already marked their attendance for the event!",
            ephemeral: true
        });
        return;
    }
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle("You've yet to mark your attendance to " + event.name)
        .setDescription("Please inform us of your attendace, event can be found from #cw-attendance");
    try {
        user.send({
            embeds: [embed]
        })
    } catch (error) {
        interaction.reply({
            content: "Unable to send reminder",
            ephemeral: true
        });
    }
    interaction.reply({
        content: "Successfully sent out the reminder!",
        ephemeral: true
    });
}

const sendDM = async function (user, embed, client, interaction) {
    let member = await timeout(2000, interaction.guild.members.fetch(user.userid)).then(res =>{
        return res;
    }).catch(() => null);
    if (member == null) {
        member = await timeout(2000, client.users.fetch(user.userid)).then(res =>{
            return res;
        }).catch(() => null);
        if (member == null) {
            return false;
        }
    }

    return member.send({
        embeds: [embed]
    }).then(() => {
        return true;
    }).catch(err => {
        console.log(err);
        return false;
    });
}

const timeout = function(ms, promise) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('TIMEOUT'))
      }, ms)
  
      promise
        .then(value => {
          clearTimeout(timer)
          resolve(value)
        })
        .catch(reason => {
          clearTimeout(timer)
          reject(reason)
        })
    })
  }