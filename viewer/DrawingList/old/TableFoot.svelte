<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import { beforeUpdate } from 'svelte';

	export let foot = {};

	let pStart = 0;
	let cPageStr = '';
	beforeUpdate(() => {
		console.log('the component is about to update');
		let cPage = foot.cPage || 0;
		let pSize = foot.pSize || 20;
		let count = foot.count || 0;
		pStart = 10 * Math.floor(cPage / 10);

		cPageStr = [cPage * pSize + 1, (cPage +1 ) * pSize > count ? count : (cPage +1 ) * pSize].join('-');
	});

	const getShape = () => {
		L.gmxUtil.layerHelper.downloadLayer({t: foot.layerID});
	};
	const getCsv = () => {
		// t: 4B830D2287904B2BA414D9E1E629F362
// format: csv
// columns: [{"Value":"[gmx_id]","Alias":"gmx_id"},{"Value":"[t]","Alias":"t"}]
		L.gmxUtil.layerHelper.downloadLayer({t: foot.layerID, format: 'csv'});
	};
	const getGeojson = () => {
		L.gmxUtil.layerHelper.downloadLayer({t: foot.layerID, format: 'geojson'});
	};
	const createLayer = () => {
	};
	const copyObjects = () => {
	};
	const getSquare = () => {
	// <button on:click={getCsv} class="csv">Скачать csv</button>
	// <button on:click={getGeojson} class="geojson">Скачать geojson</button>
	// <button on:click={createLayer} class="createLayer">Создать слой</button>
	// <button on:click={copyObjects} class="copyObjects">Копировать объекты</button>
	// <button on:click={getSquare} class="square">Суммарная площадь</button>
		// L.gmxUtil.layerHelper.downloadLayer({t: foot.layerID});
	};
	const setPageSize = (ev) => {
		const target = ev.target;
		const pSize = Number(target.options[target.selectedIndex].value);
		dispatch('notify', {cmd: 'setPage', pSize});
	};
	const setPage = (nm) => {
		let pSize = foot.pSize || 20;
		let count = foot.count || 0;
		let cPage = nm;
		if (cPage < 0) cPage = 0;
		else if (cPage * pSize > count) cPage = Math.floor(count / pSize);
		pStart = 10 * Math.floor(cPage / 10);
		const d = foot.mPage - pStart - 10;
		if (d <  0) pStart += d + 1;
console.log('setPage', foot);
		dispatch('notify', {cmd: 'setPage', cPage});
	};
// {@debug foot}

</script>

<section class="foot">
<table class="table-foot">
	<tbody>
	<tr>
		<td class="col_1">
			<div>
			<span class="cur">{cPageStr || ''}</span><span class="count">({foot.count || ''})</span>
			<div class="fileBrowser-progress {foot.loading ? 'active' : ''}"></div>
			</div>
		</td>
		<td class="col_2">
			<div class="tablePages">
			<button on:click={() => setPage(0)} class="first {pStart > 0 ? 'active' : ''}" title="Первая страница" />
			<button on:click={() => setPage(foot.cPage - 10)} class="prev {pStart > 0 ? 'active' : ''}" title="Предыдущие 10 страниц" />
				{#each Array.from(Array(10),(x,i)=>i) as i}
				{@const nm = i + pStart}
				{#if nm >= 0 && nm <= foot.mPage}
					<button on:click={() => setPage(nm)} class="pn {foot.cPage === nm ? 'active' : ''}">{nm + 1}</button>
				{/if}
				{/each}
			<button on:click={() => setPage(foot.cPage + 10)} class="next {pStart + 10 < foot.mPage ? 'active' : ''}" title="Следующие 10 страниц" />
			<button on:click={() => setPage(Number.POSITIVE_INFINITY)} class="last {pStart + 10 < foot.mPage ? 'active' : ''}" title="Последняя страница" />
			</div>
		</td>
		<td class="col_3">
			<select on:change={setPageSize}>
				{#each [10, 20, 50, 100, 200, 500] as i}
				<option value={i} selected={i === foot.pSize}>{i}</option>
				{/each}
			</select>

		</td>
	</tr>
	</tbody>
</table>

<div class="foot-buttons">
	<button on:click={getShape} class="shp">Скачать shp</button>
	<button on:click={getCsv} class="csv">Скачать csv</button>
	<button on:click={getGeojson} class="geojson">Скачать geojson</button>
	<button on:click={createLayer} class="createLayer">Создать слой</button>
	<button on:click={copyObjects} class="copyObjects">Копировать объекты</button>
	<button on:click={getSquare} class="square">Суммарная площадь</button>
</div>

</section>

<style>
.foot table {
    width: 100%;
}
.foot-buttons button {
    font-size: 12px;
    text-decoration: underline;
	padding: 0;
    border: none;
}
.foot-buttons button.square {
    position: absolute;
    right: 0;
    bottom: 3px;
    /* display: flex; */
}

.table-foot .col_1 {
    width: 25%;
}
.table-foot .col_1 .cur {
    padding-right: 6px;
}
.table-foot .col_3 {
    text-align: right;
	width: 60px;
}
.table-foot .col_2 {
    text-align: center;
}
.table-foot .col_2 .pn {
	padding: 2px
}
.table-foot .col_2 button.first {
    background: url(../img/first.png);
}
.table-foot .col_2 button.prev {
    background: url(../img/prev.png);
}
.table-foot .col_2 button.next {
    background: url(../img/next.png);
}
.table-foot .col_2 button.last {
    background: url(../img/last.png);
}
.table-foot .col_2 button.first,
.table-foot .col_2 button.prev,
.table-foot .col_2 button.next,
.table-foot .col_2 button.last {
	width: 18px;
    height: 14px;
    border: none;
	padding: 0px;
	margin-bottom: -7px;
	background-repeat: no-repeat;
}
.fileBrowser-progress.active {
    display: inline-block;
}
.fileBrowser-progress {
    background: url(../img/progress.gif);
    width: 16px;
    height: 16px;
    display: none;
    vertical-align: middle;
    margin: 0px 0px 3px 3px;
}
.tablePages .header .value{
	font-weight: bold;
}

.tablePages button.next.active,
.tablePages button.last.active,
.tablePages button.first.active,
.tablePages button.prev.active {
	visibility: visible;
	pointer-events: visible;
}
.tablePages button.next,
.tablePages button.last,
.tablePages button.first,
.tablePages button.prev {
	visibility: hidden;
}
.tablePages button.active {
	pointer-events: none;
	font-weight: bold;
}

</style>
