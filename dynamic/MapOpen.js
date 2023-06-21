import MapOpen from '/viewer/MapOpen/MapOpen.svelte';

let mapOpen;
export const destroy = () => { if (mapOpen) mapOpen.$destroy(); }
export const show = (attr) => {
	if (!attr.width) attr.width = 500;
	destroy();
	mapOpen = new MapOpen({target: document.body, props: {attr}});
}
