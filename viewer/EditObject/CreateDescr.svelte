<script>
export let showModal;

let dialog;
$: if (dialog && showModal) dialog.showModal();

const ok = (ev) => {
console.log('ok', ev);
	showModal = false;
	dialog.close()
};
const cancel = (ev) => {
	showModal = false;
	dialog.close()
console.log('cancel', ev);
};

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog class="mod"	bind:this={dialog} on:click|self={cancel}>
	<div class="ask">
		Для хранения описаний требуется добавление нового поля к слою
	</div>
	<div class="buttons">
		<button on:click={ok} class="ok">Ok</button>
		<button on:click={cancel} class="cancel">Cancel</button>
	</div>
</dialog>

<style>
	dialog {
	/*	max-width: 800px;*/
		border-radius: 0.2em;
		border: none;
		padding: 0;
	/*	width: 100%;*/
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.buttons {
		text-align: end;
	}
</style>
