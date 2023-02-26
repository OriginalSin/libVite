<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Line from './Line.svelte'
  
	// export let gmxMap;
	export let childs = [];
	// export let props = {};
	// export let type = '';

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
		// console.log('yyy', type, props.title, props);
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
	const findItem = ev => {
		// const node = ev.target;
		// const nm = node.parentNode.getAttribute('data-nm');
		
	}
</script>

{#if arr.length}
	<ul class="grp">
	{#each arr as item, i}
		{@const type = item.type || {}}
		{@const content = item.content || {}}
		{@const prp = content.properties || {}}
		{@const layerID = prp.LayerID || ''}
		{@const closed = prp.expanded ? '' : 'closed'}

		<li class="group {type} {closed}" data-nm={i}>
			{#if type === 'group'}<div class="hitarea" on:click={toggle}></div>{/if}
			<Line {layerID} {prp} />
			<svelte:self bind:childs={item.content.children} />
		</li>

	{/each}
	</ul>
{/if}

<style>


</style>
