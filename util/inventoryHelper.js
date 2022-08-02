import {nameToId} from '../data/items.js';

export function addItem(user,item,count) {
	count = count || 1;
	let slot = user.inventory.find(slot => slot.id===item.id);
	if (!slot) {
		slot = {id:item.id,count:0,owned:0,eaten:0,used:0};
		user.inventory.push(slot);
	}
	slot.count += count;
	slot.owned += count;
	
	return slot;
}

export function searchInventory(inventory,search) {

	const searchTerm = nameToId(search).replaceAll('_','');
	let results = [];
	for (const index in inventory) {
		const slot = inventory[index];
		if (slot.count > 0 || slot.owned > 0) {
			const index = slot.id.replaceAll('_','').indexOf(searchTerm);
			if (index < 2 && index >= 0) {
				results.push(slot);
			}
		}
	}
	return results;

}