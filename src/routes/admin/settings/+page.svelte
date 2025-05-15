<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/admin/settings/versicherungsarten');
  });
</script>

<div class="loading">
  Lade Einstellungen...
</div>

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: #6c757d;
  }
</style> 