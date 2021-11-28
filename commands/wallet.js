const storage = require('../util/storage.js');
const {prefix} = require('../config.json');
const Text = require('../util/text.js');

const countingRegexp = /RUINED IT AT \*\*(\d+)\*\*!!/g;

module.exports = {
	name: 'wallet',
	aliases: ['coin','balance'],
	cooldown: 3,
	description: 'View the balance of your Jallet (Jollar Wallet). Earn jCoins by chatting! Coins generated by selling your personal message data || (not really) ||',
	args:false,
	usage:'',
	guildOnly:false,
	execute(message, args) {	
		const user = message.author.id.toString();
		const bal = storage.userdata.get(user,'balance') || 0;
		
		message.reply(`You have ${bal} ${Text.getJollarSign(message.guild)} !`);
	},
	listeners:{
		'message':function(message) {

			// Check for counting bot
			if (message.author.id == '510016054391734273') {
				// Check if it's a 'failed' message
				const matches = message.content.matchAll(countingRegexp);
				for (const match of matches) {
					const number = parseInt(match[1]);
					if (number != NaN) {
						// find user
						const user = message.mentions.users.first();
						// reward them
						const id = user.id.toString();
						const balance = storage.userdata.get(id,'balance') || 0;
						storage.userdata.put(id,'balance',balance+number);

						return message.channel.send(`Oops! What a shame - ${user.username} gets ${number} ${Text.getJollarSign(message.guild)} for breaking the chain!`);
					}
				}
			}

			// Ignore certain messages
			if (message.author.bot || message.content.startsWith(prefix)) return;

			// Give em a coin
			const user = message.author.id.toString();
			const balance = storage.userdata.get(user,'balance') || 0;
			storage.userdata.put(user,'balance',balance+1);
		}
	}
}