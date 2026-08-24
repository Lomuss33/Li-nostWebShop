<script setup lang="ts">
defineProps<{ title: string; description: string; example?: string }>()
</script>
<template>
  <div
    class="rounded border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
  >
    <h2 class="font-semibold">{{ title }}</h2>
    <p class="mx-auto mt-2 max-w-md text-sm text-slate-600">
      {{ description }}
    </p>
    <p
      v-if="example"
      class="mx-auto mt-4 max-w-md text-xs italic text-slate-500"
    >
      Example: {{ example }}
    </p>
    <slot />
  </div>
</template>
