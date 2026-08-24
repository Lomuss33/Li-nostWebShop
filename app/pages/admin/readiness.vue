<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const { data } = await useFetch<{
  checks: Array<{ name: string; status: string; detail: string }>
  cod: string
}>('/api/admin/readiness')
</script>
<template>
  <div class="space-y-6">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-gray-500">
        Launch control
      </p>
      <h1 class="mt-2 text-3xl font-semibold">Production readiness</h1>
      <p class="mt-2 text-sm text-gray-600">
        Technical readiness is not legal, tax, or provider approval.
      </p>
      <p class="mt-2 text-xs text-gray-500">
        Each result is based on current configuration. “Configured” is not the
        same as “verified”; real provider tests and business review are still
        required.
      </p>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <section
        v-for="check in data?.checks || []"
        :key="check.name"
        class="rounded border bg-white p-5"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">{{ check.name }}</h2>
          <span
            class="rounded px-2 py-1 text-xs font-semibold"
            :class="
              check.status === 'READY'
                ? 'bg-green-100 text-green-800'
                : check.status === 'BLOCKED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
            "
            >{{ check.status }}</span
          >
        </div>
        <p class="mt-3 text-sm text-gray-600">{{ check.detail }}</p>
      </section>
    </div>
  </div>
</template>
