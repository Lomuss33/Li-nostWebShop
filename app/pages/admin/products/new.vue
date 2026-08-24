<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const form = reactive({
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  category: 'T-Shirts',
  collection: '',
  active: true,
  featured: false,
  isNew: true,
})
const error = ref('')
async function submit() {
  error.value = ''
  try {
    const result = await $fetch<{ id: string }>('/api/admin/products', {
      method: 'POST',
      body: form,
    })
    await navigateTo(`/admin/products/${result.id}`)
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Product could not be created.'
  }
}
</script>
<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Catalog</p>
      <h1 class="mt-2 text-3xl font-semibold">New product</h1>
      <p class="mt-2 text-sm text-slate-600">
        Create the catalog record first, then add size/color variants with their
        own SKUs.
      </p>
    </div>
    <form
      class="space-y-4 rounded border bg-white p-6"
      @submit.prevent="submit"
    >
      <label class="grid gap-1 text-sm"
        >Product name<input
          v-model="form.name"
          required
          placeholder="Essential Oversized Hoodie"
          class="w-full rounded border px-3 py-2" /></label
      ><label class="grid gap-1 text-sm"
        >URL slug<input
          v-model="form.slug"
          required
          placeholder="essential-oversized-hoodie"
          class="w-full rounded border px-3 py-2" /></label
      ><label class="grid gap-1 text-sm"
        >Category<input
          v-model="form.category"
          required
          placeholder="Hoodies"
          class="w-full rounded border px-3 py-2" /><FieldHint
          text="Broad product type, such as T-Shirts, Hoodies or Jackets." /></label
      ><label class="grid gap-1 text-sm"
        >Collection<input
          v-model="form.collection"
          placeholder="Core Collection"
          class="w-full rounded border px-3 py-2" /><FieldHint
          text="Merchandising group or campaign, such as Core Collection." /></label
      ><label class="grid gap-1 text-sm"
        >Short description<textarea
          v-model="form.shortDescription"
          placeholder="Heavyweight everyday hoodie with a relaxed fit."
          class="w-full rounded border px-3 py-2"
        /></label
      ><label class="grid gap-1 text-sm"
        >Full description<textarea
          v-model="form.description"
          required
          placeholder="A heavyweight cotton hoodie designed for everyday wear, with a relaxed silhouette, dropped shoulders and a clean minimal finish."
          class="min-h-32 w-full rounded border px-3 py-2"
        />
      </label>
      <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
      <button class="rounded bg-black px-4 py-2 font-semibold text-white">
        Create product
      </button>
    </form>
  </div>
</template>
