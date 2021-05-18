const storage = require('../util/storage.js');
const {prefix} = require('../config.json');

module.exports = {
	name: 'wallet',
	aliases: ['coin','balance'],
	cooldown: 3,
	description: 'View the balance of your jCoin wallet. Earn jCoins by chatting! Coins generated by selling your personal message data || (not really) ||',
	args:false,
	usage:'',
	guildOnly:false,
	execute(message, args) {	
		const user = message.author.id.toString();
		const bal = storage.userdata.get(user,'balance') || 0;
		
		message.reply(`You have ${bal} jCoins!`);
	},
	listeners:{
		'message':function(message) {
			// Ignore certain messages
			if (message.author.bot || message.content.startsWith(prefix)) return;

			// Give em a coin
			const user = message.author.id.toString();
			const balance = storage.userdata.get(user,'balance') || 0;
			storage.userdata.put(user,'balance',balance+1);
		}
	}
}