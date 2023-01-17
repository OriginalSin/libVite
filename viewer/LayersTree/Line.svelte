<script>
	import Group from './Group.svelte'
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
  
	export let gmxMap;
	export let props;
	export let type;
	export let childs;

	let showCheckbox = props.ShowCheckbox ? true : false;
	let expanded = props.expanded ? true : false;
	let visible = props.visible ? true : false;
	let list = props.list ? true : false;

    onMount(() => {
		// console.log('onMount', type, props, childs);
	});

	beforeUpdate(() => {
		// console.log('item', type, props, childs);
		// if (!rawTree) getGmxMap();
		// props = item.content.properties;
	});
	let closed = expanded ? '' : 'closed';
	const toggle = ev => {
		const node = ev.target;
		closed = node.parentNode.classList.contains('closed') ? '' : 'closed';
	}
</script>

{#if type !== 'map1'}
	<li class="line {type}">
<!--
		{#if type === 'group'}<div class="hitarea" on:click={toggle}></div>{/if}
		<div layerid={props.name} class="line ui-droppable">
			{#if showCheckbox}<input type="checkbox" name="root" class="box layers-visibility-checkbox" box="layer">{/if}
			<span styletype="color">
				<div class="colorIcon" styletype="color" title="Редактировать стили" style="display: inline-block;">
					<div class="borderIcon" styletype="color" style="border-color: rgb(0, 0, 255); opacity: 1;"></div>
					<div class="fillIcon" style="background-color: rgb(255, 255, 255); opacity: 0.2;"></div>
				</div>
			</span>
			<div titlediv="true" style="display: inline; position: relative; border-bottom: none; padding-right: 3px;">
				<span class="layer ui-draggable" dragg="true">{props.title}</span>
			</div>
			<span class="layerDescription"></span>
			<span class="layerInfoButton">i</span>
			<div multistyle="true" style="display: none;"></div>
		</div>
		<div swap="true" class="swap ui-droppable" style="font-size: 0px;">
		</div>
-->
		<Group {gmxMap} {type} {props} {childs} />
	</li>
{/if}

<style>
/*
.line {
	height: 100%;
	list-style-type: none;
}
.line.group .hitarea {
    background: url(./img/icons2.png) -97px -4px no-repeat;
    height: 16px;
    width: 6px;
    margin-left: -16px;
    float: left;
    cursor: pointer;
}
.line.group.closed .hitarea {
    background-position: -115px -3px;
}
:global(
	.line.group.closed ~ ul.grp {
		display: none;
	}
)
*/
</style>
