<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import '$lib/components/sidebar/svg-styles.css';
	import { mode, toggleMode } from 'mode-watcher';

	export let onMobile: boolean;
</script>

<div class="mt-[144px] md:mt-24 flex-grow relative">
	<div class="absolute bottom-10">
		<div class="relative flex items-center">
			<Button
				class="py-[6px] px-[10px] bg-card hover:bg-muted border"
				on:click={() => {
					toggleMode();
				}}
			>
				{#if $mode === 'dark'}
					<svg
						class="svg-icon feather feather-moon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="black"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line
							x1="12"
							y1="21"
							x2="12"
							y2="23"
						/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
							x1="18.36"
							y1="18.36"
							x2="19.78"
							y2="19.78"
						/><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line
							x1="4.22"
							y1="19.78"
							x2="5.64"
							y2="18.36"
						/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg
					>
				{:else}
					<svg
						class="svg-icon feather feather-moon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="black"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg
					>
				{/if}
			</Button>
			<h5 class="mx-2 leading-[1.125] mb-1 md:w-full">
				Multi-activity&nbsp;mapper<img
					src="img/icon/logo_outline.png"
					alt="Strava Multi-activity Mapper Logo"
					class="w-5 h-5 ml-1 mr-[3px] inline dark:brightness-[10] -translate-y-px"
				/>
				by&nbsp;<a
					href="https://github.com/"
					target="_blank"
					rel="noopener noreferrer"
					class="text-secondary">Alexander&nbsp;Weimer</a
				>
			</h5>
		</div>
		{#if onMobile}
			<h5 class="text-secondary opacity-35 w-full mt-4">
				© {new Date().getFullYear()} Alexander Weimer
			</h5>
		{/if}
	</div>
</div>
