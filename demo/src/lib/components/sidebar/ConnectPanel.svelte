<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Alert from '$lib/components/ui/alert'; // @ts-expect-error: this import does exist
	import { signIn } from '@auth/sveltekit/client';
	import '$lib/components/sidebar/svg-styles.css';

	export let sessionExpired: boolean = false;
</script>

<Card.Root>
	<Card.Header>
		{#if sessionExpired}
			<p>
				Your Strava session has expired. Please re-authorize your account to import your activities.
			</p>
		{:else}
			<p>
				To map your activities, you will first need to let us <b
					>import your activities from Strava.</b
				> Click below to be taken to Strava's authorization page.
			</p>
		{/if}
	</Card.Header>
	<Card.Content>
		<Button
			class="bg-[#FC4C02] hover:bg-[#d14002] flex items-center mx-auto px-0 h-10 my-3"
			on:click={() => signIn('strava')}
		>
			<img src="img/icon/connect_with_strava.svg" alt="Connect with Strava" class="h-14" />
		</Button>
	</Card.Content>
	<Card.Footer>
		<Alert.Root>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 512 512"
				aria-label="shield"
				class="svg-icon h-4 w-4 inline"
			>
				<path
					d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z"
				/>
			</svg>
			<Alert.Title><b class="font-large">Worried about privacy?</b></Alert.Title>
			<Alert.Description>
				<p>
					This app doesn't store any of your data, full stop. We are committed to upholding the
					highest privacy standard possible--if you want to know more, read our privacy assurance <a
						href="https://github.com/syslev/StravaMultiMapper/blob/main/privacy_policy.md"
						target="_blank"
						rel="noopener noreferrer">here</a
					>.
				</p>
				<p>
					This app is <a
						href="https://github.com/sudolev/StravaMultiMapper"
						target="_blank"
						rel="noopener noreferrer">open-source</a
					>
					under the
					<a
						href="https://github.com/sudolev/StravaMultiMapper/blob/main/LICENSE"
						target="_blank"
						rel="noopener noreferrer">GPL-3.0 license</a
					>.
				</p>
			</Alert.Description>
		</Alert.Root>
	</Card.Footer>
</Card.Root>
