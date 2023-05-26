<script>
	import Menu from './Menu.svelte';
	import MenuOption from './MenuOption.svelte';
	import MenuDivider from './MenuDivider.svelte';
	import { key, current } from './menu.js';
	import { _contextMenu } from '../stores.js';
	import { onMount, getContext } from 'svelte';
	import { tick } from 'svelte'
	
	import Icon from './Icon.svelte'
	
	// export let item;
	
	let pos = { x: 0, y: 0 };
	let showMenu = false;
	let data;
	_contextMenu.subscribe(value => {
		data = value;
		console.log('subscribe', data);
		// if
	});
	async function onRightClick(e) {
		// if (data) {
			showMenu = false;
			// _contextMenu.set({});
			// await new Promise(res => setTimeout(res, 100));
		// } else {
		
		pos = { x: e.clientX, y: e.clientY };
console.log('onRightClick', pos, data);
		showMenu = true;
		// }
	}
	
	function closeMenu() {
		data = undefined;
	}
	function clickOpt(ev) {
console.log('clickOpt', ev);
	}
</script>

{#if data}
	<Menu {...pos} {data} on:click={closeMenu} on:clickoutside={closeMenu} />

{/if}

<svelte:body on:contextmenu|preventDefault={onRightClick} />