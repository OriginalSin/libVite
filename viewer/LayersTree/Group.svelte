<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Line from './Line.svelte'
  
	export let layersCont;
	export let childs = [];
	export let layerID = '';
	// export let props = {};
	// export let type = '';

	const dispatch = createEventDispatcher();
	// dtNm = dtNm + ':' + cnm;
	$: arr = childs.slice();
	// let cont;
	// let visible = props.visible ? true : false;
	// let list = props.list ? true : false;

	onMount(() => {
		// console.log('onMount', type, props, childs);
		// content = rawTree.content || {};
		// props = content.properties || {};
	});
	beforeUpdate(() => {
		// if (!rawTree) getGmxMap();
		// content = rawTree.content || {};
		// props = content.properties || {};
		// console.log('yyy', childs, arr);
	});

	const toggle = ev => {
		const node = ev.target;
		const nm = node.parentNode.getAttribute('data-nm');

		let it = arr[nm];
		if (it) {
			it.content.properties.expanded = !it.content.properties.expanded;
			arr = arr.slice();
		}
	}
	const refresh = ev => {
dispatch('refresh', ev.detail);
		// const tree = ev.detail.tree;
		// console.log('refresh', tree);
		// childs = tree.children.slice();
	}
	const findItem = ev => {
		// const node = ev.target;
		// const nm = node.parentNode.getAttribute('data-nm');
		
	}
</script>

{#if arr.length}
	{#if !layerID}<div class="swapBegin"></div>{/if}
	<ul class="grp">
	{#each arr as item, i}
		{@const type = item.type || {}}
		{@const visibility = type === 'group' ? 'visible' : 'hidden'}
		{@const content = item.content || {}}
		{@const prp = content.properties || {}}
		{@const title = prp.title || ''}
		{@const layerID = prp.LayerID || prp.GroupID || ''}
		{@const closed = prp.expanded ? '' : 'closed'}

		<li class="{type} {closed}" data-id={layerID} data-nm={i}>
			<div title="Показать/Свернуть" class="hitarea" on:click={toggle} style="visibility: {visibility}"></div>
			<Line {layerID} {prp} {layersCont} on:refresh={refresh} />
			<svelte:self bind:childs={item.content.children} {layerID} {layersCont} />
		</li>

	{/each}
	</ul>
	{#if !layerID}<div class="swapEnd"></div>{/if}
{/if}

<style>


</style>
