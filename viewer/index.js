import './viewer.css';
import LayersTree from './LayersTree/index.js'
import Print from './Print/index.js'
import { _dateInterval } from './stores.js';

const init = () => {
	LayersTree();
	Print();
}
const setData = (data) => {
	if (data.dateInterval) {
		_dateInterval.update(data.dateInterval);
	}
}
export default {
	setData,
	init
}
