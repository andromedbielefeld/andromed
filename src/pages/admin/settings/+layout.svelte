<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Settings } from 'lucide-svelte';

  // Tabs-Verwaltung
  const tabs = [
    { id: 'untersuchungstypen', label: 'Untersuchungstypen', path: '/admin/settings/untersuchungstypen' },
    { id: 'versicherungsarten', label: 'Versicherungsarten', path: '/admin/settings/versicherungsarten' }
  ];

  let activeTab = '';

  // Beim Laden der Komponente den aktiven Tab basierend auf der URL setzen
  $: {
    const currentPath = $page.url.pathname;
    const matchingTab = tabs.find(tab => currentPath.includes(tab.id));
    if (matchingTab) {
      activeTab = matchingTab.id;
    } else if (currentPath === '/admin/settings') {
      activeTab = 'untersuchungstypen'; // Default-Tab
    }
  }
</script>

<div class="settings-page">
  <header class="settings-header">
    <div class="icon-wrapper">
      <Settings class="h-6 w-6" />
    </div>
    <h1 class="text-2xl font-semibold">Einstellungen</h1>
  </header>

  <div class="tabs-container">
    <div class="tabs">
      {#each tabs as tab}
        <a 
          href={tab.path}
          class="tab {activeTab === tab.id ? 'active' : ''}"
        >
          {tab.label}
        </a>
      {/each}
    </div>
  </div>

  <div class="content">
    <slot></slot>
  </div>
</div>

<style>
  .settings-page {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .settings-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.75rem;
    color: #333;
  }

  .tabs-container {
    margin-bottom: 2rem;
    border-bottom: 1px solid #e9ecef;
  }

  .tabs {
    display: flex;
    gap: 1rem;
  }

  .tab {
    padding: 0.75rem 1rem;
    border-bottom: 2px solid transparent;
    color: #495057;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab.active {
    color: #007bff;
    border-bottom-color: #007bff;
  }

  .tab:hover:not(.active) {
    color: #0056b3;
    border-bottom-color: #dee2e6;
  }

  .content {
    min-height: 300px;
  }
</style>