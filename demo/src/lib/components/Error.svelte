<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	export let content: string;
</script>

<AlertDialog.Root closeOnOutsideClick={true} open={true}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>An error has occured!</AlertDialog.Title>
			<AlertDialog.Description>{content}<br><br><p class="font-bold">Reload the page and try again. If the issue persists, please feel free to report it in my <a href="https://discord.gg/kw7hx73wVA">Discord Server</a> and I'll try my best to fix it.</p>			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Close</AlertDialog.Cancel>
			<!--<AlertDialog.Action on:click={() => window.location.reload()}>Reload</AlertDialog.Action>-->
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
