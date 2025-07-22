<script lang="ts">
	import { createTable, createRender, Render, Subscribe } from 'svelte-headless-table';
	import {
		addPagination,
		addSortBy,
		addTableFilter,
		addHiddenColumns,
		addSelectedRows // @ts-expect-error: this import does exist
	} from 'svelte-headless-table/plugins';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table'; // @ts-expect-error: this import does exist
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down'; // @ts-expect-error: this import does exist
	import ChevronDown from 'lucide-svelte/icons/chevron-down'; // @ts-expect-error: this import does exist
	import CaretSort from 'svelte-radix/CaretSort.svelte';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import ActivityDescriptionCell from './ActivityDescriptionCell.svelte';
	import DataTableCheckbox from './DataTableCheckbox.svelte';

	import type { StravaActivity } from '$lib/activities';

	export let activityData: StravaActivity[];
	const table = createTable(readable(activityData), {
		sort: addSortBy({ disableMultiSort: true }),
		filter: addTableFilter({
			// @ts-expect-error: It's chill
			fn: ({ filterValue, value }) => value.includes(filterValue)
		}),
		hide: addHiddenColumns(),
		select: addSelectedRows()
	});
	const columns = table.createColumns([
		table.column({
			accessor: (item) => item,
			header: 'Name',
			id: 'name',
			cell: ({ value: { name, sport_type, id, commute } }) =>
				createRender(ActivityDescriptionCell, { name, id, sport_type }),
			plugins: {
				sort: {
					getSortValue({ name }: { name: string }) {
						return name;
					}
				},
				filter: {
					exclude: false,
					getFilterValue({ name }: { name: string }) {
						return name.toLowerCase();
					}
				}
			}
		}),
		table.column({
			accessor: 'distance',
			header: 'Distance',
			cell: ({ value }) => {
				if (value === 0) {
					return '-';
				}
				return (
					(value / 1000).toFixed(
						Math.max(0, 2 - (value === 0 ? -1 : Math.floor(Math.log10(value))))
					) + ' km'
				);
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'total_elevation_gain',
			header: 'Elevation',
			cell: ({ value }) => {
				if (value === 0) {
					return '-';
				}
				return `${value.toFixed(0)} m`;
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'kilojoules',
			header: 'Calories',
			cell: ({ value }) => {
				if (value === undefined) {
					return '-';
				}
				return `${(value / 4.18).toFixed(0)} kcal`;
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'average_speed',
			header: 'Average Speed',
			cell: ({ value }) => {
				if (value === 0) {
					return '-';
				}
				return `${(value * 3.6).toFixed(0)} kmh`;
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'average_watts',
			header: 'Average Power',
			cell: ({ value }) => {
				if (value === undefined) {
					return '-';
				}
				return `${value.toFixed(0)} W`;
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'average_heartrate',
			header: 'Average Heartrate',
			cell: ({ value }) => {
				if (value === undefined) {
					return '-';
				}
				return value.toFixed(0);
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: 'start_date_local',
			header: 'Date',
			cell: ({ value }) => {
				return new Date(value).toLocaleDateString();
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: ({ id }) => id,
			header: '',
			id: 'idString',
			plugins: {
				filter: {
					exclude: true
				}
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates, flatColumns, rows } =
		table.createViewModel(columns);
	
	console.log('activityData:', activityData);
	console.log('Page Rows:', $pageRows);

	const ids = flatColumns.map((col) => col.id);

	// const { pageIndex, hasNextPage, hasPreviousPage } = pluginStates.page;
	const { filterValue } = pluginStates.filter;
	const { hiddenColumnIds } = pluginStates.hide;
	const { selectedDataIds } = pluginStates.select;
	const { sortKeys } = pluginStates.sort;

	const colsHiddenByDefault = [
		'total_elevation_gain',
		'average_speed',
		'average_heartrate',
		'kilojoules',
		'average_watts',
		'idString'
	];

	const hidableCols = [
		'distance',
		'elevation',
		'kilojoules',
		'average_speed',
		'average_watts',
		'average_heartrate',
		'start_date_local'
	];
	let hideForId = Object.fromEntries(ids.map((id) => [id, !colsHiddenByDefault.includes(id)]));
	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);
</script>

<div class="mx-5">
	<div class="flex items-center py-4">
		<Input
			class="max-w-72 mr-4 bg-background"
			placeholder="Search activities..."
			type="text"
			bind:value={$filterValue}
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="ml-auto" builders={[builder]}>
					Columns <ChevronDown class="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hidableCols.includes(col.id)}
						<DropdownMenu.CheckboxItem bind:checked={hideForId[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<ScrollArea class="h-[225px] md:h-[336px] rounded-md border" orientation="both">
		<Table.Root {...$tableAttrs} class="bg-background">
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs} class="pr-0 [&:has([role=checkbox])]:pl-3">
										<Button variant="ghost" on:click={props.sort.toggle} class="px-[0.75rem]">
											<Render of={cell.render()} />
											<CaretSort
												class={cn(
													$sortKeys[0]?.id === cell.id && 'text-foreground',
													'ml-2 h-4 w-4'
												)}
											/>
										</Button>
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs} data-state={$selectedDataIds[row.id] && 'selected'} class="">
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell
										{...attrs}
										class={cell.id === 'name' ? 'truncate max-w-40 min-w-2' : ''}
									>
										<Render of={cell.render()} />
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</ScrollArea>
</div>
