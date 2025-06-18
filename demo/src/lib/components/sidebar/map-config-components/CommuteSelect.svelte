<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js'; // @ts-expect-error: this import does exist
	import Check from 'svelte-radix/Check.svelte'; // @ts-expect-error: this import does exist
	import CaretSort from 'svelte-radix/CaretSort.svelte';
	import { Label } from '$lib/components/ui/label/';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	import { mode } from 'mode-watcher';
	import QuestionMarkIcon from '$lib/components/QuestionMarkIcon.svelte';

	const commuteStatuses = [
		{
			value: 'dontFilter',
			label: 'All Activities'
		},
		{
			value: 'onlyCommutes',
			label: 'Commutes Only'
		},
		{
			value: 'excludeCommutes',
			label: 'Exclude Commutes'
		}
	];

	let open = false;
	export let value = commuteStatuses[0].value;

	$: selectedValue = commuteStatuses.find((f) => f.value === value)?.label;

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<div class="flex w-full max-w-[320px] flex-col gap-0.5">
	<Label for="commute-status-select" class="pl-2 select-none text-sm font-medium"
		>Filter by Commute Status
		<div class="transform translate-y-[1px] inline-block">
			<QuestionMarkIcon content="Filters activities by their status as a commute or not" />
		</div></Label
	>
	<Popover.Root bind:open let:ids>
		<Popover.Trigger asChild id="commute-status-select" let:builder>
			<Button
				builders={[builder]}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-[200px] justify-between"
			>
				{selectedValue}
				<CaretSort class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-[200px]] p-0">
			<Command.Root>
				<Command.Group>
					{#each commuteStatuses as commuteStatus}
						<Command.Item
							value={commuteStatus.value}
							onSelect={(currentValue) => {
								value = currentValue;
								closeAndFocusTrigger(ids.trigger);
							}}
						>
							{commuteStatus.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
