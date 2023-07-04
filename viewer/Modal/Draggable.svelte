<script>
	import { onMount } from 'svelte';

	export let left;
	export let top;
	export let width = undefined;
	export let height = undefined;
	
	let moving = false;
	let type = '';
	let cont;
	// let height, width;

	function isHeader(e) {
		const t = e.target;
		let flag = t.classList.contains('header') || t.parentNode.classList.contains('header');
		if (flag) type = 'drag';
		else if (t.classList.contains('ui-resizable-handle')) {
			// height = cont.clientHeight, width = cont.clientWidth;
			const cln = t.classList;
			type = 'resize'; flag = true;
			if (cln.contains('n')) type += '_n';
			else if (cln.contains('e')) type += '_e';
			else if (cln.contains('s')) type += '_s';
			else if (cln.contains('w')) type += '_w';
			else if (cln.contains('se')) type += '_se';
			else if (cln.contains('sw')) type += '_sw';
			else if (cln.contains('ne')) type += '_ne';
			else if (cln.contains('nw')) type += '_nw';
		}
		return flag;
	}
	function onMouseDown(e) {
// console.log('onMouseDown', height, cont.clientWidth, cont.clientHeight);
		if (isHeader(e)) {
			height = cont.clientHeight - 8, width = cont.clientWidth - 8;
			left = cont.offsetLeft; top = cont.offsetTop;
			moving = true;
		}
	}
	onMount(() => {
			height = cont.clientHeight - 0, width = cont.clientWidth - 0;
			left = cont.offsetLeft; top = cont.offsetTop;
		// thead.style.transform = 'translate(0, -2px)';
		// console.log('ggggggggg', attrsTableParent);
	});
	
	function onMouseMove(e) {
		if (moving) {
// console.log('onMouseMove', type, height, cont.clientWidth, cont.clientHeight);
			const dx = e.movementX, dy = e.movementY;
			if (type === 'drag') { left += dx; top += dy; }
			else if (type === 'resize_n') { height -= dy; top += dy; }
			else if (type === 'resize_e') { width += dx; } 
			else if (type === 'resize_s') { height += dy; } 
			else if (type === 'resize_w') { width -= dx; left += dx; } 
			else if (type === 'resize_ne') { width += dx; height -= dy; top += dy; } 
			else if (type === 'resize_se') { width += dx; height += dy; }
			else if (type === 'resize_nw') { width -= dx; height -= dy; left += dx; top += dy; }
			else if (type === 'resize_sw') { width -= dx; height += dy; left += dx; }
		}
	}
	
	function onMouseUp() {
		moving = false;
	}
	
// 	$: console.log(moving);
</script>

<section bind:this={cont} on:mousedown={onMouseDown} style="left: {left}px; top: {top}px; width: {width}px; height: {height}px;" class="draggable">
	<slot wh={width, height}></slot>
	<div class="ui-resizable-handle n"></div>
	<div class="ui-resizable-handle e"></div>
	<div class="ui-resizable-handle s"></div>
	<div class="ui-resizable-handle w"></div>
	<div class="ui-resizable-handle se"></div>
	<div class="ui-resizable-handle sw"></div>
	<div class="ui-resizable-handle ne"></div>
	<div class="ui-resizable-handle nw"></div>
</section>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<style>
:root {
  --tableAttrs-height: 320px;
}
.draggable {
    max-width: 80%;
	overflow: hidden;
	white-space: nowrap;
	user-select: none;
	position: absolute;
	z-index: 1000;
	border: 1px solid #dddddd;
	box-shadow: rgba(100, 100, 100, 0.7) 0px 0px 3px;
	background-color: white;
	padding: 4px;
}
.draggable :global(.header) {
	cursor: move;
}
.draggable .ui-resizable-handle {
	z-index: 90;
	position: absolute;
	color: red;
}
.draggable .n { cursor: n-resize; width: 100%; height: 4px; left: 0; top: 0; }
.draggable .e {	cursor: e-resize; height: 100%;	width: 4px;	right: 0; top: 0; }
.draggable .s {	cursor: s-resize; width: 100%; height: 4px;	left: 0; bottom: 0; }
.draggable .w {	cursor: w-resize; height: 100%;	width: 4px;	top: 0;	left: 0; }
.draggable .se { cursor: se-resize;	width: 10px; height: 10px; right: -7px;	bottom: -7px; }
.draggable .sw,
.draggable .ne,
.draggable .nw { width: 7px; height: 7px; }
.draggable .sw { cursor: sw-resize;	left: 0; bottom: 0; }
.draggable .ne { cursor: ne-resize;	right: 0; top: 0; }
.draggable .nw { cursor: nw-resize;	left: 0; top: 0; }
</style>
