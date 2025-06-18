<script lang="ts">
	import { getActivityIconURL, getCommuteIconURL } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import '$lib/components/sidebar/svg-styles.css';

	export let name: string;
	export let id: number;
	export let sport_type: string;
	// export let commute: boolean;
</script>
<a href={`https://www.strava.com/activities/${id}`} target="_blank" rel="noopener noreferrer">
<div class="flex">
	<p class="inline-block truncate">{name}</p>
	<Tooltip.Root openDelay={50}>
		<Tooltip.Trigger>
			<div class="inline-block mx-1 w-4 h-4 translate-y-1">
				{@html getActivityIconURL(sport_type)}
			</div>
		</Tooltip.Trigger>
		<Tooltip.Content class="bg-card">
			<p>{sport_type.replace(/(?<!^)([A-Z])/g, ' $1')}</p>
		</Tooltip.Content>
	</Tooltip.Root>
	<!-- Commute Icon
    <div class="svg-icon inline-block w-3 h-3 left-4 translate-y-[6px]">
        {@html getCommuteIconURL(commute)}
    </div>-->
</div>
</a>