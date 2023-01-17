<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	// import MyIcon from '../svg/s-tree.svg';
  // import svelteLogo from './assets/svelte.svg'
	// import Line from './Line.svelte'
  
	export let gmxMap;
	export let childs = [];
	export let props = {};
	export let type = '';

	$: arr = childs.slice();
	// let visible = props.visible ? true : false;
	// let list = props.list ? true : false;
// console.log('ggggg', gmxMap);

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
	const toggleLayer = ev => {
		const node = ev.target;
		const nm = node.parentNode.parentNode.getAttribute('data-nm');

		let it = arr[nm];
		if (it) {
			it.content.properties.visible = !it.content.properties.visible;
			const layerID = it.content.properties.name;
			const layer = gmxMap.layersByID[layerID];
// console.log('ggggg', layerID, layer);
			if (it.content.properties.visible) {
				gmxMap.leafletMap.addLayer(layer);
			} else {
				gmxMap.leafletMap.removeLayer(layer);
			}
			arr = arr.slice();
		}
	}
</script>

{#if arr.length}
<ul class="grp">
{#each arr as item, i}
{@const content = item.content || {}}
{@const prp = content.properties || {}}
{@const closed = prp.expanded ? '' : 'closed'}
{@const visible = prp.visible ? true : false}
{@const showCheckbox = item.type === 'layer' || prp.ShowCheckbox ? true : false}
{@const meta = Object.keys(prp.MetaProperties || {}).length ? true : false}

	<li class="group {item.type} {closed}" data-nm={i}>
		{#if item.type === 'group'}<div class="hitarea" on:click={toggle}></div>{/if}
		<div layerid={prp.name} class="line ui-droppable">
			{#if showCheckbox}<input type="checkbox" name="root" class="box" checked={visible} on:click={toggleLayer} />{/if}
			<span styletype="color">
				<div class="colorIcon" styletype="color" title="Редактировать стили" style="display: inline-block;">
					<div class="borderIcon" styletype="color" style="border-color: rgb(0, 0, 255); opacity: 1;"></div>
					<div class="fillIcon" style="background-color: rgb(255, 255, 255); opacity: 0.2;"></div>
				</div>
			</span>
			<div titlediv="true" style="display: inline; position: relative; border-bottom: none; padding-right: 3px;">
				<span class="layer ui-draggable" dragg="true">{prp.title}</span>
			</div>
			<span class="layerDescription"></span>
			{#if meta}<span class="layerInfoButton">i</span>{/if}
			<div multistyle="true" style="display: none;"></div>
		</div>
		<div swap="true" class="swap ui-droppable" style="font-size: 0px;">
		</div>
		<svelte:self bind:gmxMap={gmxMap} bind:type={item.type} bind:props={item.content.properties} bind:childs={item.content.children} />
	</li>

{/each}
</ul>
<!--	{:else if type === 'layer'} -->
	{/if}

<style>
ul.grp {
	padding-inline-start: 24px;
}
li.group {
	list-style-type: none;
}
div.line {
	white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.group .hitarea {
    background: url(./img/icons2.png) -97px -4px no-repeat;
    height: 16px;
    width: 6px;
    margin-left: -16px;
    float: left;
    cursor: pointer;
}
.group.closed .hitarea {
    background-position: -115px -3px;
}
	
</style>
