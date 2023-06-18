import EditObject from '/viewer/EditObject/EditObject.svelte';

let editObjects = {};
export const destroy = (key) => { if (editObjects[key]) editObjects[key].$destroy(); }
export const show = (attr) => {
	const {layerID, id} = attr;
	const key = id + '_' + layerID;
	if (!attr.width) attr.width = 380;
	destroy(key);
	editObjects[key] = new EditObject({target: document.body, props: {attr}});
}
