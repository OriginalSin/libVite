<script>
	import Group from './Group.svelte'
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
  
	export let gmxMap;
	export let type;
	export let childs;
	export let props;

	// let showCheckbox = props.ShowCheckbox ? true : false;
	// let expanded = props.expanded ? true : false;
	// let visible = props.visible ? true : false;
	// let list = props.list ? true : false;

    onMount(() => {
		// console.log('onMount', type, props, childs);
	});

	beforeUpdate(() => {
		// console.log('item', type, props, childs);
		// if (!rawTree) getGmxMap();
		// props = item.content.properties;
	});
	// let closed = expanded ? '' : 'closed';
	// const toggle = ev => {
		// const node = ev.target;
		// closed = node.parentNode.classList.contains('closed') ? '' : 'closed';
	// }
</script>

{#if type !== 'map1'}
	<li class="line {type}">
		<Group {gmxMap} {type} {props} {childs} />
	</li>
{/if}

<style>

</style>
