<script>
	import { onMount, getContext } from 'svelte';
	import { key } from './menu.js';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();	
	
	export let isDisabled = false;
	export let item = {};
	
	let text = item.text || '';
	let items = item.items;
	let isOver = false;
	let x;
	let y;
	let cont;
	let overCont;

	// const { dispatchClick } = getContext(key);
	
	const handleClick = e => {
		if (isDisabled) return;
		dispatch('click');
		// dispatchClick();
	}
	const handleOut = e => {
		const target = e.target,
			toElement = e.toElement,
			pNode = target.parentNode;
// let flag = pNode === cont;
		if (toElement.classList.contains('level1')) {
		// if (toElement.classList.contains('level') || toElement.classList.contains('level2')) return;
		// if (toElement.classList.contains('level')) return;
// console.log('handleOut', toElement);
			isOver = false;
			// cont.classList.remove('over');
		}
		// if (item.items && flag) {
		// if (item.items && pNode === cont && overCont === target) {
			// isOver = false;
// console.log('handleOut', target, pNode);
		// }
	}
	const handleOver = e => {
		const target = e.target,
			toElement = e.toElement,
			pNode = target.parentNode;
		// isOver = false;
// let flag = pNode !== cont;
// console.log('handleOver', target, pNode);
		if (isOver) {
			if (toElement.classList.contains('level') || toElement.classList.contains('level2')) return;
			if (item.items && overCont && !overCont.classList.contains('over')) isOver = false;
		}
		if (isOver && overCont === target) return;
// console.log('handleOver4', toElement, pNode);
		if (item.items) {
		// if (flag && item.items) {
		// if (pNode !== cont && !isOver && item.items) {
			const rect = target.getBoundingClientRect();
			const prect = target.parentNode.getBoundingClientRect();
			x = rect.width, y = 0;
			// x = rect.x + rect.width;
			// y = rect.y + rect.height;
// console.log('handleOver', toElement, rect, target.parentNode);
			isOver = true;
			// cont.classList.add('over');
			overCont = target;
		} else {
			Object.values(pNode.children).forEach(node => node.classList.remove('over'));
			isOver = false;
			// overCont = false;
		}
		// dispatch('over');

	}
  // class:over={isOver}
</script>

<div bind:this={cont} class="level1 {items ? 'menuMarkerRight':''}" class:over={isOver} class:disabled={isDisabled}
  on:click={handleClick}
  on:blur={()=>{}}
  on:focus={()=>{}}
  on:mouseover|stopImmediatePropagation|preventDefault={handleOver}
  on:mouseout|stopImmediatePropagation|preventDefault={handleOut}
>
	{text || ''}
	{#if items}
	<div class="level" style="top: {y}px; left: {x}px;">
		{#each (items || []) as it, i}
		<div class="level2"
		  class:disabled={isDisabled}
		  on:click={handleClick}
		>
		{it.text || ''}
		</div>
		{/each}
	</div>
	{/if}
	
</div>

<style>
div.menuMarkerRight::after {
	content: '';
    height: 10px;
    width: 10px;
	position: absolute;
    right: 5px;
    background: url(/img/arrows.png) -5px -5px no-repeat;
}
div.level1.over div.level {
	display: block;
}
div.level2,
div.level1 {
	padding: 4px 15px;
	cursor: default;
	font-size: 14px;
	display: flex;
		position: relative;
	align-items: center;
	grid-gap: 5px;
}
div:hover {
	background: #0002;
}
div.disabled {
	color: #0006;
}
div.disabled:hover {
	background: white;
}
div.level {
	position: absolute;
	display: none;
	border: 1px solid #0003;
	box-shadow: 2px 2px 5px 0px #0002;
	background: white;
	white-space: nowrap;
}
</style>
