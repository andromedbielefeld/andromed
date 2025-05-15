/** @type {import('./$types').LayoutLoad} */
export function load() {
  console.log("Settings Layout wurde geladen");
  return {
    tabs: [
      { id: 'untersuchungstypen', label: 'Untersuchungstypen', path: '/admin/settings/untersuchungstypen' },
      { id: 'versicherungsarten', label: 'Versicherungsarten', path: '/admin/settings/versicherungsarten' }
    ]
  };
} 