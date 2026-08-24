<template>
  <div>
    <h1 class="font-display text-4xl">Orders</h1>
    <div class="mt-6 flex gap-3">
      <input
        v-model="search"
        placeholder="Search order number, customer or email…"
        class="border bg-white px-3 py-2 text-sm"
      /><select
        v-model="paymentStatus"
        class="border bg-white px-3 py-2 text-sm"
      >
        <option value="">All payment states</option>
        <option>PAID</option>
        <option>UNPAID</option>
        <option>FAILED</option>
      </select>
    </div>
    <div v-if="!data?.items?.length" class="mt-6">
      <EmptyState
        title="No orders yet"
        description="Paid customer orders will appear here after checkout is completed."
        example="ORD-2026-000123 · Anna Müller · Germany · €89.00 · PAID · PACKED"
      />
    </div>
    <div v-else class="mt-6 overflow-x-auto rounded border bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50">
          <tr>
            <th class="p-3">Order</th>
            <th class="p-3">Customer</th>
            <th class="p-3">Total</th>
            <th class="p-3">Payment</th>
            <th class="p-3">Fulfillment</th>
            <th class="p-3">Review</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data?.items" :key="item.id" class="border-b">
            <td class="p-3">
              <NuxtLink
                class="underline"
                :to="`/admin/orders/${item.order_number}`"
                >{{ item.order_number }}</NuxtLink
              >
              <div class="text-xs text-slate-500">
                {{ new Date(item.created_at).toLocaleString() }}
              </div>
            </td>
            <td class="p-3">
              {{ item.email }}
              <div class="text-xs text-slate-500">
                {{ item.shipping_country_code }}
              </div>
            </td>
            <td class="p-3">
              {{
                formatMoney({
                  amount: item.grand_total_minor,
                  currency: item.currency,
                })
              }}
            </td>
            <td class="p-3">{{ item.payment_status }}</td>
            <td class="p-3">{{ item.fulfillment_status }}</td>
            <td class="p-3">
              {{ item.requires_review ? 'Needs review' : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!data?.items?.length" class="p-8 text-center text-slate-500">
        No orders found.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const search = ref('')
const paymentStatus = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data } = await useFetch<any>('/api/admin/orders', {
  query: computed(() => ({
    search: search.value,
    paymentStatus: paymentStatus.value,
  })),
})
</script>
