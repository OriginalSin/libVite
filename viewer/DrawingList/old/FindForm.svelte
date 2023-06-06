<script>
	import FindAttr from './FindAttr.js';

	// export let formsKeys;

	export let attributes = {};
	export let formsKeys = {};

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
console.log('setGeo', pt);
	};
	const find = (pt) => {
console.log('find', pt);
	};
	
console.log('FindAttr', attributes, formsKeys, FindAttr);
	const setFunc = (pt) => {
		textarea.textContent += '' + pt.func + '';
console.log('setFunc', pt);
	};
	const setOper = (pt) => {
		textarea.innerHTML += '' + pt.name + '';
console.log('setOper', pt);
	};
	const setField = (f) => {
		const st = '"' + f + '"';
		let str = textarea.textContent;
		if (textarea.selectionEnd) {
			str = str.substr(0, textarea.selectionStart) + st + str.substr(textarea.selectionEnd);
		} else str += st;
		textarea.textContent = str;
	};
// {@debug attributes}

</script>

<div class="find {active}">
	<div class="close"><button>Скрыть</button></div>
	<div class="geometryCont">
		<span>
			<span class="geomtitle">Искать по пересечению с объектом</span>
			<button on:click={setGeo} class="geom" />
			<div class="drawingObjectsItemCanvas">
				<span class="drawingObjectsItem">
					<span class="Polygon"></span>
					<span class="drawingObjectsItemTitle">многоугольник</span>
					<span class="drawingObjectsItemTitle"></span>
					<span class="summary">(251615 кв. км)</span>
				</span>
				<span title="Удалить" class="gmx-icon-close"></span>
			</div>
		</span>
	</div>
	<div class="middle">
		<div class="query-container">
			<div class="where">
				<span>
					<span>WHERE</span>
				</span>
				<button class="clean">Очистить</button>
			</div>
			<div class="query">
				<textarea bind:this={textarea} placeholder="&quot;field1&quot; = 1 AND &quot;field2&quot; = 'value'"></textarea>
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

	<div class="searchButtonContainer">
		<button on:click={find} class="search">Найти</button>
	</div>
</div>

<style>
.find .searchButtonContainer {
    bottom: 10px;
    position: absolute;
}
.find .geometryCont {
    bottom: 40px;
    position: absolute;
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
    display: flex;
}
.find .where span {
    width: 180px;
    display: inline-block;
}
.find .where button {
	text-decoration: underline;
    padding: 0;
	display: flex;
}
.find .query textarea {
    width: 100%;
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
.find .suggest table tr td > div button {
    display: flex;
    border-radius: unset;
    background-color: #FFFFFF;
    height: 20px;
	padding: 0 4px;
}
.find .suggest table tr td > div .helper {
	display: none;
	font-size: 14px;
}
.find .suggest table tr td > div.active .helper {
	display: block;
    height: 154px;
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
}
.find .middle {
    z-index: 1;
    position: relative;
    background-color: white;
}
.find .geometryCont button.geom {
	background-image: url(/img/choose2.png);
	background-repeat: no-repeat;
    display: inline-block;
}
</style>
