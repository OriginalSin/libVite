import Store from './Store';
import DataVersion from './DataSourceVersion';
import Observer from './Observer';

	let hover = {};
	DataVersion.setHover(hover);
const mousemove = (pars) => {
	const {hostName = 'maps.kosmosnimki.ru'} = pars;
	const hostItem = Store.getHost(hostName);
	// const host = DataVersion.hosts[hostName];
	if (!hostItem || !hostItem.ids) return new Promise((resolve => resolve));

	const prom = Observer.add({ type: 'mousemove', ...pars}).then(res => {
		let newHover = {};
		const out = {from: pars};
		// DataVersion.setHover({});
		if (Object.keys(res).length) {
			
			out.items = DataVersion.sortLayersData(res);
			if (res.items && res.items.length) {
				const item = res.items[0];
				const ids = hostItem.ids[item.layerID];
				const pArr = item.items;
				const layerID = item.layerID;
				const hoverId = pArr[ids.tileAttributeIndexes.gmx_id];
				newHover = {
					layerID,
					hoverId
				};
				// DataVersion.setHover({
					// layerID: item.layerID,
					// hoverId: pArr[ids.tileAttributeIndexes.gmx_id]
				// });
			} else {
				newHover = {};
			}
			let needScan = hover.layerID !== newHover.layerID || hover.hoverId !== newHover.hoverId;
			hover = newHover;
			DataVersion.setHover(hover);
// console.log('eventCheck111', needScan, hover, res);
		}
		return out;
	});
	Observer.waitCheckObservers();
	// DataVersion.now();
	return prom;
};

export default {
	mousemove
};