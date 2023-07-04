<script>
import Draggable from './Modal/Draggable.svelte';
// import CreateDescr from './CreateDescr.svelte';
// import DrawingList from '../DrawingList/DrawingList.svelte';
import Utils from './Utils.js';

export let attr = {};
// export let onSelect = null;

let gmxMap = L.gmx.gmxMap;
let map = gmxMap.leafletMap;
let {layerID, left, top, height, width} = attr;
let contNode;
let closeIcon = L.gmxUtil.setSVGIcon('close');

const closeMe = () => {
	map._popupWindow.$destroy();
};
const bodyClick = (ev) => {
	if (attr.bodyClick) attr.bodyClick(ev);
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

<Draggable {left} {top} {width} {height}>

<div class="PopupWindow" bind:this={contNode}>
	<div class="header"> 
		<span class="title">{attr.title}: </span>
		<button on:click={closeMe} type="button" class="close">{@html closeIcon}</button>
	</div>
	<div on:click={bodyClick} class="body scrollbar">
				{#each (attr.inputs || []) as it, i}
				{@const name = it.name || ''}
				{@const val = it.val || ''}
				{@const disabled = it.disabled ? 'disabled':''}
				{@const auto = it.autofocus ? 'autofocus onfocus="this.select()"':''}
		<div class="line">
		{#if it.title}
			<label for={name}>{it.title}</label>
		{/if}
		{#if it.html}
			{@html it.html}
		{:else}
			{#if it.autofocus}
				<input name={name} value={val} autofocus onfocus="this.select()" {disabled} />
			{:else if it.onInput}
				<input on:input={it.onInput} name={name} value={val} {disabled} />
			{:else}
				<input name={name} value={val} {disabled} />
			{/if}
		{/if}
		</div>
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
	/*width: calc(100% - 8px);*/
	
    height: calc(100% - 8px);

    padding: 4px;
    font-size: 12px;
}

.PopupWindow :global(.fill-available) {
    width: -moz-available;
	width: -webkit-fill-available;
	width: fill-available;
	text-align: center;
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
.PopupWindow .body .line {
    display: flex;
    align-items: center;
    border: 1px solid #dddddd;
    padding: 4px;
}
.PopupWindow .body .line label {
    width: 140px;
    display: inline-flex;
    white-space: break-spaces;
}
.PopupWindow .foot {
    text-align: center;
    margin-top: 4px;
}

.PopupWindow input {
 /*   width: calc(100% - 16px);*/
    border: 1px solid #AFC0D5;
	outline: none;
}
</style>
