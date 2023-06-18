import EditLayer from '../EditLayer/EditLayer.svelte';

let editLayers = {};
export const destroyEditLayer = (layerID) => { if (editLayers[layerID]) editLayers[layerID].$destroy(); }
export const showEditLayer = (attr) => {
	const {layerID} = attr;
	if (!attr.width) attr.width = 380;
	destroyEditLayer(layerID);
	editLayers[layerID] = new EditLayer({target: document.body, props: {attr}});
}
