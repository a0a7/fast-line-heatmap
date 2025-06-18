<script lang="ts">
	import { DateRangePicker, type DateRange } from 'bits-ui';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		today,
		parseDate,
		type DateValue
	} from '@internationalized/date';
	import { cn, flyAndScale } from '$lib/utils.js';
	import type { StravaActivity } from '$lib/activities'; // @ts-expect-error: this import does exist
	import CalendarIcon from 'svelte-radix/Calendar.svelte';
	import QuestionMarkIcon from '$lib/components/QuestionMarkIcon.svelte';

	export let activities: StravaActivity[];

	let earliestDate = activities.length > 0 ? activities.reduce((earliest, current) => {
		return new Date(current.start_date) < new Date(earliest.start_date) ? current : earliest;
	}).start_date : null;

	const df = new DateFormatter('en-US', {
		dateStyle: 'medium'
	});

	let value: DateRange | undefined = {
		start: parseDate(earliestDate ? earliestDate.split('T')[0] : '2007-10-31'),
		end: today(getLocalTimeZone())
	};

	export let startDate;
	export let endDate;

	$: startDate = value?.start?.toString();
	$: endDate = value?.end?.toString();

	let startValue: DateValue | undefined = undefined;
</script>

<div class="inline">
	<DateRangePicker.Root bind:value weekdayFormat="short" fixedWeeks={true}>
		<div class="flex w-fit flex-col gap-0.5">
			<DateRangePicker.Label class="pl-2 block select-none text-sm font-medium"
				>Filter by Date
				<div class="transform translate-y-[1px] inline-block">
					<QuestionMarkIcon content="Filters activities by their start date" />
				</div>
			</DateRangePicker.Label>
			<DateRangePicker.Input
				let:segments
				class="flex h-input w-fit select-none items-center rounded-lg border border-border-input bg-background px-2 py-[1.2px] text-sm tracking-[0.01em] text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover"
			>
				{#each segments.start as { part, value }}
					<div class="inline-block select-none">
						{#if part === 'literal'}
							<DateRangePicker.Segment
								type="start"
								{part}
								class="p-1 text-muted-foreground rouded-md "
							>
								{value}
							</DateRangePicker.Segment>
						{:else}
							<DateRangePicker.Segment
								type="start"
								{part}
								class="rounded-md px-1 py-1 hover:bg-muted focus:bg-muted focus:text-foreground focus-visible:!ring-0 focus-visible:!ring-offset-0 aria-[valuetext=Empty]:text-muted-foreground"
							>
								{value}
							</DateRangePicker.Segment>
						{/if}
					</div>
				{/each}
				<div aria-hidden class="px-1 text-muted-foreground">–</div>
				{#each segments.end as { part, value }}
					<div class="inline-block select-none">
						{#if part === 'literal'}
							<DateRangePicker.Segment
								type="end"
								{part}
								class="p-1 rounded-md text-muted-foreground"
							>
								{value}
							</DateRangePicker.Segment>
						{:else}
							<DateRangePicker.Segment
								type="end"
								{part}
								class="rounded-md px-1 py-1 hover:bg-muted focus:bg-muted focus:text-foreground focus-visible:!ring-0 focus-visible:!ring-offset-0 aria-[valuetext=Empty]:text-muted-foreground"
							>
								{value}
							</DateRangePicker.Segment>
						{/if}
					</div>
				{/each}
				<DateRangePicker.Trigger
					class="ml-auto inline-flex size-8 items-center justify-center rounded-[5px] text-foreground/60 transition-all hover:bg-muted active:bg-dark-10"
				>
					<CalendarIcon class="w-4 h-4" />
				</DateRangePicker.Trigger>
			</DateRangePicker.Input>
			<DateRangePicker.Content sideOffset={6} transition={flyAndScale} class="z-50">
				<DateRangePicker.Calendar
					class="mt-6 rounded-15px border border-dark-10 bg-background-alt p-[22px] shadow-popover"
					let:months
					let:weekdays
				>
					<DateRangePicker.Header class="flex items-center justify-between">
						<DateRangePicker.PrevButton
							class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all hover:bg-muted active:scale-98"
						>
							<div class="w-4 h-4 svg-icon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"
									><path
										d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
									/></svg
								>
							</div>
						</DateRangePicker.PrevButton>
						<DateRangePicker.Heading class="text-[15px] font-medium" />
						<DateRangePicker.NextButton
							class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all hover:bg-muted active:scale-98"
						>
							<div class="w-4 h-4 svg-icon transform rotate-180">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"
									><path
										d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
									/></svg
								>
							</div>
						</DateRangePicker.NextButton>
					</DateRangePicker.Header>
					<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
						{#each months as month}
							<DateRangePicker.Grid class="w-full border-collapse select-none space-y-1">
								<DateRangePicker.GridHead>
									<DateRangePicker.GridRow class="mb-1 flex w-full justify-between">
										{#each weekdays as day}
											<DateRangePicker.HeadCell
												class="w-10 rounded-md text-xs !font-normal text-muted-foreground"
											>
												<div>{day.slice(0, 2)}</div>
											</DateRangePicker.HeadCell>
										{/each}
									</DateRangePicker.GridRow>
								</DateRangePicker.GridHead>
								<DateRangePicker.GridBody>
									{#each month.weeks as weekDates}
										<DateRangePicker.GridRow class="flex w-full">
											{#each weekDates as date}
												<DateRangePicker.Cell
													{date}
													class="relative m-0 size-10 overflow-visible !p-0 text-center text-sm focus-within:relative focus-within:z-20"
												>
													<DateRangePicker.Day
														{date}
														month={month.value}
														class={cn(
															'group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap rounded-9px border border-transparent bg-background bg-transparent p-0 text-sm font-normal text-foreground transition-all hover:border-foreground  focus-visible:!ring-foreground data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[highlighted]:rounded-none data-[selection-end]:rounded-9px data-[selection-start]:rounded-9px data-[highlighted]:bg-muted data-[selected]:bg-muted data-[selection-end]:bg-foreground data-[selection-start]:bg-foreground data-[selected]:font-medium data-[selection-end]:font-medium data-[selection-start]:font-medium data-[disabled]:text-foreground/30 data-[selected]:text-foreground data-[selection-end]:text-background data-[selection-start]:text-background data-[unavailable]:text-muted-foreground data-[unavailable]:line-through data-[selection-start]:focus-visible:ring-2 data-[selection-start]:focus-visible:!ring-offset-2 data-[selected]:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none data-[selected]:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:border-foreground data-[selected]:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:!ring-0 data-[selected]:[&:not([data-selection-start])]:[&:not([data-selection-end])]:focus-visible:!ring-offset-0'
														)}
													>
														<div
															class="absolute top-[5px] hidden size-1 rounded-full bg-foreground transition-all group-data-[today]:block group-data-[selected]:bg-background"
														/>
														{date.day}
													</DateRangePicker.Day>
												</DateRangePicker.Cell>
											{/each}
										</DateRangePicker.GridRow>
									{/each}
								</DateRangePicker.GridBody>
							</DateRangePicker.Grid>
						{/each}
					</div>
				</DateRangePicker.Calendar>
			</DateRangePicker.Content>
		</div>
	</DateRangePicker.Root>
</div>
