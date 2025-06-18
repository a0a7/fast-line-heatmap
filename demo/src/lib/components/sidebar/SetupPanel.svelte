<script lang="ts">
	import { onMount } from 'svelte'; // @ts-expect-error: this import does exist
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { mode } from 'mode-watcher';

	import { SyncLoader } from 'svelte-loading-spinners';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Separator } from '$lib/components/ui/separator';
	import ErrorNotice from '$lib/components/Error.svelte';
	import '$lib/components/sidebar/svg-styles.css';
	import '$lib/activities';

	import { Head } from '$lib/components/ui/table';
	import type { StravaActivity } from '$lib/activities';
	import ActivityTable from '$lib/components/activityTable/ActivityTable.svelte';
	import MapConfigPanel from '$lib/components/sidebar/MapConfigPanel.svelte';
	import type Map from '$lib/components/map/Map.svelte';
	import polyline from '@mapbox/polyline';
	import maplibregl from 'maplibre-gl';
	import { Deck } from '@deck.gl/core';
	import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
	import { GeoJsonLayer } from '@deck.gl/layers';

	export let map: Map;

	let isClient: boolean = false;
	let activityTypeFilter: string;
	let commuteFilter: string;
	let dateRangeMinFilter: string;
	let dateRangeMaxFilter: string;
	let showPrivate: boolean;

	let mapLoaded: boolean = false;
	let activities: StravaActivity[] = [];
	let error: string | null = null;
	let geoJsonData: any[] = [];
	let visualizationLayer: any;
	let visualizationDeck: any;
	let popup: any, startIcon: any, endIcon: any;
	let allGeojsonFeatures: any = [];
	let heatmapCoords: any = [];
	let coordsFlat: any = [];
	let startIconEl: HTMLImageElement, endIconEl: HTMLImageElement;
	let loading: boolean = true;

	async function getActivities() {
		try {
			if (
				// @ts-expect-error: Exists at runtime.
				$page.data?.session?.access_token &&
				new Date($page.data?.session?.expires) > new Date()
			) {
				const promises = Array.from({ length: 15 }, (_, i) =>
					fetch(
						// @ts-expect-error: Exists at runtime.
						`https://www.strava.com/api/v3/athlete/activities?access_token=${$page.data?.session?.access_token}&per_page=100&page=${i + 1}`
					).then((response) => {
						if (!response.ok) {
							throw new Error('HTTP Status ' + response.status);
						}
						return response.json();
					})
				);
				const allActivities = await Promise.all(promises);
				activities = allActivities.flat();
				loading = false;

				let allCoordsArray: any = [];
				for (const activity in activities) {
					let coords = polyline
						.decode(activities[activity].map.summary_polyline)
						.map((coord: number[]) => [coord[1], coord[0]]);
					coordsFlat.push(...coords);
					allCoordsArray.push(
						{
							type: 'Feature',
							properties: { 
								id: activities[activity].id, 
								name: activities[activity].name,
								type: activities[activity].type,
								date: activities[activity].start_date_local, 
								time: activities[activity].moving_time,
								dist: activities[activity].distance, 
								speed: activities[activity].average_speed,
								elev: activities[activity].total_elevation_gain,
								average_watts: activities[activity].average_watts,
								average_heartrate: activities[activity].average_heartrate,
							},
							geometry: {
								type: 'LineString',
								coordinates: coords
							}
						}
					)
				}
				heatmapCoords = coordsFlat;
				console.log(heatmapCoords.length);
				allGeojsonFeatures = allCoordsArray;
				localStorage.setItem('activities', JSON.stringify(activities));
				localStorage.setItem('heatmapCoords', JSON.stringify(heatmapCoords));
				localStorage.setItem('allGeojsonFeatures', JSON.stringify(allGeojsonFeatures));
			} else {
				console.error('No access token found in session data. Reload page and try again.');
			}
		} catch (err) {
			error = String(err);
			console.error(err);
		}
	}
	onMount(() => {
		isClient = true;
		if (localStorage.getItem('allGeojsonFeatures')) {
			allGeojsonFeatures = JSON.parse(localStorage.getItem('allGeojsonFeatures')!);
		}
		if (localStorage.getItem('heatmapCoords')) {
			heatmapCoords = JSON.parse(localStorage.getItem('heatmapCoords')!);
		}
		if (localStorage.getItem('activities')) {
			activities = JSON.parse(localStorage.getItem('activities')!);
		}
		if ((allGeojsonFeatures.length == 0) || (heatmapCoords.length == 0) || (activities.length == 0)) {
			console.log('Requesting activities from Strava');
			getActivities();
		}
		console.log(allGeojsonFeatures);
		endIconEl = document.createElement('img');
		endIconEl.src = 'img/map/trace_end.png';
		endIconEl.width = 20;
		startIconEl = document.createElement('img');
		startIconEl.src = 'img/map/trace_start.png';
		startIconEl.width = 20;
	});
	$: if (isClient && allGeojsonFeatures && heatmapCoords) {
		for (const feature in allGeojsonFeatures) {
			if (!geoJsonData.some((e) => e.id === allGeojsonFeatures[feature].properties.id)) {
				geoJsonData.push(
					new GeoJsonLayer({
						id: `${allGeojsonFeatures[feature].properties.id}`,
						data: allGeojsonFeatures[feature],
						pickable: true,
						stroked: true,
						filled: false,
						extruded: true,
						lineWidthScale: 1,
						lineWidthMinPixels: 5,
						lineCapRounded: true,
						lineJointRounded: true,
						getLineColor: [255, 255, 255],
						getPointRadius: 100,
						opacity: 0.6,
						getLineWidth: 0.7,
						getElevation: 0
					})
				);
			}
		}
	}
	$: if (map) {
		map.on('load', () => {
			mapLoaded = true;
		});
	}
	$: if (map && mapLoaded && geoJsonData) {
		if (!visualizationDeck) {
			console.log('geojsondata', geoJsonData);
			visualizationDeck = new DeckOverlay({
				layers: [...geoJsonData]
			});
			map.addControl(visualizationDeck);
		}
	}
</script>

{#if error}
	<ErrorNotice content={error} />
{/if}
<Card.Root>
	<Card.Header>
		<div class="flex flex-row justify-center items-center">
			{#if $page.data.session?.user}
				{#if $page.data.session.user?.image && $page.data.session.user?.name}
					<Avatar.Root class="rounded-xl">
						<Avatar.Image
							src={$page.data.session.user.image}
							alt="{$page.data.session.user.name} Profile picture"
						/>
						<Avatar.Fallback></Avatar.Fallback>
					</Avatar.Root>
					<p class="mx-3 leading-[1.125]">
						Connected&nbsp;to&nbsp;Strava&nbsp;as<br /><b
							>{$page.data.session.user.name.replace(/ /g, '\xa0')}</b
						>
					</p>
				{:else}
					<p>
						Connected to Strava, but with profile information missing. Something probably went wrong
						somewhere and you might want to reload the page.
					</p>
				{/if}
			{/if}
		</div>
	</Card.Header>
	{#if allGeojsonFeatures.length > 0 && !(Object.keys(allGeojsonFeatures[0]).length === 0) && !error}
		<Separator class="mb-3 mx-5 w-[calc(100vw-2.5rem)] md:w-auto" />
		<MapConfigPanel
			activities={activities}
			bind:activityTypeFilter
			bind:commuteFilter
			bind:dateRangeMinFilter
			bind:dateRangeMaxFilter
			bind:showPrivate
		/>
		<Separator class="mt-3 mx-5 w-[calc(100vw-2.5rem)] md:w-auto" />
		<ActivityTable activityData={activities} />
	{:else if allGeojsonFeatures.length == 0 && loading && !error}
		<Card.Content>
			<Separator />
			<div class="flex flex-col justify-center items-center w-full mt-2">
				<div class="pb-8 text-center">
					<p class="mt-3 font-bold text-xl">Now fetching your Strava activities.</p>
					<p class="">
						Depending on how many activities you have, this may take a while. Sit tight!
					</p>
				</div>
				<SyncLoader
					size="55"
					color={$mode == 'dark' ? '#f0f2f5' : '#444'}
					unit="px"
					duration="1.1s"
				/>
			</div>
		</Card.Content>
	{:else if allGeojsonFeatures.length === 1 && Object.keys(allGeojsonFeatures[0]).length === 0 && !error}
		<Card.Content>
			<Separator />
			<div class="flex flex-col justify-center items-center w-full mt-2">
				<div class="pb-8 text-center">
					<p class="mt-3 font-bold text-xl">It looks like something went wrong.</p>
					<p class="">
						Make sure you have at least one activity on Strava and, if your activities are private,
						that you have allowed us to view them. If you have made sure of the above, something
						else has gone wrong. We might be recieving too many requests at the moment, in which
						case you can try again later. If the issue persists, please report it on <a
							href="https://github.com/sudolev/StravaMultiMapper"
							target="_blank"
							rel="noopener noreferrer">GitHub</a
						>
						or
						<a href="https://discord.gg/5P3AYFrwQG" target="_blank" rel="noopener noreferrer"
							>Discord</a
						>.
					</p>
				</div>
			</div>
		</Card.Content>
	{:else}
		<Card.Content>
			<Separator />
			<div class="flex flex-col justify-center items-center w-full mt-2">
				<div class="pb-8 text-center">
					<p class="mt-3 font-bold text-xl">It looks like something went wrong.</p>
					<p class="">
						We weren't able to fetch your activities from Strava. You should try signing out and
						authenticating with Strava again. If that doesn't work, we might be recieving too many
						requests at the moment, in which case you can try again later. If the issue persists,
						please report it on <a
							href="https://github.com/sudolev/StravaMultiMapper"
							target="_blank"
							rel="noopener noreferrer">GitHub</a
						>
						or
						<a href="https://discord.gg/5P3AYFrwQG" target="_blank" rel="noopener noreferrer"
							>Discord</a
						>.
					</p>
				</div>
			</div>
		</Card.Content>
	{/if}
	<Card.Footer>
		<Button
			class="py-[6px] px-[10px] bg-background hover:bg-card dark:hover:bg-muted border flex items-center mx-auto h-10 my-3 px-4"
			on:click={() => {
				localStorage.removeItem('allGeojsonFeatures');
				signOut('strava');
			}}
		>
			<p class="font-bold text-l inline text-black dark:text-white">
				{activities.length > 0 || error ? 'Disconnect from' : 'Cancel & Disconnect from'}
				<span class="svg-icon w-3 inline">
					<svg
						height="16px"
						class="inline pb-1"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 432 91"
					>
						<path
							class="st0"
							d="M74.5 49.5c1.6 2.8 2.5 6.3 2.5 10.4v0.2c0 4.2-0.8 8-2.5 11.4 -1.7 3.4-4.1 6.2-7.1 8.6 -3.1 2.3-6.8 4.1-11.2 5.4 -4.4 1.3-9.3 1.9-14.7 1.9 -8.2 0-15.9-1.1-23-3.4 -7.1-2.3-13.2-5.7-18.3-10.2l14.4-17.1c4.4 3.4 9 5.8 13.8 7.2 4.8 1.5 9.6 2.2 14.4 2.2 2.5 0 4.2-0.3 5.3-0.9 1.1-0.6 1.6-1.5 1.6-2.5v-0.2c0-1.2-0.8-2.1-2.4-2.9 -1.6-0.8-4.5-1.6-8.8-2.4 -4.5-0.9-8.8-2-12.9-3.2 -4.1-1.2-7.7-2.8-10.8-4.7 -3.1-1.9-5.6-4.3-7.4-7.2C5.4 39 4.5 35.4 4.5 31.2V31c0-3.8 0.7-7.4 2.2-10.7 1.5-3.3 3.7-6.2 6.6-8.6 2.9-2.5 6.5-4.4 10.7-5.8 4.2-1.4 9.1-2.1 14.7-2.1 7.8 0 14.7 0.9 20.5 2.8 5.9 1.8 11.1 4.6 15.8 8.3L61.9 33c-3.8-2.8-7.9-4.8-12.1-6.1 -4.3-1.3-8.3-1.9-12-1.9 -2 0-3.5 0.3-4.4 0.9 -1 0.6-1.4 1.4-1.4 2.4v0.2c0 1.1 0.7 2 2.2 2.8 1.5 0.8 4.3 1.6 8.5 2.4 5.1 0.9 9.8 2 14 3.3 4.2 1.3 7.8 3 10.9 5C70.5 44.2 72.9 46.6 74.5 49.5zM75.5 28.1h23.7v57.8h26.9V28.1h23.7V5.3H75.5V28.1zM387.9 0.3l-43.3 85.6h25.8l17.5-34.6 17.6 34.6h25.8L387.9 0.3zM267.3 0.3l43.4 85.6h-25.8l-17.5-34.6 -17.5 34.6h-17.5 -8.3 -22.4l-15.2-23h-0.2 -5.5v23h-26.9V5.3H193c7.2 0 13.1 0.8 17.8 2.5 4.6 1.6 8.4 3.9 11.2 6.7 2.5 2.4 4.3 5.2 5.5 8.3 1.2 3.1 1.8 6.7 1.8 10.8v0.2c0 5.9-1.4 10.9-4.3 14.9 -2.8 4.1-6.7 7.3-11.6 9.7l14 20.4L267.3 0.3zM202.5 35.6c0-2.6-0.9-4.5-2.8-5.8 -1.8-1.3-4.3-1.9-7.5-1.9h-11.7v15.8h11.6c3.2 0 5.8-0.7 7.6-2.1 1.8-1.4 2.8-3.3 2.8-5.8V35.6zM345.2 5.3L327.6 40 310 5.3h-25.8l43.4 85.6 43.3-85.6H345.2z"
						/></svg
					>
				</span>
			</p>
		</Button>
	</Card.Footer>
</Card.Root>
