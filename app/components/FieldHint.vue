<template>
  <p class="field-hint">
    <span aria-hidden="true">◇</span>{{ text }}
  </p>
</template>

<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<style scoped>
.field-hint {
  display: flex;
  gap: .55rem;
  align-items: center;
  color: var(--muted);
  font-size: .58rem;
  line-height: 1.5;
}
.field-hint span { color: var(--gold); }
</style>
