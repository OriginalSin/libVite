<script>
	// import { setContext } from 'svelte';
  
	// export let map;
	export let data = {};
	export let current = data.current || '';

// console.log('data', data);
	let items = data.items || [],
		// current = data.current || '',
		change = data.change || '',
		body = document.body;
	body.classList.add('leftMenuOn');
	if (current) {
		body.classList.add('leftMenuOpen');
	}
	// const target = {
		// getCurrent: () => current,
		// setCurrent: (tab) => current = tab,
	// };

	// const getCurrent = () => current;
	// setContext('getCurrent', current);

	const toggle = ev => {
		const node = ev.target,
			name = node.getAttribute('data-id');

		// node.classList.toggle('active');
		// body.classList.toggle('leftMenuOpen');
		if (name === current) {
			current = '';
			// node.classList.remove('active');
			body.classList.remove('leftMenuOpen');
		} else {
			current = name;
			// node.classList.add('active');
			body.classList.add('leftMenuOpen');
		}
		if (change) change({current, originalEvent: ev});
		
	}
</script>
<div class="IconSidebar" on:contextmenu|preventDefault>
	<ul class="tabs">
	{#each items as item, i}
		{@const active = current === item.tab ? 'active' : ''}
		<li class="tab {active}" data-id={item.tab} on:click={toggle}>
			<svg role="img" class="svgIcon"><use href="{item.svg}" /></svg>
		</li>
	{/each}
	</ul>
	<div class="panes">
	{#each items as item, i}
		{@const active = current === item.tab ? 'active' : ''}
		<div data-id={item.tab} class="pane layers-tree {active}">
			{#if item.pan}
				<svelte:component this={item.pan} />
			{:else}
				{item.tab}
			{/if}
		</div>

	{/each}
	</div>

</div>

<style>
.IconSidebar {
	height: 100%;
	font-family: sans-serif;
    font-size: 12px;
    font-weight: 400;
}
.IconSidebar .panes div {
	display: none;
}
.IconSidebar .panes div.active {
	display: block;
}
.IconSidebar .panes {
    float: right;
	width: 362px;
}
.IconSidebar .tabs {
    width: 40px;
    height: 100%;
	margin: 0;
	padding-left: 0px;
    float: left;
    background-color: #4c5567;
}
.IconSidebar .tabs .tab.active {
	fill: #70cbe0;
	border-left-color: #70cbe0;
}
.IconSidebar .tabs .tab {
    height: 40px;
    text-align: center;
    cursor: pointer;
    user-select: none;
	fill: #d8e1e8;
	border-left: 4px solid transparent;
}
.IconSidebar .tabs .tab svg {
    width: 20px;
    height: 20px;
    margin-left: -4px;
    margin-top: 10px;
    left: -4px;
	pointer-events: none;
}
.IconSidebar  .panes .pane {
    border: 1px solid #DDD;
    /* padding: 10px 0px 10px 0px; */
    margin: 10px 5px;
}
</style>
