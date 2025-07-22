<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Label } from '$lib/components/ui/label/';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	import { mode } from 'mode-watcher'; // @ts-expect-error: this import does exist
	import Check from 'svelte-radix/Check.svelte'; // @ts-expect-error: this import does exist
	import CaretSort from 'svelte-radix/CaretSort.svelte';
	import QuestionMarkIcon from '$lib/components/QuestionMarkIcon.svelte';

	const basemaps = [
		{
			value: 'light',
			label: 'Light'
		},
		{
			value: 'dark',
			label: 'Dark'
		},
		{
			value: 'summer',
			label: 'Summer'
		},
		{
			value: 'winter',
			label: 'Winter'
		},
		{
			value: 'streets',
			label: 'Streets'
		},
		{
			value: 'satellite',
			label: 'Satellite'
		}
	];

	let open = false;
	let value = $mode === 'light' ? 'light' : 'dark';

	$: selectedValue = basemaps.find((f) => f.value === value)?.label;

	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<div class="flex w-full max-w-[320px] flex-col gap-0.5">
	<Label for="basemap-select" class="pl-2 block select-none text-sm font-medium"
		>Basemap Appearance
		<div class="transform translate-y-[1px] inline-block">
			<QuestionMarkIcon content="Changes the appearence of the map" />
		</div></Label
	>

	<Popover.Root bind:open let:ids>
		<Popover.Trigger asChild id="basemap-select" let:builder>
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
		<Popover.Content class="w-[200px] p-0">
			<Command.Root>
				<Command.Group heading="Palettes">
					{#each basemaps.slice(0, 4) as basemap}
						<Command.Item
							value={basemap.value}
							onSelect={(currentValue) => {
								value = currentValue;
								closeAndFocusTrigger(ids.trigger);
							}}
						>
							{basemap.label}
						</Command.Item>
					{/each}
				</Command.Group>
				<Command.Group heading="Data Sources">
					{#each basemaps.slice(4, 6) as basemap}
						<Command.Item
							value={basemap.value}
							onSelect={(currentValue) => {
								value = currentValue;
								closeAndFocusTrigger(ids.trigger);
							}}
						>
							{basemap.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
