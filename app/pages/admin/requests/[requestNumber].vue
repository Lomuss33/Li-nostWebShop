<template>
  <div v-if="data">
    <NuxtLink to="/admin/requests" class="text-sm underline"
      >← Requests</NuxtLink
    >
    <h1 class="mt-4 font-display text-4xl">
      {{ data.request.request_number }}
    </h1>
    <p class="mt-2 text-sm text-slate-500">This request has not been paid.</p>
    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <section class="rounded border bg-white p-5">
        <h2 class="font-semibold">Customer</h2>
        <p class="mt-3">
          {{ data.request.first_name }} {{ data.request.last_name }}
        </p>
        <p>{{ data.request.email }}</p>
        <p>{{ data.request.phone }}</p>
        <p>
          {{ data.request.country_code }} ·
          {{ data.request.preferred_contact_method }}
        </p>
        <p v-if="data.request.message" class="mt-4 border-t pt-4">
          {{ data.request.message }}
        </p>
      </section>
      <section class="rounded border bg-white p-5">
        <h2 class="font-semibold">Workflow</h2>
        <select v-model="nextStatus" class="mt-4 w-full border px-3 py-2">
          <option v-for="status in statuses" :key="status">
            {{ status }}
          </option></select
        ><button
          class="mt-3 bg-ink px-4 py-2 text-sm text-white"
          @click="updateStatus"
        >
          Update status
        </button>
        <p class="mt-4 text-sm">Current: {{ data.request.status }}</p>
        <button
          v-if="data.request.status !== 'CONVERTED_TO_ORDER'"
          class="mt-3 border px-4 py-2 text-sm"
          @click="convert"
        >
          Convert to order
        </button>
        <p class="mt-3 text-xs text-slate-500">
          Example review: requested price €59.00 → current price €69.00 →
          difference +€10.00. Stock and current prices are rechecked before
          conversion.
        </p>
        <p v-if="conversion" class="mt-3 text-sm text-slate-600">
          {{ conversion }}
        </p>
      </section>
    </div>
    <section class="mt-6 rounded border bg-white p-5">
      <h2 class="font-semibold">Requested items</h2>
      <div
        v-for="item in data.items"
        :key="item.id"
        class="flex justify-between border-b py-3 text-sm"
      >
        <span
          >{{ item.product_name_snapshot }} · {{ item.color_snapshot }} ·
          {{ item.size_snapshot }} × {{ item.quantity }}</span
        ><span>{{
          formatMoney({
            amount: item.unit_price_minor * item.quantity,
            currency: data.request.currency,
          })
        }}</span>
      </div>
    </section>
    <section class="mt-6 rounded border bg-white p-5">
      <h2 class="font-semibold">Internal note</h2>
      <div class="mt-3 flex gap-2">
        <input
          v-model="note"
          placeholder="Customer confirmed size XL and asked for a payment link."
          class="min-w-0 flex-1 border px-3 py-2"
        /><button class="bg-ink px-4 py-2 text-sm text-white" @click="addNote">
          Add
        </button>
      </div>
      <p
        v-for="item in data.notes || []"
        :key="item.id"
        class="mt-3 border-t pt-3 text-sm"
      >
        <strong>{{ item.admin_email }}</strong> · {{ item.note }}
      </p>
      <FieldHint text="Internal notes are visible only to staff." />
    </section>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data, refresh } = await useFetch<any>(
  `/api/admin/requests/${route.params.requestNumber}`,
)
const statuses = [
  'NEW',
  'REVIEWING',
  'CONTACTED',
  'WAITING_FOR_CUSTOMER',
  'PAYMENT_LINK_SENT',
  'DECLINED',
  'EXPIRED',
  'CANCELLED',
]
const nextStatus = ref('REVIEWING')
const note = ref('')
const conversion = ref('')
const updateStatus = async () => {
  await $fetch(`/api/admin/requests/${route.params.requestNumber}`, {
    method: 'PATCH',
    body: { status: nextStatus.value },
  })
  await refresh()
}
const addNote = async () => {
  if (!note.value.trim()) return
  await $fetch(`/api/admin/requests/${route.params.requestNumber}/notes`, {
    method: 'POST',
    body: { note: note.value },
  })
  note.value = ''
  await refresh()
}
const convert = async () => {
  const result = await $fetch<{ orderNumber: string }>(
    `/api/admin/requests/${route.params.requestNumber}/convert`,
    { method: 'POST' },
  )
  conversion.value = `Created ${result.orderNumber}`
  await refresh()
}
</script>
