import Database, {db} from '../util/db.js';
import Babbler from '../util/babbler.js';

export default {
	name: 'wallet',
	aliases: ['jollars','balance','money'],
	description: 'View the balance of your Jallet (Jollar Wallet). Earn jCoins by chatting!',
	args:null,
	guildOnly:false,
	execute(message, args) {	
		const userId = message.author.id.toString();
		const bal = Database.getUser(userId).balance;
		
		message.reply(`You have ${bal} ${Babbler.getJollarSign(message.guild)} !`);
	},
	listeners:{
		'messageCreate':function(message) {

			// Ignore certain messages
			if (message.author.bot || message.content.startsWith('j!')) return;

			// Give em a coin
			const userId = message.author.id.toString();
			if (!db.data.users[userId]) {
				Database.getUser(userId);
			}
			db.data.users[userId].balance += 1;
			Database.scheduleWrite();
		}
	}
}