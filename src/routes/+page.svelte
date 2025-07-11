<script>
    import { onMount } from 'svelte';

    export let data;
    let { categories } = data;
    let selectedCategory = categories[0] || 'angle';
    let units = [];
    let fromUnit = '';
    let toUnit = '';
    let fromValue = '';
    let result = '';
    let isLoading = false;

    let timeoutId;

    async function fetchUnits(category) {
        try {
            const response = await fetch(`/api/unit?category=${category}`);
            if (response.ok) {
                const data = await response.json();
                units = data.units;
                setDefaultUnits();
            } else {
                console.error('Failed to fetch units');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function setDefaultUnits() {
        if (units.length > 1) {
            fromUnit = units[0];
            toUnit = units[1];
        } else if (units.length === 1) {
            fromUnit = toUnit = units[0];
        } else {
            fromUnit = toUnit = '';
        }
    }

    function handleCategoryChange() {
        fetchUnits(selectedCategory);
    }

    function handleUnitChange(event, isFromUnit) {
        const newValue = event.target.value;

        if (isFromUnit) {
            if (newValue === toUnit) {
                toUnit = fromUnit;
            }
            fromUnit = newValue;
        } else {
            if (newValue === fromUnit) {
                fromUnit = toUnit;
            }
            toUnit = newValue;
        }
    }

    async function handleConversion() {
        if (!fromValue || !fromUnit || !toUnit) return;

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: selectedCategory,
                    fromUnit,
                    toUnit,
                    fromValue: parseFloat(fromValue)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            result = data.result.toFixed(data.metadata.precision);
        } catch (error) {
            console.error('Conversion error:', error);
            result = 'Error during conversion';
        } finally {
            isLoading = false;
        }
    }

    function switchValues() {
        [fromValue, result] = [result, fromValue];
    }

    $: {
        if (fromValue && fromUnit && toUnit) {
            isLoading = true;
            clearTimeout(timeoutId);
            // Lets not spam the api, yes?
            timeoutId = setTimeout(handleConversion, 500);
        }
    }

    onMount(() => {
        fetchUnits(selectedCategory);
    });
</script>

<div class="max-w-lg mx-auto my-10 p-8 bg-slate-50 rounded-xl shadow-2xl space-y-8">
    <div>
        <select
            class="w-full p-4 text-center bg-slate-100 border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150 ease-in-out hover:bg-slate-200"
            bind:value={selectedCategory}
            on:change={handleCategoryChange}
        >
            {#each categories as category}
                <option value={category}>{category}</option>
            {/each}
        </select>
    </div>
    <div class="space-y-6">
        <div class="flex items-center space-x-3">
            <input
                type="number"
                bind:value={fromValue}
                class="flex-1 p-4 bg-slate-100 border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150 ease-in-out hover:bg-slate-200 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                step="any"
                placeholder="Enter value"
            >
            <select
                class="p-4 bg-slate-100 border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150 ease-in-out hover:bg-slate-200"
                value={fromUnit}
                on:change={(e) => handleUnitChange(e, true)}
            >
                {#each units as unit}
                    {#if unit != fromUnit}
                        <option value={unit}>{unit}</option>
                    {:else}
                        <option value={unit} hidden>{unit}</option>
                    {/if}
                {/each}
            </select>
        </div>
        <div class="flex justify-center">
            <button
                class="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform hover:scale-105"
                on:click={switchValues}
                aria-label="Switch units"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>
        </div>
        <div class="flex items-center space-x-3">
            <input
                type="text"
                class="flex-1 p-4 bg-slate-100 border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150 ease-in-out hover:bg-slate-200 placeholder-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder={isLoading ? "Converting..." : "Result"}
                value={isLoading ? "" : result}
                readonly
            >
            <select
                class="p-4 bg-slate-100 border-slate-300 text-slate-900 text-base rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-150 ease-in-out hover:bg-slate-200"
                value={toUnit}
                on:change={(e) => handleUnitChange(e, false)}
            >
                {#each units as unit}
                    {#if unit != toUnit}
                        <option value={unit}>{unit}</option>
                    {:else}
                        <option value={unit} hidden>{unit}</option>
                    {/if}
                {/each}
            </select>
        </div>
    </div>
</div>
