import IconSidebar from './IconSidebar.svelte';
import LayersTree from '../LayersTree/LayersTree.svelte';

let sidebar;
let sidebarData = {
	change: e => {
		const target = e.target;
		sidebarData.current = e.current;
		// iconSidebar.addTab({tab: 'forestView', svg: '#s-forest-plugin'});
// console.log('change', e.current, iconSidebar.getTab('LayersTree'), iconSidebar.getCurrent(), e, target.getCurrent());
	},
	current: 'LayersTree',
	items: [
		{tab: 'LayersTree', svg: '#s-tree', pan: LayersTree},
		// {tab: 'forestView', svg: '#s-forest-plugin'}
	]
};
let iconSidebar = {
	getCurrent: () => sidebarData.current,
	setCurrent: (tab) => { sidebarData.current = tab; sidebar.$set({current: tab}); },
	getTab: (key) => sidebarData.items.filter(it => it.tab === key)[0],
	addTab: (tab) => {
		if(!sidebarData.items.filter(it => it.tab === tab.tab).length) {
			sidebarData.items.push(tab); sidebar.$set({...sidebarData});
		}
	},
};

const setSidebar = (data) => {
	if (sidebar) sidebar.$destroy();
	sidebar = new IconSidebar({
		target: document.getElementsByClassName('leftMenu')[0],
		  props: {
			data 
		  } 
	});
}
export default () => {
	setSidebar(sidebarData);
}
