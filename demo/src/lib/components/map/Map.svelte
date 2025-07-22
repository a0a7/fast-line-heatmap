<script lang="ts">
	// @ ts-nocheck
	import { onMount, onDestroy } from 'svelte';
	// import { mode } from 'mode-watcher'; // Removed due to Svelte 5 compatibility issues
	import {
		MapLibre,
		NavigationControl,
		ScaleControl,
		GeolocateControl,
		FullscreenControl,
		AttributionControl,
		Control,
		ControlButton,
		ControlGroup
	} from 'svelte-maplibre';
	import { MeasurePanel, type MeasureOption } from '@watergis/svelte-maplibre-measure';
	// import '@watergis/maplibre-gl-export/dist/maplibre-gl-export.css'; // Commented out due to missing file
	import '$lib/components/map/map.css';
	import '$lib/components/map/measure-control.css';
	import '$lib/components/map/layers-control.css';
	import maplibregl from 'maplibre-gl';
	import type IControl from 'maplibre-gl';

	export let onMobile: boolean;
	export let map: any;
	export let loaded: boolean;
	let mapDiv: Element;
	let mapResizeObserver: ResizeObserver;
	let measureControl: any, exportControl: IControl;
	let layerControlOpen: boolean = false;
	let currentTheme: string = 'light'; // Simple theme detection

	// Configure Map Baselayers
	let styles = [
		{
			title: 'Positron',
			uri: `./map_styles/light.json`
		},
		{
			title: 'Dark Matter',
			uri: `./map_styles/dark.json`
		},
		{
			title: 'Satellite',
			uri: `./map_styles/satellite.json`
		},

		{
			title: 'Landscape',
			uri: `./map_styles/landscape.json`
		},
		{
			title: 'Topographic',
			uri: `./map_styles/topo.json`
		},
		{
			title: 'Winter',
			uri: `./map_styles/winter.json`
		}
	];
	let selectedStyle = styles[0];

	// Configure Measuring Plugin
	let measureOptions: MeasureOption = {
		tileSize: 512,
		font: ['Roboto Medium'],
		fontSize: 12,
		fontHalo: 1,
		mainColor: '#263238',
		haloColor: '#fff'
	};

	// Properly control map size
	function rigorouslyResizeMap() {
		if (!map || onMobile === undefined) return;
		
		try {
			const mapCanvas = document.getElementsByClassName('maplibregl-map')[0] as HTMLCanvasElement;
			const mapDiv = document.getElementsByClassName('map-pane')[0] as HTMLDivElement;
			const mapBottomControls = [
				document.getElementsByClassName('maplibregl-ctrl-bottom-left')[0] as HTMLDivElement,
				document.getElementsByClassName('maplibregl-ctrl-bottom-right')[0] as HTMLDivElement
			];
			
			// Only resize if map and elements exist
			if (!mapDiv || !map) return;
			
			map.resize(); // Pre-resize helps counteract map flickering
			if (onMobile) {
				mapDiv.style.width = '100vw';
				mapDiv.style.height = `${mapDiv.clientHeight + 5}px`;
				mapBottomControls.forEach((el) => {
					if (el && el.style) {
						el.style.paddingBottom = '15px';
					}
				});
			} else if (!onMobile) {
				mapDiv.style.width = `${mapDiv.clientWidth}px`;
				mapDiv.style.height = '100vh';
				mapBottomControls.forEach((el) => {
					if (el && el.style) {
						el.style.paddingBottom = '0px';
					}
				});
			}
			setTimeout(() => map && map.resize(), 50); // Increased timeout to prevent flickering
		} catch (error) {
			console.warn('Error resizing map:', error);
		}
	}

	// Change map color when theme changes if using positron/dark matte
	$: {
		if (currentTheme) {
			// Done so that the reactive statement is only reactive with regard to theme
			if (currentTheme == 'dark' && selectedStyle == styles[0]) {
				selectedStyle = styles[1];
			} else if (currentTheme == 'light' && selectedStyle == styles[1]) {
				selectedStyle = styles[0];
			}
		}
	}

	// Add image export control when ready (but don't auto-open)
	$: if (
		map &&
		loaded &&
		!exportControl &&
		MaplibreExportControl &&
		Size &&
		PageOrientation &&
		Format &&
		DPI
	) {
		try {
			exportControl = new MaplibreExportControl({
				PageSize: Size.A3,
				PageOrientation: PageOrientation.Landscape,
				Format: Format.PNG,
				DPI: DPI[96],
				Crosshair: true,
				PrintableArea: true,
				Hidden: ['layers-control'] // Hide layer control in exports
			});
			map.addControl(exportControl, 'top-right');
		} catch (error) {
			console.warn('Failed to add export control:', error);
		}
	}

	onMount(async () => {
		// Import browser-only modules
		const styleSwitcherModule = await import('@watergis/svelte-maplibre-style-switcher');
		const exportModule = await import('@watergis/maplibre-gl-export');

		StyleSwitcher = styleSwitcherModule.StyleSwitcher;
		StyleSwitcherControl = styleSwitcherModule.StyleSwitcherControl;
		StyleUrl = styleSwitcherModule.StyleUrl;
		MaplibreExportControl = exportModule.MaplibreExportControl;
		Size = exportModule.Size;
		PageOrientation = exportModule.PageOrientation;
		Format = exportModule.Format;
		DPI = exportModule.DPI;

		// Simple theme detection
		if (typeof window !== 'undefined') {
			currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			if (currentTheme == 'dark') {
				selectedStyle = styles[1];
			}
		}

		// Handle map resizing
		mapDiv = document.getElementsByClassName('map-pane')[0];

		if (mapDiv) {
			mapResizeObserver = new ResizeObserver(() => {
				setTimeout(() => rigorouslyResizeMap(), 100); // Increased timeout for stability
			});

			mapResizeObserver.observe(mapDiv);
			mapResizeObserver.observe(document.body);
		}

		// Handle fullscreen changes
		const handleFullscreenChange = () => {
			setTimeout(() => rigorouslyResizeMap(), 200);
		};
		
		const handleWindowResize = () => {
			setTimeout(() => rigorouslyResizeMap(), 100);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		window.addEventListener('resize', handleWindowResize);

		// Store references for cleanup
		mapDiv.dataset.fullscreenHandler = 'attached';
		mapDiv.dataset.resizeHandler = 'attached';

		map.on('load', () => {
			rigorouslyResizeMap();
		});

		// Clean up function
		const cleanup = () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			window.removeEventListener('resize', handleWindowResize);
		};

		// Store cleanup function reference
		if (mapDiv) {
			(mapDiv as any)._cleanup = cleanup;
		}
	});

	onDestroy(() => {
		if (mapResizeObserver && mapDiv) {
			mapResizeObserver.unobserve(mapDiv);
			mapResizeObserver.unobserve(document.body);
			mapResizeObserver.disconnect();
		}
		
		// Clean up event listeners using stored cleanup function
		if (mapDiv && (mapDiv as any)._cleanup) {
			(mapDiv as any)._cleanup();
		}
	});
</script>

<svelte:head>
	{#each styles as style}
		<link rel="prefetch" href={style.uri} />
	{/each}
</svelte:head>

<MapLibre
	bind:map
	bind:loaded
	center={[15, 30]}
	zoom={1}
	class="map w-full h-full"
	attributionControl={false}
	style={selectedStyle.uri}
>
	<NavigationControl position="top-left" />
	<GeolocateControl position="top-right" fitBoundsOptions={{ maxZoom: 12 }} />
	<FullscreenControl position="top-left" />
	<ScaleControl />
	<AttributionControl
		compact
		customAttribution={`<img src="img/icon/powered_by_strava.svg" class="h-4 inline p-0" title="Powered by Strava" alt="Powered by Strava">`}
	/>
	<Control position="top-right" class="flex flex-col gap-y-2">
		<ControlGroup>
			{#if map}
				<MeasurePanel bind:map bind:measureOption={measureOptions} bind:this={measureControl} />
			{/if}
		</ControlGroup>
	</Control>
	<Control position="top-left" class="flex flex-col gap-y-2">
		<ControlGroup>
			<ControlButton
				on:click={() => {
					layerControlOpen = !layerControlOpen;
					// Only clean up empty controls if we're closing the layer panel
					if (!layerControlOpen) {
						setTimeout(() => {
							document
								.querySelectorAll('.maplibregl-ctrl-top-left .maplibregl-ctrl:empty:not(.maplibregl-ctrl-group)')
								.forEach((el) => el.remove());
						}, 100);
					}
				}}
			>
				<img
					src="img/icon/layer.svg"
					class="p-[3px]"
					alt="Switch Map Baselayers"
					title="Map Layers"
					style={layerControlOpen
						? 'filter: invert(22%) sepia(17%) saturate(1191%) hue-rotate(164deg) brightness(93%) contrast(87%);'
						: ''}
				/>
			</ControlButton>
			{#if map && layerControlOpen && StyleSwitcher && StyleSwitcherControl && StyleUrl}
				<StyleSwitcherControl bind:map bind:styles bind:selectedStyle position="top-left" />
			{/if}
		</ControlGroup>
	</Control>
</MapLibre>
