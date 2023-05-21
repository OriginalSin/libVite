<script>
    import './DateRange.css';
    // import { imask } from '@imask/svelte';
    // import Calendar from '../Calendar/Calendar.svelte';
    import { onMount, createEventDispatcher } from 'svelte';
	import { _dateInterval } from '../stores.js';

    const dispatch = createEventDispatcher();

    // export let dateInterval = {};
    export let value = '';
    // export let position = 'bottom';
    export let exchange = false;
    export let className = '';

	let begin,
		end;
    let dateInterval = {};
	_dateInterval.subscribe(value => {
		dateInterval = value;
		console.log('gg', dateInterval);
	});

    $: exchange && (value = exchange) && dispatch('notify', value);

	const day = 24*3600*1000;
	// let begin = (dateInterval.begin || new Date()).toLocaleDateString();
	// let begin = new Date(dateInterval.begin).toISOString().slice(0, 10);
	// let end = new Date(dateInterval.end).toISOString().slice(0, 10);
	// let bd = new Date(dateInterval.begin || Date.now());
	// let begin = bd.toISOString().slice(0, 10);
	// let end = new Date(dateInterval.end || Date.now()).toISOString().slice(0, 10);
    let open = false,
        mouseMove = false,
		timeIcon = L.gmxUtil.setSVGIcon('time'),
		warns = {},
		btime = '00',
		etime = '24',
        placeholder = 'День / Месяц / Год',
        svgCalendar,
        input;

	const check = () => {
        warns = {...warns,
            begin: dateInterval.begin > dateInterval.end,
            end: dateInterval.begin > dateInterval.end
        };
        // console.log('check', warns)
	};
    $: dateInterval && (
		begin = new Date(dateInterval.begin || Date.now()).toISOString().slice(0, 10),
		end = new Date(dateInterval.end || Date.now()).toISOString().slice(0, 10)
	) && check();

    onMount(() => {
		L.gmx.gmxMap.setDateIntervals({
			begin: dateInterval.begin / 1000,
			end: dateInterval.end / 1000
		});
    });

    function close(e) {
        open = false;
        input.focus();
        dispatch('notify', e.detail)
    }

    function change(e) {
		const target = e.target;
		let val = target.value;
		if (val && target.classList.contains('date')) {
			val = new Date(val).valueOf();
			if (val < 0) return;
			if (target.classList.contains('begin')) {
				dateInterval.begin = val;
			} else if (target.classList.contains('end')) {
				dateInterval.end = val;
			}
		} else if (target.classList.contains('btime')) {
			btime = (Array(2).join('0') + val).slice(-2);
		} else if (target.classList.contains('etime')) {
			etime = (Array(2).join('0') + val).slice(-2);
		} else if (target.classList.contains('left')) {
			dateInterval.begin -= day;
			dateInterval.end -= day;
		} else if (target.classList.contains('right')) {
			dateInterval.begin += day;
			dateInterval.end += day;
		}
		L.gmx.gmxMap.setDateIntervals({
			begin: dateInterval.begin / 1000,
			end: (dateInterval.end + 0) / 1000
		});
        console.log('change', target.onfocus, dateInterval)
    }

    // document.addEventListener('click', e => {
        // const dateRanges = document.querySelectorAll('.date-range-container > .calendar.active');
        // dateRanges?.forEach(el => {
            // if (!e.target.closest('.date-range-container')) {
                // const click_ev = document.createEvent('MouseEvents');
                // click_ev.initEvent('click', true, true);
                // el.dispatchEvent(click_ev);
            // }
        // });
    // });
// const optHours = (Array(25).join().split(',').map((it, i) => '<option value="' + (Array(2).join("0") + i).slice(-2) + '"></option>')).join('');
</script>

<div class='date-range-container {className} {open ? 'active' : ''}'>
	<span on:click={change} class="icon date left"></span>
    <input value={begin} max={end} on:blur={change} class="begin date {warns?.begin ? 'warn' : ''} {mouseMove ? 'active' : ''}" type='date' placeholder />
    <input value={end} min={begin} on:blur={change} class="end date {warns?.end ? 'warn' : ''} {mouseMove ? 'active' : ''}" type='date' placeholder />
	<span on:click={change} class="icon date right"></span>
	<span class="time">
		{@html timeIcon}
		<input value="{btime}" on:change={change} class="btime" type="number" min=0 max=24 />
		<span>-</span>
		<input value="{etime}" on:change={change} class="etime" type="number" min=0 max=24 />
	</span>
	<div class="sync-type">
		<span class="itypeTxt"><input on:change={change} class="itype" type="checkbox" checked=true />Единый интервал для слоев</span>
		<span class="dailyTxt"><input on:change={change} class="daily" type="checkbox" checked=true />посуточно</span>
	</div>
</div>
<style>


</style>
