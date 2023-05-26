import CustomMenu from './CustomMenu.svelte'

const app = () => {
	new CustomMenu({
		target: document.body
	});
}

export default app
