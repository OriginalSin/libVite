import DataVersion from './DataSourceVersion';
import Observer from './Observer';

const mousemove = (pars) => {
	const {hostName = 'maps.kosmosnimki.ru'} = pars;
	const host = DataVersion.hosts[hostName];
	if (!host || !host.ids) return new Promise((resolve => resolve));
	
	// const ids = host.ids;
		// const arr = Object.values(ids).filter(it => it.tilesPromise);

	return Observer.addObserver({ type: 'mousemove', ...pars}).then(res => {
		// console.log('eventCheck', res, pars, arr);
		const out = {from: pars};
		if (Object.keys(res).length) out.items = res;
		return out;
	});
		// return {from: pars, ...{hh: 5}};
};

export default {
	mousemove
};