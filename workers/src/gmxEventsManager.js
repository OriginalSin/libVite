import DataVersion from './DataSourceVersion';
import Observer from './Observer';

const mousemove = (pars) => {
	const {hostName = 'maps.kosmosnimki.ru'} = pars;
	const host = DataVersion.hosts[hostName];
	if (!host || !host.ids) return new Promise((resolve => resolve));

	const prom = Observer.add({ type: 'mousemove', ...pars}).then(res => {
		const out = {from: pars};
		DataVersion.setHover({});
		if (Object.keys(res).length) {
			out.items = res;
			if (res.items && res.items.length) {
				const item = res.items[0];
				const ids = host.ids[item.layerID];
				const pArr = item.items;
				DataVersion.setHover({
					layerID: item.layerID,
					hoverId: pArr[ids.tileAttributeIndexes.gmx_id]
				});
// console.log('eventCheck', res, host);
			}
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