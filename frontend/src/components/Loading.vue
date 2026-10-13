<script setup lang="ts">
defineProps<{ component: string }>();
</script>
<template>
    <div class="spinner-border loading-image-invisible me-2" role="status" />Attendi: sto caricando {{ component
    }}&hellip;
</template>