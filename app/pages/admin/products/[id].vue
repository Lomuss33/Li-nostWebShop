<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const id = useRoute().params.id as string
const { data, refresh } = await useFetch<any>(`/api/admin/products/${id}`) // eslint-disable-line @typescript-eslint/no-explicit-any
const product = computed(() => data.value?.product)
const form = reactive({
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  category: '',
  collection: '',
  active: true,
  featured: false,
  isNew: false,
  updatedAt: '',
})
watch(
  product,
  (value) => {
    if (value)
      Object.assign(form, {
        name: value.name,
        slug: value.slug,
        shortDescription: value.short_description,
        description: value.description,
        category: value.category,
        collection: value.collection,
        active: value.active,
        featured: value.featured,
        isNew: value.is_new,
        updatedAt: value.updated_at,
      })
  },
  { immediate: true },
)
const error = ref('')
const saved = ref(false)
async function save() {
  error.value = ''
  saved.value = false
  try {
    await $fetch(`/api/admin/products/${id}`, { method: 'PATCH', body: form })
    saved.value = true
    await refresh()
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Product could not be updated.'
  }
}
const variant = reactive({
  sku: '',
  color: '',
  size: '',
  priceMinor: 0,
  salePriceMinor: null as number | null,
  currency: 'EUR',
  weightGrams: null as number | null,
  active: true,
})
async function addVariant() {
  await $fetch(`/api/admin/products/${id}/variants`, {
    method: 'POST',
    body: variant,
  })
  Object.assign(variant, {
    sku: '',
    color: '',
    size: '',
    priceMinor: 0,
    salePriceMinor: null,
    currency: 'EUR',
    weightGrams: null,
    active: true,
  })
  await refresh()
}
const image = reactive({ urlOrPath: '', altText: '', position: 0 })
async function addImage() {
  await $fetch(`/api/admin/products/${id}/images`, {
    method: 'POST',
    body: image,
  })
  Object.assign(image, { urlOrPath: '', altText: '', position: 0 })
  await refresh()
}
</script>
<template>
  <div class="space-y-8">
    <div>
      <NuxtLink to="/admin/products" class="text-sm underline"
        >← Products</NuxtLink
      >
      <h1 class="mt-2 text-3xl font-semibold">
        {{ product?.name || 'Product' }}
      </h1>
      <p class="text-sm text-gray-500">
        {{ product?.id }} · {{ data?.variants?.length || 0 }} variants ·
        {{
          data?.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0
        }}
        total stock
      </p>
    </div>
    <form
      class="grid gap-3 rounded border bg-white p-6 md:grid-cols-2"
      @submit.prevent="save"
    >
      <input
        v-model="form.name"
        required
        placeholder="Name"
        class="rounded border px-3 py-2"
      /><input
        v-model="form.slug"
        required
        placeholder="Slug"
        class="rounded border px-3 py-2"
      /><input
        v-model="form.category"
        required
        placeholder="Category"
        class="rounded border px-3 py-2"
      /><input
        v-model="form.collection"
        placeholder="Collection"
        class="rounded border px-3 py-2"
      /><input
        v-model="form.shortDescription"
        placeholder="Short description"
        class="rounded border px-3 py-2 md:col-span-2"
      /><textarea
        v-model="form.description"
        required
        class="min-h-32 rounded border px-3 py-2 md:col-span-2"
      /><label><input v-model="form.active" type="checkbox" /> Active</label
      ><label><input v-model="form.featured" type="checkbox" /> Featured</label
      ><label><input v-model="form.isNew" type="checkbox" /> New</label>
      <div class="md:col-span-2">
        <button class="rounded bg-black px-4 py-2 font-semibold text-white">
          Save product</button
        ><span v-if="saved" class="ml-3 text-sm text-green-700">Saved.</span
        ><span v-if="error" class="ml-3 text-sm text-red-700">{{ error }}</span>
      </div>
    </form>
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Variants</h2>
      <div class="overflow-x-auto rounded border bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th class="px-3 py-2">SKU</th>
              <th class="px-3 py-2">Color</th>
              <th class="px-3 py-2">Size</th>
              <th class="px-3 py-2">Price</th>
              <th class="px-3 py-2">Stock</th>
              <th class="px-3 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in data?.variants || []" :key="v.id" class="border-b">
              <td class="px-3 py-2">{{ v.sku }}</td>
              <td class="px-3 py-2">{{ v.color }}</td>
              <td class="px-3 py-2">{{ v.size }}</td>
              <td class="px-3 py-2">
                {{ (v.price_minor / 100).toFixed(2) }} {{ v.currency }}
              </td>
              <td class="px-3 py-2">{{ v.stock }}</td>
              <td class="px-3 py-2">{{ v.active ? 'Yes' : 'No' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-slate-500">
        Each size/color combination needs its own SKU. Example: LIC-HOOD-BLK-L ·
        Black · L · €69.00. Stock is adjusted separately in Inventory so every
        change has an audit trail.
      </p>
      <form
        class="grid gap-2 rounded border bg-white p-4 md:grid-cols-4"
        @submit.prevent="addVariant"
      >
        <input
          v-model="variant.sku"
          required
          placeholder="LIC-HOOD-BLK-L"
          class="rounded border px-2 py-2"
        /><input
          v-model="variant.color"
          required
          placeholder="Black"
          class="rounded border px-2 py-2"
        /><input
          v-model="variant.size"
          required
          placeholder="L"
          class="rounded border px-2 py-2"
        /><input
          v-model.number="variant.priceMinor"
          required
          type="number"
          min="0"
          placeholder="6900 (€69.00)"
          class="rounded border px-2 py-2"
        /><button
          class="rounded bg-black px-3 py-2 text-sm font-semibold text-white"
        >
          Add variant
        </button>
      </form>
    </section>
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Images</h2>
      <p v-if="!data?.images?.length" class="text-sm text-slate-500">
        No product images yet. Example:
        /products/essential-hoodie-black-front.webp · Black Essential Hoodie,
        front view · position 1.
      </p>
      <div
        v-for="img in data?.images || []"
        :key="img.id"
        class="flex gap-3 text-sm"
      >
        <span>{{ img.position }} · {{ img.alt_text }}</span
        ><span class="text-gray-500">{{ img.url_or_path }}</span>
      </div>
      <form
        class="flex flex-wrap gap-2 rounded border bg-white p-4"
        @submit.prevent="addImage"
      >
        <input
          v-model="image.urlOrPath"
          required
          placeholder="/products/essential-hoodie-black-front.webp"
          class="rounded border px-2 py-2"
        /><input
          v-model="image.altText"
          required
          placeholder="Black Essential Hoodie, front view"
          class="rounded border px-2 py-2"
        /><input
          v-model.number="image.position"
          type="number"
          min="0"
          class="w-24 rounded border px-2 py-2"
        /><button
          class="rounded bg-black px-3 py-2 text-sm font-semibold text-white"
        >
          Add image
        </button>
      </form>
      <p class="text-xs text-slate-500">
        Position 1 is the primary image. Removing metadata does not delete an
        external file.
      </p>
    </section>
  </div>
</template>
