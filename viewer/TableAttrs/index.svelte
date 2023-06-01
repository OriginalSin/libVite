<script>
import Draggable from '../Modal/Draggable.svelte';
import Table from './Table.svelte'

export let layerID;

</script>

<Draggable>
	<Table {layerID} />
</Draggable>

