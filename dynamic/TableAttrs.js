import TableAttrs from '/viewer/TableAttrs/Table.svelte'

let tableAttrs = {};
export const destroy = (layerID) => {
	if (tableAttrs[layerID]) tableAttrs[layerID].$destroy();
}
export const show = (data) => {
	const layerID = data.layerID;
	destroy(layerID);
	tableAttrs[layerID] = new TableAttrs({
		target: document.body,
		  props: {
			  layerID
		 } 
	});
}
