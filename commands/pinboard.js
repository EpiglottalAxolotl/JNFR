const items = require('../data/items.json');
const storage = require('../util/storage.js');

// Get store inventory
let inventory = [];
let stock = [];
for (let i=0;i<5;i++) {
	// Add 5 random items
	let item = '';
	do {
		item = items[Math.floor(Math.random() * items.length)];
	}while (inventory.indexOf(item) != -1);
	inventory.push(item);
	stock.push(Math.floor(Math.random()*3)+1);
}

module.exports = {
	name: 'pinboard',
	aliases: [],
	cooldown: 5,
	description: 'Set up a pin board for your server! (Pins will only use the first attachment/embed in an image)',
	args:true,
	permissions:['MANAGE_MESSAGES'],
	usage:'setup <channel> <emoji> [min reacts] OR disable',
	guildOnly:true,
	execute(message, args) {

		// Get params
		const action = args[0].toLowerCase();
		const guild = message.guild;

		if (action == 'setup') {
			// Check for the right number of arguments
			if (args.length < 3) {
				return message.reply('I need more arguments than that, check usage!');
			}

			// Get channel
			if (!(args[1].startsWith('<#') && args[1].endsWith('>'))) {
				return message.reply(args[1] + ' is not a valid channel');
			}
			const channel = guild.channels.cache.get(args[1].slice(2,-1));
			if (!channel || channel.type != 'text') {
				message.reply('You must specify a text channel!');
			}

			const emoji = args[2];

			// Determine minimum reacts needed
			const minReacts = parseInt(args[3]) || 20;

			// Set properties
			let data = storage.guilddata.get(guild.id.toString(),'pinboard') || {enabled:true};

			data.channel = channel.id.toString();
			data.emoji = emoji;
			data.minReacts = minReacts;
			data.enabled = true;
			data.cache = [];

			storage.guilddata.put(guild.id.toString(),'pinboard',data);
			return message.reply(`Pin board established in <#${channel.id}>!`);
		
		}else if (action == 'disable') {

			// Set 'disabled' to true
			let data = storage.guilddata.get(guild.id.toString(),'pinboard') || {enabled:false};
			data.enabled = false;
			storage.guilddata.put(guild.id.toString(),'pinboard');

			return message.reply(`Pin board disabled`);
		}

	},
	// Now the important part: The actual listener
	listeners:{
		'messageReactionAdd': async(reaction, user) => {

			// When a reaction is received, check if the structure is partial
			if (reaction.partial) {
				// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
				try {
					await reaction.fetch();
				} catch (error) {
					console.error('Something went wrong when fetching the message: ', error);
					// Return as `reaction.message.author` may be undefined/null
					return;
				}
			}

			let pinboard = storage.guilddata.get(reaction.message.guild.id.toString(),'pinboard');
			if (pinboard && pinboard.enabled) {
				// Check for matching emoji
				if (reaction.emoji.name == pinboard.emoji) {
					// Check for channel conflict
					if (reaction.message.channel.id.toString() != pinboard.channel) {
						// Check for sufficient pins
						if (reaction.count >= pinboard.minReacts) {
							// Check if this message is cached
							if (pinboard.cache.indexOf(reaction.message.id.toString()) == -1) {
								
								// Let's find some media to pin
								let text = null;
								const message = reaction.message;
								// Try attachments
								if (message.attachments && message.attachments.size) {
									const attachment = message.attachments.first();
									text = attachment.url;
								// Try embeds
								}else if (message.embeds && message.embeds.length) {
									const embed = message.embeds[0];
									text = embed.url;
								}else{
									// Fuck it just get the text of the message
									text = `<@${message.author.id.toString()}> said...\n> `;
									if (message.cleanContent.length + text.length > 2000) {
										text += message.cleanContent.slice(0,2000-text.length-3) + '...';
									}else{
										text += message.cleanContent;
									}
								}

								// Post it!
								if (text) {
									const channel = message.guild.channels.cache.get(pinboard.channel);
									if (channel) {
										channel.send(text);

										// Reward the original sender with some jCoin
										if (!message.author.bot) {
											const author = message.author.id.toString();
											const bal = storage.userdata.get(author,'balance');
											storage.userdata.put(author,'balance',bal+10);
										}

										// Add the message to the cache so we don't do it again
										pinboard.cache.push(message.id.toString());
										storage.guilddata.put(reaction.message.guild.id.toString(),'pinboard',pinboard);
									}
								}

							}
						}

					}
				}
			}

		}
	}
}