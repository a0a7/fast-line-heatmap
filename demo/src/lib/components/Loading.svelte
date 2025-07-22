<script lang="ts">
	import { SyncLoader } from 'svelte-loading-spinners';
	import WordmarkLogo from './WordmarkLogo.svelte';
</script>

<div
	class="absolute w-screen h-screen top-0 left-0 z-50 flex flex-col items-center justify-center bg-background overflow-x-hidden"
>
	<WordmarkLogo />
	<div class="mt-[75px] flex flex-col items-center text-muted-foreground">
		<SyncLoader size="60" color="#313c47" unit="px" duration="1s" />
		<h2 class="py-4 mx-4">
			The&nbsp;page&nbsp;is&nbsp;now&nbsp;loading. This&nbsp;shouldn't&nbsp;take&nbsp;long.
		</h2>
		<h3>Experiencing&nbsp;issues?</h3>
		<h3>
			Report&nbsp;them&nbsp;on&nbsp;<a
				href="https://github.com/sudolev/StravaMultiMapper"
				target="_blank"
				rel="noopener noreferrer">GitHub</a
			>&nbsp;or&nbsp;<a
				href="https://discord.gg/5P3AYFrwQG"
				target="_blank"
				rel="noopener noreferrer">Discord</a
			>.
		</h3>
	</div>
</div>
