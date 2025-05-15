<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </div>
    <h1>Einstellungen</h1>
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

  h1 {
    font-size: 1.75rem;
    font-weight: 500;
    margin: 0;
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