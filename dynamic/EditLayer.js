import EditLayer from '/viewer/EditLayer/EditLayer.svelte';

let editLayers = {};
export const destroy = (layerID) => { if (editLayers[layerID]) editLayers[layerID].$destroy(); }
export const show = (attr) => {
	const {layerID} = attr;
	if (!attr.width) attr.width = 380;
	destroy(layerID);
	editLayers[layerID] = new EditLayer({target: document.body, props: {attr}});
}
