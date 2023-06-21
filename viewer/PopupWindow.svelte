<script>
import Draggable from './Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
// import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from './Utils.js';

export let attr = {};
// export let onSelect = null;

let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let {layerID, height, width} = attr;
let contNode;
let closeIcon = L.gmxUtil.setSVGIcon('close');

const closeMe = () => {
	map._popupWindow.$destroy();
};
const save = () => {
console.log('attributes', contNode);
	if (attr.buttons[0].onClick) {
		attr.buttons[0].onClick(Object.values(contNode.getElementsByTagName('input')));
	}
		// import { createEventDispatcher } from 'svelte';

	// const dispatch = createEventDispatcher();
	// closeMe();

};

console.log('attributes', width, attr);

</script>

<Draggable {width} {height}>

<div class="PopupWindow" bind:this={contNode}>
	<div class="header"> 
		<span class="title">{attr.title}: </span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div class="body scrollbar">
				{#each (attr.inputs || []) as it, i}
				{@const auto = it.autofocus ? 'autofocus onfocus="this.select()"':''}
		{#if it.autofocus}
			<input name={it.name || ''} value={it.val || ''} autofocus onfocus="this.select()" />
		{:else}
			<input name={it.name || ''} value={it.val || ''} />
		{/if}
				{/each}
	</div>
	<div class="foot">
		{#if attr.buttons}
			<button on:click={save} class="save">{attr.buttons[0].title || ''}</button>
		{/if}
	</div>
</div>

</Draggable>

<style>
.PopupWindow {
    background-color: #FFFFFF;
	width: calc(100% - 8px);
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}
.PopupWindow .header {
    font-weight: bold;
}
.PopupWindow .title {
	pointer-events: none;
}
.PopupWindow .close {
    right: 4px;
    position: absolute;
    border: unset;
    padding: 0;
    width: 12px;
    height: 12px;
}
.PopupWindow .body {
  /*  height: 400px;*/
    overflow-y: auto;
}
.PopupWindow .foot {
    text-align: center;
    margin-top: 4px;
}

.PopupWindow input {
    width: calc(100% - 16px);
    border: 1px solid #AFC0D5;
	outline: none;
}
</style>
