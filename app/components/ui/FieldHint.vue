<script setup lang="ts">
defineProps<{ text: string; example?: boolean }>()
</script>
<template>
  <p class="text-xs leading-5 text-slate-500" :class="example ? 'italic' : ''">
    {{ example ? `Example: ${text}` : text }}
  </p>
</template>
