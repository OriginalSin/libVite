import HeaderWidget from '/viewer/HeaderWidget.svelte'


let headerWidget;
export const destroy = () => {
	headerWidget.$destroy();
}
export const show = () => {
	if (headerWidget) destroy();
	headerWidget = new HeaderWidget({
		target: document.querySelector('.header'),
		  props: {
		 } 
	});
}
