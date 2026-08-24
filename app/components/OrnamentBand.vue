<template>
  <div class="ornament-band" :class="{ 'ornament-band--light': light }" aria-hidden="true">
    <svg viewBox="0 0 1200 44" preserveAspectRatio="none">
      <defs>
        <pattern id="licnost-stitch-pattern" width="72" height="44" patternUnits="userSpaceOnUse">
          <path d="M0 22h18L36 5l18 17h18" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M0 22h18l18 17 18-17h18" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="m36 13 9 9-9 9-9-9 9-9Z" fill="none" stroke="var(--band-accent)" stroke-width="1.5" />
          <circle cx="36" cy="22" r="2.5" fill="var(--band-accent)" />
        </pattern>
      </defs>
      <path d="M0 3h1200M0 41h1200" stroke="currentColor" stroke-width="1" opacity=".55" />
      <rect width="1200" height="44" fill="url(#licnost-stitch-pattern)" />
    </svg>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>

