<script>
    import "../app.css";
    import { page } from '$app/stores';
</script>

<header class="bg-slate-700 text-white shadow-md">
    <nav class="container mx-auto px-6 py-3 flex justify-center items-center space-x-6">
        <a
            href="/"
            class="py-2 px-3 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
            class:bg-slate-800={$page.url.pathname === '/'}
            class:text-indigo-300={$page.url.pathname === '/'}
        >
            Unit Converter
        </a>
        <a
            href="/kv-store"
            class="py-2 px-3 rounded-md text-sm font-medium hover:bg-slate-600 transition-colors"
            class:bg-slate-800={$page.url.pathname === '/kv-store'}
            class:text-indigo-300={$page.url.pathname === '/kv-store'}
        >
            Key-Value Store
        </a>
    </nav>
</header>

<main class="container mx-auto px-4 py-8">
    <slot />
</main>

<footer class="bg-slate-100 text-slate-600 p-4 text-center text-sm mt-12">
    <p>&copy; {new Date().getFullYear()} My Svelte App. All rights reserved.</p>
</footer>
