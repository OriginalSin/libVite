<script>
	import { onMount, setContext, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { key } from './menu.js';
	import MenuOption from './MenuOption.svelte';
	import MenuDivider from './MenuDivider.svelte';

	export let data;
console.log('item', data);
	
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
	
	let items;
	let menuEl;
	function onPageClick(e) {
console.log('onPageClick', e.target);
		if (e.target === menuEl || menuEl.contains(e.target)) return;
		dispatch('clickoutside');
		items = undefined;
	}
	function selOp(it) {
console.log('selOp', it, data);
		items = undefined;
		switch(it.cmd) {
			case 'DownloadLayer':
				L.gmxUtil.sendCrossDomainPostRequest('https://maps.kosmosnimki.ru/DownloadLayer.ashx', {t: data.layerID});
				// const fd = new FormData();
				// fd.append('t', data.layerID);
				// return fetch('https://maps.kosmosnimki.ru/DownloadLayer.ashx', {
					// method: 'POST', mode: 'cors', credentials: 'include', body: fd
				// });
				break;
			case 'attr':
				L.gmx.gmxMap.leafletMap._showTableAttrs(data);
				break;
		}
		// else {
		// }
	}
	onMount(() => {
		if (data) {
			items = key[data.key].items;
			x = data.x;
			y = data.y;
		}
		console.log('the component has mounted');
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
		z-index: 400;
	}
</style>
