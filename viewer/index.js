import './viewer.css';
import LayersTree from './LayersTree/index.js'
import Print from './Print/index.js'

const app = (map) => {
	LayersTree(map);
	Print();
}
export default app
