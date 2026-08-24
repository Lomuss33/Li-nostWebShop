<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
type Method = {
  id: string
  market_id: string
  name: string
  carrier_label: string
  enabled: boolean
  currency: 'EUR' | 'USD' | 'CHF'
  price_minor: number
  free_shipping_threshold_minor: number | null
  minimum_weight_grams: number | null
  maximum_weight_grams: number | null
  estimated_days_min: number
  estimated_days_max: number
  tracking_supported: boolean
}
const { data, refresh } = await useFetch<{
  methods: Method[]
  countries: Array<{
    country_code: string
    online_checkout: boolean
    purchase_request: boolean
    currency: string
    customs_mode: string
  }>
}>('/api/admin/settings/shipping')
const message = ref('')
async function save(method: Method) {
  await $fetch(`/api/admin/settings/shipping/${method.id}`, {
    method: 'PATCH',
    body: {
      name: method.name,
      carrierLabel: method.carrier_label,
      enabled: method.enabled,
      currency: method.currency,
      priceMinor: Number(method.price_minor),
      freeShippingThresholdMinor:
        method.free_shipping_threshold_minor == null
          ? null
          : Number(method.free_shipping_threshold_minor),
      minimumWeightGrams:
        method.minimum_weight_grams == null
          ? null
          : Number(method.minimum_weight_grams),
      maximumWeightGrams:
        method.maximum_weight_grams == null
          ? null
          : Number(method.maximum_weight_grams),
      estimatedDaysMin: Number(method.estimated_days_min),
      estimatedDaysMax: Number(method.estimated_days_max),
      trackingSupported: method.tracking_supported,
    },
  })
  message.value = 'Saved.'
  await refresh()
}
async function saveCountry(country: {
  country_code: string
  online_checkout: boolean
  purchase_request: boolean
  currency: string
  customs_mode: string
}) {
  await $fetch(
    `/api/admin/settings/shipping/countries/${country.country_code}`,
    {
      method: 'PATCH',
      body: {
        enabled: true,
        onlineCheckout: country.online_checkout,
        purchaseRequest: country.purchase_request,
        currency: country.currency,
        customsMode: country.customs_mode,
      },
    },
  )
  message.value = 'Country saved.'
  await refresh()
}
</script>
<template>
  <div class="space-y-8">
    <div>
      <NuxtLink to="/admin/settings" class="text-sm underline"
        >← Settings</NuxtLink
      >
      <h1 class="mt-2 text-3xl font-semibold">Shipping configuration</h1>
      <p class="mt-2 text-sm text-amber-700">
        Rates must be confirmed against real business/carrier pricing before
        enabling checkout.
      </p>
      <p v-if="message" class="mt-2 text-sm text-green-700">{{ message }}</p>
      <p class="text-xs text-slate-500">
        Example rule: Germany · DHL Paket · 0–2 kg · €4.90 · free over €80 · 1–3
        business days. Sample rates are not carrier contracts.
      </p>
    </div>
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Methods</h2>
      <div
        v-for="method in data?.methods || []"
        :key="method.id"
        class="grid gap-2 rounded border bg-white p-4 md:grid-cols-6"
      >
        <input
          v-model="method.name"
          class="rounded border px-2 py-1"
          aria-label="Method name"
          placeholder="DHL Paket"
        /><input
          v-model="method.carrier_label"
          class="rounded border px-2 py-1"
          aria-label="Carrier label"
          placeholder="DHL"
        /><input
          v-model.number="method.price_minor"
          type="number"
          min="0"
          class="rounded border px-2 py-1"
          aria-label="Price in minor units"
          placeholder="490 = €4.90"
        /><input
          v-model.number="method.minimum_weight_grams"
          type="number"
          min="0"
          placeholder="Min g"
          class="rounded border px-2 py-1"
        /><input
          v-model.number="method.maximum_weight_grams"
          type="number"
          min="0"
          placeholder="Max g"
          class="rounded border px-2 py-1"
        /><label class="flex items-center gap-2 text-sm"
          ><input v-model="method.enabled" type="checkbox" /> Enabled</label
        ><button
          class="rounded bg-black px-3 py-2 text-sm text-white md:col-span-6 md:justify-self-start"
          @click="save(method)"
        >
          Save {{ method.market_id || method.name }}
        </button>
      </div>
    </section>
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">Market countries</h2>
      <div
        v-for="country in data?.countries || []"
        :key="country.country_code"
        class="flex flex-wrap items-center gap-3 rounded border bg-white p-3 text-sm"
      >
        <strong class="w-12">{{ country.country_code }}</strong
        ><label
          ><input v-model="country.online_checkout" type="checkbox" /> Online
          checkout</label
        ><label
          ><input v-model="country.purchase_request" type="checkbox" />
          Requests</label
        ><select v-model="country.currency" class="rounded border px-2 py-1">
          <option>EUR</option>
          <option>USD</option>
          <option>CHF</option></select
        ><select
          v-model="country.customs_mode"
          class="rounded border px-2 py-1"
        >
          <option>NONE</option>
          <option>DAP</option>
          <option>DDP</option></select
        ><button class="ml-auto underline" @click="saveCountry(country)">
          Save
        </button>
      </div>
    </section>
  </div>
</template>
