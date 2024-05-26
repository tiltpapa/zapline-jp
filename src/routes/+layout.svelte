<script>
    import { base } from "$app/paths";
</script>

<svelte:head>
    <title>Zapline-JP</title>
</svelte:head>

<nav class="navbar navbar-expand fixed-top navbar-light bg-light">
    <a class="navbar-brand ps-3" href="{base}/">Zapline-JP</a>
    <ul class="nav navbar-nav">
        <li class="nav-item">
            <a class="nav-link" href="{base}/">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{base}/about">About</a>
        </li>
    </ul>
</nav>

<div class="main-content main-width">
    <slot></slot>
</div>

<style>
    .main-content {
        margin-top: 56px;
    }
    
    .main-width {
        width: 100%;
        padding: 0;
    }

    @media (min-width: 768px) {
        .main-width {
            width: 768px;
            margin-left: auto;
            margin-right: auto;
        }
    }
</style>