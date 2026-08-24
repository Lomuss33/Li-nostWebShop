<template>
  <div>
    <h1 class="font-display text-4xl">Inventory</h1>
    <div class="mt-6 flex gap-3">
      <input
        v-model="search"
        placeholder="Search product or SKU…"
        class="border bg-white px-3 py-2 text-sm"
      /><select v-model="filter" class="border bg-white px-3 py-2 text-sm">
        <option value="">All active</option>
        <option value="low">Low stock</option>
        <option value="out">Out of stock</option>
      </select>
    </div>
    <p class="mt-2 text-xs text-slate-500">
      Adjustments are recorded separately from product metadata. Example: +20
      with reason “Restock from supplier”. Negative changes cannot reduce stock
      below zero.
    </p>
    <div v-if="!data?.items?.length" class="mt-6">
      <EmptyState
        title="No inventory rows yet"
        description="Published variants appear here once products have been created."
        example="LIC-HOOD-BLK-L · Essential Hoodie · Black · L · Stock 4 (low stock)"
      />
    </div>
    <div v-else class="mt-6 overflow-x-auto rounded border bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b bg-slate-50">
          <tr>
            <th class="p-3">SKU</th>
            <th class="p-3">Product</th>
            <th class="p-3">Color</th>
            <th class="p-3">Size</th>
            <th class="p-3">Stock</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data?.items" :key="item.id" class="border-b">
            <td class="p-3 font-mono">{{ item.sku }}</td>
            <td class="p-3">{{ item.product_name }}</td>
            <td class="p-3">{{ item.color }}</td>
            <td class="p-3">{{ item.size }}</td>
            <td
              class="p-3"
              :class="{
                'font-semibold text-red-700':
                  item.stock <= (data?.threshold || 5),
              }"
            >
              {{ item.stock }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const search = ref('')
const filter = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data } = await useFetch<any>('/api/admin/inventory', {
  query: computed(() => ({ search: search.value, status: filter.value })),
})
</script>
