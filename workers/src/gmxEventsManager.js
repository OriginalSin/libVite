import Store from './Store';

const mousemove = async (pars) => {
	let vLayers = [];
	Object.values(Store.hosts).forEach(host => {
		const ids = host.ids,
			layersByID = host.parseLayers.layersByID;
		
		Object.values(ids).forEach(it => {
			const id = it.layer.id,
				props = layersByID[id];
			vLayers.push({...it, props});
		});
	});
	vLayers = vLayers.sort((a, b) => b.props.zIndex - a.props.zIndex);
	let out = [];
	for (let i = 0, len = vLayers.length; i < len; i++) {
		const it = vLayers[i];
		const res = await it.layer.sendMessage(pars);
		if (res.items.length) out.push({layerID: it.id, items: res.items});
		// const items = await it.layer.worker.postMessage(pars);
// console.log('hhh', out);
	}
// console.log('pars', vLayers, pars);
	return Promise.resolve({...pars, items: out});
};

export default {
	mousemove
};