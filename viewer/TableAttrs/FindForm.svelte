<script>
	import FindAttr from './FindAttr.js';
	import DrawingList from '../DrawingList/DrawingList.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// export let formsKeys;

	export let attributes = {};
	export let formsKeys = {};

	let map = L.gmx.gmxMap.leafletMap;
	let drawingList;
	let geoJSON;
	let textarea;
	let active = '';
	$: {
		active = formsKeys.find ? 'active' : '';
	}
	const setVal = (ev) => {
		const target = ev.target.parentNode;
		const classList = target.classList;
		if (classList.contains('active')) classList.remove('active');
		else classList.add('active');
console.log('setVal', target);
	};
	const setGeo = (pt) => {
// console.log('setGeo', pt);
		if (map._drawingList) map._drawingList.$destroy();
		map._drawingList = new DrawingList({
			target: document.body,
			props: {
				onSelect: (it) => {
					geoJSON = it.toGeoJSON().geometry;
					map._drawingList.$destroy();
console.log('onSelect', geoJSON);
				},
				left: 200,
				top: 200
			}
		});

	};
	const geoSummary = () => {
		return geoJSON ? L.gmxUtil.getGeoJSONSummary(geoJSON) : '';
	}
	const setSVGIcon = (key) => {
		return L.gmxUtil.setSVGIcon(key);
	}
	const find = () => {
		let query = '';
		if (textarea.value) query += textarea.value;
		if (geoJSON) {
			if (textarea.value) query = '(' + query + ') AND ';
			query += 'intersects([geomixergeojson], GeometryFromGeoJson(\'' + JSON.stringify(geoJSON) + '\', 4326))';
		}
		
		// const prp = {cmd: 'find', query};
		dispatch('notify', {cmd: 'find', query});
// console.log('find', prp);
	};
	
console.log('FindAttr', attributes, formsKeys, FindAttr);
	const setFunc = (pt) => {
		setRangeText(pt.func);
		// let str = textarea.value;
		// str += '' + pt.func + '';
		// textarea.innerHTML = str;
		// textarea.value += '' + pt.func + '';
		// textarea.value = str;
// console.log('setFunc', str);
	};
	const setOper = (pt) => {
		setRangeText(pt.name);
		// let str = textarea.value;
		// str += '' + pt.name + '';
		// textarea.value = str;
		// textarea.innerText = str;
// console.log('setOper', str);
	};
	const setField = (f) => {
		setRangeText('"' + f + '"');
	};
	const setRangeText = (st) => {
		if (textarea.selectionStart !== textarea.selectionEnd) {
			textarea.setRangeText(st, textarea.selectionStart, textarea.selectionEnd);
		} else textarea.value += st;
	};
// {@debug attributes}

</script>

<div class="find {active}">
	<div on:click={() => dispatch('notify', {cmd: 'formsKeys', key: 'find' })} class="close"><button>Скрыть</button></div>
	<div class="middle">
		<div class="query-container">
			<div class="where">
				<span>
					<span>WHERE</span>
				</span>
				<button on:click={() => textarea.value = ''} class="clean">Очистить</button>
			</div>
			<div class="query">
				<textarea bind:this={textarea} placeholder="&quot;field1&quot; = 1 AND &quot;field2&quot; = 'value'" />
			</div>

			<div class="suggest">
				<table>
				<tbody>
				<tr>
				<td>
					<div><button on:click={setVal} class="attr">Колонки</button>	
						<div class="helper scrollbar">
							<div class="elem" title="gmx_id">
								<button on:click={() => setField('gmx_id')}>gmx_id</button>
							</div>
							{#each (attributes || []) as key}
							<div class="elem" title="{key}">
								<button on:click={() => setField(key)}>{key}</button>
							</div>
							{/each}
							<div class="elem" title="gmx_geometry">
								<button on:click={() => setField('gmx_geometry')}>gmx_geometry</button>
							</div>
						</div>
					</div>
				</td>
				<td>
					<div><button on:click={setVal} class="op">Операторы</button>	
						<div class="helper scrollbar">
							{#each (FindAttr?.oper || []) as pt}
							<div class="elem" title="{pt.title}">
								<button on:click={() => setOper(pt)}>{pt.name}</button>
							</div>
							{/each}
						</div>
					</div>
				</td>
				<td>
					<div><button on:click={setVal} class="func">Функции</button>
						<div class="helper scrollbar">
							{#each (FindAttr?.func || []) as it}
							{@const grp = Object.keys(it)[0]}
								<div class="group">{grp}</div>
								{#each it[grp] as pt}
									<div class="elem" title="{pt.func} {pt.title}">
										<button on:click={() => setFunc(pt)}>{pt.name}</button>
									</div>
								{/each}
							{/each}
						</div>
					</div>
				</td>
				</tr>
				</tbody>
				</table>

			</div>
		</div>
	</div>
	<div class="foot">
		<div class="geometryCont">
			<span>
				<span class="geomtitle">Искать по пересечению с объектом</span>
				<button on:click={setGeo} class="geom" />
				{#if geoJSON}
				<div>
					<span class="{geoJSON.type}"></span>
					<span class="name">{geoJSON.type}</span>
					<span class="summary">({geoSummary()})</span>
					<button on:click={() => geoJSON = undefined} class="name">{@html setSVGIcon('close')}</button>
				</div>
				{/if}

			</span>
		</div>

		<div class="searchButtonContainer">
			<button on:click={find} class="search">Найти</button>
		</div>
	</div>
</div>

<style>
.find .searchButtonContainer {
    /* bottom: 10px; */
    /* position: absolute; */
}
.find .geometryCont {
    /* bottom: 40px; */
    /* position: absolute; */
}
.find {
	display: none;

    width: 300px;
    height: 400px;

}
.find.active {
	display: block;
}
.find .where {
    position: relative;
}
.find .where span {
    width: 180px;
    display: inline-block;
}
.find .close button,
.find .where button {
	text-decoration: underline;
    padding: 0;
}
.find .where button {
}
.find .where button {
    right: 0;
    position: absolute;
}
.find .query textarea {
    width: calc(100% - 6px);
    height: 122px;
}
.find .suggest table tr td {
    width: 98px;
    height: 22px;
	    vertical-align: top;
}
.find .suggest table tr td > div {
    width: 94px;
    border: 1px solid #AFC0D5;
}
.find .suggest table tr td > div button.attr {
	/* height: unset; */
    /* padding: 4px; */
}
.find .suggest table tr td > div button {
    display: flex;
    border-radius: unset;
    background-color: #FFFFFF;
    /* height: 20px; */
	padding: 4px;
}
.find .suggest table tr td > div .helper {
	display: none;
	font-size: 14px;
}
.find .suggest table tr td > div.active .helper {
	display: block;
    height: 126px;
	overflow-y: auto;
	overflow-x: hidden;
	border-top: 1px solid #AFC0D5;
}
.find .suggest table tr td > div .helper .group {
	font-weight: bold;
    text-align: center;
}
.find .suggest table tr td > div .helper div:hover {
    background-color: #91C1D2;
}
.find .suggest table tr td > div .helper button {
	border: unset;
	background: transparent;
	width: 100%;
}
.find .middle {
	height: 318px;
    /* z-index: 1; */
    /* position: relative; */
    /* background-color: white; */
}
.find .geometryCont button.geom {
	background-image: url(/img/choose2.png);
	background-repeat: no-repeat;
    display: inline-block;
}
</style>
