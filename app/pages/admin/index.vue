<template>
  <div>
    <div class="flex items-end justify-between">
      <div>
        <p class="text-xs tracking-[.2em] text-slate-500">OPERATIONS</p>
        <h1 class="mt-2 font-display text-4xl">Dashboard</h1>
      </div>
      <span class="text-sm text-slate-500">Live PostgreSQL metrics</span>
    </div>
    <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded border bg-white p-5"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-semibold">{{ card.value }}</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data } = await useFetch<Record<string, number>>('/api/admin/dashboard')
const cards = computed(() => [
  { label: 'Orders today', value: data.value?.orders_today ?? 0 },
  { label: 'Paid orders', value: data.value?.paid_orders ?? 0 },
  {
    label: 'Awaiting fulfillment',
    value: data.value?.awaiting_fulfillment ?? 0,
  },
  { label: 'New requests', value: data.value?.new_requests ?? 0 },
  { label: 'Waiting for customer', value: data.value?.waiting_requests ?? 0 },
  { label: 'Low-stock variants', value: data.value?.low_stock ?? 0 },
  { label: 'Orders requiring review', value: data.value?.review_orders ?? 0 },
  { label: 'Failed email deliveries', value: data.value?.failed_emails ?? 0 },
])
</script>
