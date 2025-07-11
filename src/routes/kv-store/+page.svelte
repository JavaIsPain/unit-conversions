<script>
    import { onMount } from 'svelte';

    let apiKey = '';
    let keys = [];
    let values = {}; // To store key-value pairs
    let isLoading = false;
    let error = '';

    const API_BASE_URL = 'https://kv.p.sulu.sh/v1/kv-store';

    async function fetchAllKeys() {
        if (!apiKey) {
            error = 'API Key is required to fetch keys.';
            keys = [];
            values = {};
            return;
        }
        isLoading = true;
        error = '';
        keys = [];
        values = {};

        try {
            const response = await fetch(`${API_BASE_URL}/`, {
                method: 'GET',
                headers: {
                    'X-Api-Key': apiKey,
                },
            });

            if (response.status === 401) {
                error = 'Unauthorized. Please check your API Key.';
                isLoading = false;
                return;
            }
            if (response.status === 404) { // According to docs, 404 if no keys
                keys = [];
                isLoading = false;
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch keys. Unknown error.' }));
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            }

            const fetchedKeys = await response.json();
            if (Array.isArray(fetchedKeys) && fetchedKeys.length > 0) {
                keys = fetchedKeys;
                await fetchValuesForKeys(keys);
            } else {
                keys = []; // No keys found or empty array returned
            }
        } catch (e) {
            console.error('Error fetching keys:', e);
            error = e.message || 'An unexpected error occurred while fetching keys.';
            keys = []; // Clear keys on error
        } finally {
            isLoading = false;
        }
    }

    async function fetchValuesForKeys(keysToFetch) {
        if (!apiKey) return; // Should not happen if called from fetchAllKeys with apiKey check

        // Create a temporary values object to batch updates for reactivity
        let newValues = {};

        for (const key of keysToFetch) {
            try {
                const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(key)}`, {
                    method: 'GET',
                    headers: {
                        'X-Api-Key': apiKey,
                    },
                });

                if (response.status === 401) {
                    // This error would ideally be caught at fetchAllKeys, but good to have a check
                    error = 'Unauthorized. API Key may have become invalid.';
                    // Potentially stop fetching further values if one fails due to auth
                    break;
                }
                if (!response.ok) {
                    // Log error for specific key, but try to continue for others
                    console.error(`Failed to fetch value for key: ${key}. Status: ${response.status}`);
                    newValues[key] = 'Error fetching value';
                    continue;
                }

                // Assuming the value is returned as plain text based on typical KV store behavior.
                // If it's JSON, this needs to be response.json()
                const value = await response.text();
                newValues[key] = value;

            } catch (e) {
                console.error(`Error fetching value for key ${key}:`, e);
                newValues[key] = 'Error fetching value';
            }
        }
        // Update the main values object once after all fetches
        values = {...values, ...newValues};
    }

    function handleRefresh() {
        if (apiKey) {
            fetchAllKeys();
        } else {
            error = 'Please enter an API Key.';
            keys = [];
            values = {};
        }
    }

    onMount(() => {
        const storedApiKey = localStorage.getItem('kvUserApiKey');
        if (storedApiKey) {
            apiKey = storedApiKey;
            // Optionally, automatically fetch keys if an API key is found
            // handleRefresh();
        }
    });

    $: {
        if (apiKey) {
            localStorage.setItem('kvUserApiKey', apiKey);
        } else {
            // If API key is cleared, remove it from localStorage
            localStorage.removeItem('kvUserApiKey');
        }
    }

</script>

<div class="max-w-xl mx-auto my-10 p-8 bg-slate-50 rounded-xl shadow-2xl space-y-8">
    <h1 class="text-2xl font-semibold text-slate-700 text-center">Key-Value Store</h1>

    <div class="space-y-4">
        <div>
            <label for="apiKey" class="block text-sm font-medium text-slate-700 mb-1">API Key</label>
            <div class="relative">
                <input
                    type="password"
                    id="apiKey"
                    bind:value={apiKey}
                    class="w-full p-4 bg-slate-100 border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150 ease-in-out hover:bg-slate-200 placeholder-slate-400 pr-10"
                    placeholder="Enter your API Key"
                />
                {#if apiKey}
                <button
                    on:click={() => apiKey = ''}
                    class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
                    aria-label="Clear API Key"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {/if}
            </div>
            <p class="mt-1 text-xs text-slate-500">
                Your API Key is stored in your browser's localStorage. For production applications, consider more secure storage methods.
            </p>
        </div>
        <div class="flex justify-center">
            <button
                on:click={handleRefresh}
                disabled={isLoading || !apiKey}
                class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {#if isLoading}
                    <span>Loading...</span>
                {:else}
                    <span>Refresh Keys & Values</span>
                {/if}
            </button>
        </div>
    </div>

    {#if error}
        <p class="text-red-500 text-sm text-center">{error}</p>
    {/if}

    {#if keys.length > 0}
        <div class="space-y-4 pt-6 border-t border-slate-200">
            <h2 class="text-xl font-semibold text-slate-700">Stored Data</h2>
            {#each keys as key (key)}
                <div class="p-4 bg-slate-100 rounded-lg shadow">
                    <p class="font-medium text-indigo-600 break-all"><strong>Key:</strong> {key}</p>
                    <p class="text-slate-700 break-all"><strong>Value:</strong> {values[key] || 'Loading value...'}</p>
                </div>
            {/each}
        </div>
    {:else if apiKey && !isLoading && !error}
        <p class="text-slate-500 text-center pt-6 border-t border-slate-200">No keys found for this API Key or data hasn't been loaded yet.</p>
    {/if}
</div>
