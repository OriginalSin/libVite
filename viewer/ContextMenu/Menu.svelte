<script>
	import { onMount, setContext, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { key } from './menu.js';
	import MenuOption from './MenuOption.svelte';
	import MenuDivider from './MenuDivider.svelte';
	import Utils from '../Utils.js';

	export let data;
// console.log('item', data);
	
	let x;
	let y;
	// whenever x and y is changed, restrict box to be within bounds
	$: (() => {
		if (!menuEl) return;
		
		const rect = menuEl.getBoundingClientRect();
		x = Math.min(window.innerWidth - rect.width, x);
		if (y > window.innerHeight - rect.height) y -= rect.height;
	})(x, y);
	
	const dispatch = createEventDispatcher();	
	
	// setContext(key, {
		// dispatchClick: (ev) => {
// console.log('dispatchClick', key, ev);
			// dispatch('click')
		// }
	// });
	
	let map = L.gmx.gmxMap.leafletMap;
	let items;
	let menuEl;
	function onPageClick(e) {
// console.log('onPageClick', e.target);
		if (e.target === menuEl || menuEl.contains(e.target)) return;
		dispatch('clickoutside');
		items = undefined;
	}
	function selOp(it) {
console.log('selOp', it, data);
		if (!map._userInfo || !map._userInfo.UserID) {
			Utils.notification.view('Необходимо авторизоваться', 'warn');
			return;
		}
		items = undefined;
		if (it.fn) it.fn(it.cmd, data);
		else {
			switch(it.cmd) {
				case 'DownloadLayer':
					L.gmxUtil.layerHelper.downloadLayer({t: data.layerID});
					break;
				case 'addObjects':
					let params = {LayerName: data.layerID, FromLayer: data.FromLayer, Query: data.Query};
					L.gmxUtil.layerHelper.appendLayerData(params);
					break;
				case 'attr':
					map._showTableAttrs(data);
					break;
				case 'addObject':
					map._showEditObject(data);
				case 'props':
					map._showEditLayer(data);
					break;
			}
		}
	}
	onMount(() => {
		if (data) {
			items = data.items || key[data.key].items;
			x = data.x;
			y = data.y;
		}
		// console.log('the component has mounted');
	});

</script>

<svelte:body on:click={onPageClick} />

<div transition:fade={{ duration: 100 }} bind:this={menuEl} style="top: {y}px; left: {x}px;">
	{#each (items || []) as it, i}
		<MenuOption 
			on:click={() => {selOp(it);}} 
			text={it.text} />
	{/each}
</div>


<style>
	div {
		position: absolute;
		display: grid;
		border: 1px solid #0003;
		box-shadow: 2px 2px 5px 0px #0002;
		background: white;
		z-index: 1000;
	}
</style>
