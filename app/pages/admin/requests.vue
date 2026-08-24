<template>
  <div>
    <h1 class="font-display text-4xl">Purchase requests</h1>
    <div class="mt-6 flex gap-3">
      <input
        v-model="search"
        placeholder="Search request number, name, email or phone…"
        class="border bg-white px-3 py-2 text-sm"
      /><select v-model="status" class="border bg-white px-3 py-2 text-sm">
        <option value="">All statuses</option>
        <option v-for="s in statuses" :key="s">{{ s }}</option>
      </select>
    </div>
    <div v-if="!data?.items?.length" class="mt-6">
      <EmptyState
        title="No purchase requests yet"
        description="Requests sent through “Request these items” will appear here."
        example="REQ-2026-000045 · Marko Petrović · Bosnia and Herzegovina · WhatsApp · Waiting for customer"
      />
    </div>
    <div v-else class="mt-6 overflow-x-auto rounded border bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50">
          <tr>
            <th class="p-3">Request</th>
            <th class="p-3">Customer</th>
            <th class="p-3">Country</th>
            <th class="p-3">Items</th>
            <th class="p-3">Estimated</th>
            <th class="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data?.items" :key="item.id" class="border-b">
            <td class="p-3">
              <NuxtLink
                class="underline"
                :to="`/admin/requests/${item.request_number}`"
                >{{ item.request_number }}</NuxtLink
              >
              <div class="text-xs text-slate-500">
                {{ new Date(item.created_at).toLocaleString() }}
              </div>
            </td>
            <td class="p-3">
              {{ item.first_name }} {{ item.last_name }}
              <div class="text-xs text-slate-500">{{ item.email }}</div>
            </td>
            <td class="p-3">{{ item.country_code }}</td>
            <td class="p-3">{{ item.item_count }}</td>
            <td class="p-3">
              {{
                formatMoney({
                  amount: item.subtotal_minor,
                  currency: item.currency,
                })
              }}
            </td>
            <td class="p-3">
              <span class="rounded bg-slate-100 px-2 py-1 text-xs">{{
                item.status
              }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!data?.items?.length" class="p-8 text-center text-slate-500">
        No requests found.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const search = ref('')
const status = ref('')
const statuses = [
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'WAITING_FOR_CUSTOMER',
  'PAYMENT_LINK_SENT',
  'CONVERTED_TO_ORDER',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data } = await useFetch<any>('/api/admin/requests', {
  query: computed(() => ({ search: search.value, status: status.value })),
})
</script>
