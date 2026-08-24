<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const search = ref('')
const { data } = await useFetch<{
  items: Array<Record<string, unknown>>
  total: number
}>('/api/admin/products', { query: { search }, watch: [search] })
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Catalog</p>
        <h1 class="mt-2 text-3xl font-semibold">Products</h1>
      </div>
      <NuxtLink
        to="/admin/products/new"
        class="rounded bg-black px-4 py-2 text-sm font-semibold text-white"
        >New product</NuxtLink
      >
    </div>
    <input
      v-model="search"
      aria-label="Search products"
      placeholder="Search product name, slug or SKU…"
      class="w-full rounded border px-3 py-2 text-sm md:max-w-md"
    />
    <div v-if="!data?.items?.length" class="rounded border bg-white">
      <EmptyState
        title="No products yet"
        description="Create your first catalog product, then add its size and color variants."
        example="Essential T-Shirt · Black / White · S–XL · €39.00"
        ><NuxtLink
          to="/admin/products/new"
          class="mt-5 inline-block rounded bg-black px-4 py-2 text-sm font-semibold text-white"
          >Create first product</NuxtLink
        ></EmptyState
      >
    </div>
    <div v-else class="overflow-x-auto rounded border bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">Product</th>
            <th class="px-4 py-3">Category</th>
            <th class="px-4 py-3">Variants</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in data?.items || []"
            :key="String(product.id)"
            class="border-b last:border-0"
          >
            <td class="px-4 py-3">
              <NuxtLink
                :to="`/admin/products/${product.id}`"
                class="font-medium underline"
                >{{ product.name }}</NuxtLink
              >
              <div class="text-xs text-gray-500">{{ product.slug }}</div>
            </td>
            <td class="px-4 py-3">{{ product.category }}</td>
            <td class="px-4 py-3">{{ product.variant_count }}</td>
            <td class="px-4 py-3">{{ product.stock }}</td>
            <td class="px-4 py-3">
              {{ product.active ? 'Active' : 'Archived' }}
            </td>
          </tr>
          <tr v-if="!data?.items?.length">
            <td colspan="5" class="px-4 py-10 text-center text-gray-500">
              No products found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
