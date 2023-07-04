<script>
	import './app.css'
    import { onMount, onDestroy, beforeUpdate, afterUpdate, createEventDispatcher } from 'svelte';
	import Group from './Group.svelte'
	import DateRange from '../DateRange/DateRange.svelte'
	import { _layerTree } from '../stores.js';
	import * as MenuTypes from '../ContextMenu/menu.js';

console.log('menuTypes', MenuTypes.key);
	let gmxMap = L.gmx.gmxMap;
	let layersCont;
	let props = gmxMap.properties || {};
	let rawTree = gmxMap.rawTree;
	let childs = [];
	// let childs = rawTree.children;
	_layerTree.subscribe(value => {rawTree = value; childs = rawTree.children});
	
	const setContextMenu = () => {
		MenuTypes.key.group = {
			items: [
				{text: 'Свойства', cmd: 'EditGroup', fn: (cmd, attr) => {
					const source = attr.source;
					const node = attr.node;
					const titleNode = node.querySelector('span.layer');
					
					let comp = gmxMap.leafletMap._popupShow({
						title: 'Группа ' + source.GroupID,
						left: attr.x, top: attr.y,
						width: 280, //height: 220,
						bodyClick: ev => {
							const target = ev.target;
							const key = target.name;
							// const title = titleNode.textContent;
							
							switch(key) {
								case 'list':
									const toNode = target.previousSibling || target.nextSibling;
									if (toNode) toNode.checked = false;
									Object.values(node.querySelectorAll('ul > li')).forEach(n => {
										const r = n.querySelector('div > input');
										r.type = target.type; 
									});
									source.list = target.type === 'radio';
									// gmxMap.rawTreeChanged = {...rawTree};
									// if (target.type === 'radio') toNode.checked = source.list = false;
									// else source.list = true;
									// childs = [...childs];
									// _layerTree.set(rawTree);
									break;
								case 'expanded':
								case 'ShowCheckbox':
									source[key] = target.checked;
									break;
								default:
									return;
							}
							// if (title !== '') {
								// toNode.checked = false;
							// }
							gmxMap.rawTreeChanged = {...rawTree};
					console.log('bodyClick', ev.target.name, source, rawTree);
						},
						inputs: [
							{name: 'title', title: 'Имя', val: source.title + ' ' + (source.childrenСount), onInput: e => {
								const v = e.target.value;
								if (source.title !== v) { source.title = v; titleNode.textContent = v; }
								gmxMap.rawTreeChanged = {...rawTree};
console.log('title', v, gmxMap.rawTreeChanged);
							}},
							{name: 'ID', title: 'ID', val: source.GroupID, disabled: true},
							{name: 'list', title: 'Вид вложенных элементов', html: '<span class="fill-available"><input '+(source.list ? '':'checked')+' name="list" type="checkbox" /><input '+(source.list ? 'checked':'')+' name="list" type="radio" /></span>'},
							{name: 'ShowCheckbox', title: 'Чекбокс видимости', html: '<span class="fill-available"><input '+(source.ShowCheckbox ? 'checked':'')+' name="ShowCheckbox" type="checkbox" /></span>'},
							{name: 'expanded', title: 'Разворачивать автоматически', html: '<span class="fill-available"><input '+(source.expanded ? 'checked':'')+' name="expanded" type="checkbox" /></span>'}
						],
						// buttons: [
							// {name: 'save', title: 'Создать', onClick: arr => {
								// const pars = arr.reduce((a, c) => {
									// const n = c.name;
									// const v = c.type === 'text' ? c.value : c.checked;
									// if (n === 'list' && v) a[n] = v;
									// else a[n] = v;
									// return a;
								// }, {});
						// console.log('save', pars, rawTree);
							// }},
						// ],
						attr
					});
					console.log('Добавить группу', cmd, attr, comp);
				}},
				{text: 'Добавить группу', cmd: 'AddGroup', fn: (cmd, attr) => {
					const source = attr.source;
					
					let comp = gmxMap.leafletMap._popupShow({
						title: 'Создание новой группы',
						left: attr.x, top: attr.y,
						width: 280, //height: 220,
						bodyClick: ev => {
							const target = ev.target;
							if (target.name === 'list') {
								const toNode = target.previousSibling || target.nextSibling;
								if (toNode) toNode.checked = false;
							}
					console.log('bodyClick', ev.target.name);
						},
						inputs: [
							{name: 'title', title: 'Имя группы', val: source.title + ' ' + (source.childrenСount)},
							{name: 'list', title: 'Вид вложенных элементов', html: '<span class="fill-available"><input checked name="list" type="checkbox" /><input name="list" type="radio" /></span>'},
							{name: 'ShowCheckbox', title: 'Чекбокс видимости', html: '<span class="fill-available"><input checked name="ShowCheckbox" type="checkbox" /></span>'},
							{name: 'expanded', title: 'Разворачивать автоматически', html: '<span class="fill-available"><input name="expanded" type="checkbox" /></span>'}
						],
						buttons: [
							{name: 'save', title: 'Создать', onClick: arr => {
								const pars = arr.reduce((a, c) => {
									const n = c.name;
									const v = c.type === 'text' ? c.value : c.checked;
									if (n === 'list' && v) a[n] = v;
									else a[n] = v;
									return a;
								}, {});
						console.log('save', pars, rawTree);
							}},
						],
						attr
					});
					console.log('Добавить группу', cmd, attr, comp);
				}},
				{text: 'Удалить', cmd: 'DelGroup'}
			]
		};
	}
	setContextMenu();
    onMount(() => {
		_layerTree.set(L.gmx.gmxMap.rawTree);
		// console.log('onMount', L.gmx.gmxMap.rawTree);
		// console.log('onMount childs', childs);
		
		// if (!rawTree) getGmxMap();
	});
	const refresh = ev => {
		const tree = ev.detail.tree;
		console.log('refresh', tree);
		// refresh
		_layerTree.set(tree);
		// childs = tree.children.slice();
	}
	const onRightClick = e => {
		gmxMap.leafletMap._showContextMenu({key: 'mapName', x: e.clientX, y: e.clientY });
	}

</script>
<div class="map" on:contextmenu|stopPropagation|preventDefault>
	<div class="mainmap-title" on:contextmenu={onRightClick}>{props.title}</div>
	<div class="leftPanelCont scrollbar">
		<div class="layers-before">
			<DateRange />
		</div>

		<div class="layers" bind:this={layersCont} >
			<Group {childs} {layersCont} on:refresh={refresh} />
		</div>
	</div>
</div>


<style>
.mainmap-title {
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    overflow-x: hidden;
    /* width: 320px; */
    text-overflow: ellipsis;
	padding: 7px 8px 7px 8px;

}

.layers-before,
.layers {
	border: 1px solid #DDD;
    /* padding: 10px 0px 10px 0px; */
    margin: 10px 5px;
}
/*
.leftPanelCont  div.layers > ul {
    margin-left: -8px;
}
*/
</style>
