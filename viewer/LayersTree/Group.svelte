<script>
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	// import MyIcon from '../svg/s-tree.svg';
  // import svelteLogo from './assets/svelte.svg'
	import Line from './Line.svelte'
  
	export let gmxMap;
	export let childs = [];
	// export let props = {};
	// export let type = '';

	$: arr = childs.slice();
	let cont;
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
	const toggleLayer = ev => {
		const node = ev.target;
		const nm = node.parentNode.parentNode.getAttribute('data-nm');

		let it = arr[nm];
		if (it) {
			it.content.properties.visible = !it.content.properties.visible;
			const layerID = it.content.properties.name;
			const layer = gmxMap.layersByID[layerID];
console.log('ggggg', layerID, gmxMap);
			if (it.content.properties.visible) {
				gmxMap.leafletMap.addLayer(layer);
			} else {
				gmxMap.leafletMap.removeLayer(layer);
			}
			arr = arr.slice();
		}
	}
	const showPos = ev => {
		const node = ev.target;
		const nm = node.getAttribute('data-nm');

		const it = arr[nm];
		if (it && it.content.geometry) {
			const bounds = L.gmxUtil.getGeometryBounds(it.content.geometry).toLatLngBounds();
			gmxMap.leafletMap.fitBounds(bounds);
// console.log('ggggg', bounds);
		}
	}
	const findItem = ev => {
		const node = ev.target;
		const nm = node.parentNode.getAttribute('data-nm');
		
	}
</script>

{#if arr.length}
<ul class="grp">
{#each arr as item, i}
{@const type = item.type || {}}
{@const content = item.content || {}}
{@const prp = content.properties || {}}
{@const layerID = prp.LayerID || ''}
{@const layerItem = gmxMap.layersByID[layerID] || {}}
{@const _gmx = layerItem[_gmx] || {}}
{@const props = _gmx.properties || {}}
{@const gmxStyles = props.gmxStyles || []}
{@const gmxStyle = gmxStyles.length === 1 ? gmxStyles[0] : null}

{@const closed = prp.expanded ? '' : 'closed'}
{@const visible = prp.visible ? true : false}
{@const showCheckbox = item.type === 'layer' || prp.ShowCheckbox ? true : false}
{@const meta = Object.keys(prp.MetaProperties || {}).length ? true : false}

	<li class="group {item.type} {closed}" data-nm={i}>
		{#if item.type === 'group'}<div class="hitarea" on:click={toggle}></div>{/if}
		<Line {layerID} {prp} {type} />
<!--	
		<div layerid={layerID} class="line ui-droppable">
			{#if showCheckbox}<input type="checkbox" name="root" class="box" checked={visible} on:click={toggleLayer} />{/if}
		{#if gmxStyle}
			<span styletype="color">
				<div class="colorIcon" styletype="color" title="Редактировать стили" style="display: inline-block;">
					<div class="borderIcon" style={gmxStyle.color ? 'border-color: ' + gmxStyle.color : ''}></div>
					<div class="fillIcon" style={gmxStyle.fillColor ? 'background-color: ' + gmxStyle.fillColor : ''}></div>
				</div>
			</span>
		{/if}
			<span data-nm={i} class="layer ui-draggable" dragg="true" on:click={showPos}>{props.title}</span>
			<span class="layerDescription"></span>
			{#if meta}<span class="layerInfoButton">i</span>{/if}
			<div multistyle="true" style="display: none;"></div>
		</div>
		<div swap="true" class="swap ui-droppable" style="font-size: 0px;">
		</div
-->
		<svelte:self bind:gmxMap={gmxMap} bind:childs={item.content.children} />
	</li>

{/each}
</ul>
	{/if}

<style>


</style>
