const fs = require('fs');

const Discord = require('discord.js');
var cron = require("cron");
const client = new Discord.Client();

const ytdl = require("ytdl-core");
const queue = new Map();
const dotenv = require('dotenv');
dotenv.config();
const yts = require( 'yt-search' )

const { prefix, swearWords, motivational, memery, phrases, eightBall } = require('./config.json');

client.commands = new Discord.Collection();





client.on('ready', () => {
	console.log('Ready!');
    client.user.setActivity(`Type ${prefix}Help to get some help, because you know you need it`);
});


var recordChannel;
var announceChannel;
var dayOfWeek;
var msg;
var polling = false;
const recordUsers = [];
const recordNums = [];
const dailyevents = [];
const voters = [0, 0, 0, 0];
const alreadyPolled = [];

client.on('message', message => {
    //if the message is from the bot exit
    if (message.author.bot) return;
	// private dms people
    /*
	const user = client.users.cache.get(message.author.id);
	user.send("hi");
	*/
    //find channel and send to specific channel
	/*
	const channel = client.channels.cache.get(message.author.id);
	channel.send('content');
	*/
    
        
    
      
    const stuff = swearWords.length;
    

    for (var i = 0; i < stuff; i++) {
        const stuffer = message.content.split(' ');
		if (stuffer.includes(swearWords[i])) {
			swearingUser = message.author.username
			message.delete();
			message.reply('Explicit language is not tolerated in this server.');
            if (!recordUsers.includes(swearingUser)) {
                recordUsers.push(swearingUser);
				recordNums.push(0);
        	}
			recordNums[recordUsers.indexOf(swearingUser)]++;
			break;
		}
	}
    console.log(message.content);


    //If the message doesn't start with prefix it exits 
    if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
    const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.map(x => x.toLowerCase());
    

    //commands
    if (message.content.includes(`${prefix}`)) {
        if (Math.floor(Math.random() * 100) < 1) {
            message.channel.send(phrases[Math.floor(Math.random() * 6)]);
            return;
        }
    }
    
    

    //MUSIC COMMANDS
    const serverQueue = queue.get(message.guild.id);
    
    if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	} else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	} 
    
    //POLLING
    
    
    //MOTIVATION
    else if (command == "motivation") {       
        message.channel.send(motivational[Math.floor(Math.random() * 25)]);
    }


    //MEMES
    else if (command == "memes") {       
        message.channel.send(memery[Math.floor(Math.random() * 20)]);
    } 


    //CHANNEL SETTERS
	else if (command[0] == "set") {
		if (command[1] == "records") {
			recordChannel = client.channels.cache.get(message.channel.id);
			recordChannel.send('Record Channel set!');
        } else if(command[1] == "announcements") {
            announceChannel = client.channels.cache.get(message.channel.id);
			announceChannel.send('Announcements Channel set!');
        }
	}
    
    /*
    if (command == "set") {
		recordChannel = client.channels.cache.get(message.channel.id);
		recordChannel.send('Channel set!');
	}*/


    //RECORD CHANNEL EVENTS
	else if (command == "records") {
		try {
			recordChannel.send("Swear word wall of shame:");
			for(var i = 0; i < recordUsers.length; i++) {
				recordChannel.send(recordUsers[i]+", "+recordNums[i]);
			}
		} catch {
			message.channel.send('Records channel has not been set or has been deleted!');
		}
	}
    
    //TIME COMMANDS
	/*if (command[0] == "time" || command[0] == "daily") {
		const commander = command.map(x => x);
        function testTime() {
			const commanderHold = commander.map(x => x)
            for(var q = 0; q < 4; q++) {
				commander.shift();
			}
			announceChannel.send(commander.join(" "));
			if (commanderHold[0] == 'time') {
				a1.stop();
			}
		}
		let a1 = new cron.CronJob(commander[3]+" "+commander[2]+" "+commander[1]+" * * *", testTime);
		a1.start();
		message.channel.send("Announcement set at "+commander[1]+":"+commander[2]+":"+commander[3]);
	}*/
    
    testAnnounce: if (command[0] == "announce") {
        if (announceChannel == undefined) {
            message.channel.send(`You must specify an announcements channel, you can do this by typing ${prefix}set announcements in the desired channel.`)
            break testAnnounce;
        }
		const announcementName = command[1];
		const commander = command.map(x => x);
        function testTime() {
			const commanderHold = commander.map(x => x)
            for(var q = 0; q < 6; q++) {
				commander.shift();
			}
            try {
                announceChannel.send(commander.join(" "));
            } catch {
                message.channel.send(`You must specify an announcements channel, you can do this by typing ${prefix}set announcements in the desired channel.`)
            }
			if (commanderHold[1] == "once") {
				a1.stop();
			}
		}
		var dayOfWeek = "*";
		if (commander[1] == "once" || commander[1] == "daily") {
			dayOfWeek = commander[2].split(" ").join(",");
		}
		let a1 = new cron.CronJob(commander[5]+" "+commander[4]+" "+commander[3]+" * * "+dayOfWeek, testTime);
		a1.start();
		message.channel.send("Announcement set at "+commander[3]+":"+commander[4]+":"+commander[5]);
	}
    /*
    if (
    } 
    */
    
    
    //8BALL 
    else if (command[0] == '8ball') {
        message.react('🎱')
        if (command[1] == undefined) {
            message.reply('Ask a question and come back.')
        } else if (command[command.length - 1].includes(`${prefix}`)) {
            message.reply(':8ball: ' + eightBall[Math.floor(Math.random() * 8)]);
        } else { 
        message.reply('Please enter a question');    
        }
    }

    //DATE 
	else if (command[0] == "date") {
		message.channel.send(Date());
	}

    //HELP
    else if (command[0] == 'help') {
        if (command[1] == undefined) {
            message.channel.send(`Commands:\nmotivation, memes, 8ball, play, skip, stop, set records, records, set announcements, announce (once, daily, weekly) date\n\nPlease enter "${prefix}help <command name>" to get specific details.`);
        } else if (command[1] == 'motivation') {
            message.channel.send({
                embed: {"title": "This sends you motivational pictures",
                "description": "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown. ```\nyes, even code blocks```",
                "url": "https://discordapp.com",
                "color": 4493432,
                "timestamp": "2021-05-23T04:23:14.687Z",
                "footer": {
                  "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
                  "text": "footer text"
                }
        }
    })
}
        else if (command[1] == 'memes') {
            message.channel.send('Use this command to send a wide variety of memes')
        }
        else if (command[1] == '8ball') {
            message.channel.send('Ask a question to the 8ball and get an answer')
        }
        else if (command[1] == 'play') {
            message.channel.send(`Enter "${prefix}play <youtube-url-here>" OR "${prefix}play <song name>" while in an voice channel, to play the audio from the video in the Voice Channel`)
        }
        else if (command[1] == 'skip') {
            message.channel.send('Skips the current song in the queue.')
        }
        else if (command[1] == 'stop') {
            message.channel.send('Makes the bot leave the voice channel and stop playing music.')
        }
        else if (command[1] == 'set' && command[2] == 'records') {
            message.channel.send('Set a channel for the bot to send its record logs too')
        }
        else if (command[1] == 'records') {
                message.channel.send('Have the bot send the records of users and their warnings to the set records channel')
        }
        else if (command[1] == 'set'  && command[2] == 'announcements') {
            message.channel.send('Sets the announcements channel')
        }
        else if (command[1] == 'date') {
            message.channel.send('Sends the current date')
        }
        else if (command [1] == 'announce') {
            if (command [2] == undefined) {
                message.channel.send('which announce would you like help with, once, daily, weekly?')
            }
            else if (command[2] == 'once') {
                message.channel.send(`Send an announcement to the announcements channel at a certain time, e.g. ${prefix}announce announcementname once hour minuite second message, EX. ${prefix}announce name once 18 22 00 hello\nThis will print an announcement set at 18 22 00 that says hello`)
            }
            else if (command[2] == 'daily') {
                message.channel.send(`Sends a daily announcement to the announcements channel at the set time e.g. ${prefix}announce announcementname daily hour minuite second message, EX. ${prefix}announce name daily 18 22 00 hello\nThis will print an daily announcement set at 18 22 00 that says hello`)
            }
            else if (command[2] == 'weekly') {
                message.channel.send(`Sends a daily announcement to the announcements channel at the set time e.g. ${prefix}announce announcementname daynumber (Monday 1, Tuesday 2, ... Sunday 7) hour minuite second message, EX. ${prefix}announce name 6 18 22 00 hello\nThis will print an announcement every Saturday set at 18 22 00 that says hello`)
            }
        }
       
    }
});

/*else if (command[0] == "poll") {
    const commandore = command;
    const ups = 0;
    const downs = 0;
    command.shift();
    const menaga = message.channel.send(command);
    const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
    };

    
    console.log(user);
    console.log(reaction);
    if (!alreadyPolled.includes(user)) {
        if (reaction.emoji.name === '👍') {
            ups++;
            alreadyPolled.push(user);
            console.log(ups);
        } else if (reaction.emoji.name === '👎') {
            downs++;
            alreadyPolled.push(user);
            console.log(downs);            }
        }
    } else {
        user.send("Don't do that again. You've been warned.");        
    }
message.reactions.removeAll();
menaga.edit(command + "\nfor: " + str(ups) + "\nagainst: " + str(downs));  */

var urla;
async function execute(message, serverQueue) {
    const secondArgs = message.content.split(" ");
    secondArgs.shift();
    
    /*const angus = message.content.slice(prefix.length).trim().split(' ');
	const cordor = angus.map(x => x.toLowerCase());*/

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }

    const r = await yts(secondArgs.join(' ') );
    
    const videos = r.videos.slice( 0, 1 );
    videos.forEach( function ( v ) {
	urla = v.url;
    });
    
    const songInfo = await ytdl.getInfo(urla);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };


    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
    /*
    if (cordor[0] == "poll") {
        const polaroid = condor.shift();
        if (polaroid.map(x => x.toLowerCase()) == "end") {    
            polling = false;
            message.channel.send("Current poll has ended.");
        } else {
        msg = await message.channel.send(polaroid + "\nplease private dm me with your response in the form '?vote A, B, C, etc.'");
            polling = true;
        }
    }
    else if (cordor[0] == "vote") {
        const person = message.author.id;
        if (polling == true) { 
            if (alreadyPolled.includes(person)) {
                person.send("I'm sorry, but you've already voted.");
            } else if (cordor[1].map(x => x.toLowerCase()) == "a") {
                voters[0] += 1;
                alreadyPolled.push(person);
                msg.edit(polaroid + "\nA:" + voters[0] + "\nB:" + voters[1] + "\nC:" + voters[2] + "\nD:" + voters[3]);
                message.channel.send("Vote received!");
            } else if (cordor[1].map(x => x.toLowerCase()) == "b") {
                voters[1] += 1;
                alreadyPolled.push(person);
                msg.edit(polaroid + "\nA:" + voters[0] + "\nB:" + voters[1] + "\nC:" + voters[2] + "\nD:" + voters[3]);
                message.channel.send("Vote received!");
            } else if (cordor[1].map(x => x.toLowerCase()) == "c") {
                voters[2] += 1;
                alreadyPolled.push(person);
                msg.edit(polaroid + "\nA:" + voters[0] + "\nB:" + voters[1] + "\nC:" + voters[2] + "\nD:" + voters[3]);
                message.channel.send("Vote received!");
            } else if (cordor[1].map(x => x.toLowerCase()) == "d") {
                voters[3] += 1;
                alreadyPolled.push(person);
                msg.edit(polaroid + "\nA:" + voters[0] + "\nB:" + voters[1] + "\nC:" + voters[2] + "\nD:" + voters[3]);
                message.channel.send("Vote received!");
            } else {
                person.send("I'm sorry, that's not one of the options.");
            }
        } else {
            person.send("There are no polls currently active.");
        }
    } */
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );

    if (!serverQueue)
        return message.channel.send("There is no song that I could stop!");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}** ${urla}`);
    
}


client.login(process.env.TOKEN);