<script>
    import { tick, beforeUpdate, onMount, onDestroy } from 'svelte';

    const map = L.gmx.map;
	const mapCont = map.getContainer();
	const classList = document.body.classList;
	let ptype = 'landscape';

    async function close() {
		classList.remove('printMap');
		map._printInst.$destroy();
		await tick();
		map.invalidateSize();
    }
	beforeUpdate(() => {
		if (ptype === 'portrait') classList.add('portrait');
		else classList.remove('portrait');
		map.invalidateSize();
	});
	onMount(() => {
		classList.add('printMap');
	});
	onDestroy(() => {
		classList.remove('printMap');
	});

</script>

<div class="print-ui">
	<span class="print-ui-inner">
		<button on:click|preventDefault|stopPropagation={close}>Закрыть</button>
		<button on:click={() => window.print()} class="print">Печать</button>
		<span class="layoutContainer">
			<label>
				<input bind:group={ptype} type="radio" value="portrait">портретная
			</label>
			<label>
				<input bind:group={ptype} type="radio" value="landscape">альбомная
			</label>
		</span>
	</span>
</div>

<style>
:root {
  --print-big: 1150px;
  --print-small: calc(1150px / 1.4142);
}
.print-ui.disabled {
	display: none;
}
.print-ui {
    position: absolute;
    top: 18px;
    left: 0px;
    right: 0px;
    text-align: center;
    user-select: none;
	z-index: 401;
}
.print-ui-inner {
    background: rgba(255, 255, 255, 0.9);
    padding: 15px;
}
</style>
