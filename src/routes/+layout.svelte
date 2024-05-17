<script>
    import { base } from "$app/paths";
</script>

<svelte:head>
    <title>Zapline-JP</title>
</svelte:head>

<nav class="navbar navbar-expand navbar-light bg-light">
    <a class="navbar-brand ps-3" href="{base}/">Zapline-JP</a>
    <ul class="nav navbar-nav">
        <li class="nav-item">
            <a class="nav-link" href="{base}/">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link disabled" href="#">about</a>
        </li>
    </ul>
</nav>

<slot></slot>

<style>

</style>