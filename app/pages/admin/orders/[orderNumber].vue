<template>
  <div v-if="data">
    <NuxtLink to="/admin/orders" class="text-sm underline">← Orders</NuxtLink>
    <h1 class="mt-4 font-display text-4xl">{{ data.order.order_number }}</h1>
    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <section class="rounded border bg-white p-5">
        <h2 class="font-semibold">Order and payment</h2>
        <dl class="mt-3 grid gap-2 text-sm">
          <div class="flex justify-between">
            <dt>Customer</dt>
            <dd>{{ data.order.email }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Total</dt>
            <dd>
              {{
                formatMoney({
                  amount: data.order.grand_total_minor,
                  currency: data.order.currency,
                })
              }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt>Payment</dt>
            <dd>{{ data.order.payment_status }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Fulfillment</dt>
            <dd>{{ data.order.fulfillment_status }}</dd>
          </div>
        </dl>
        <div class="mt-5 flex flex-wrap gap-2">
          <button
            v-if="canPay"
            class="bg-ink px-4 py-2 text-sm text-white"
            @click="createPayment"
          >
            Generate payment link
          </button>
          <button
            v-if="canCancel"
            class="border px-4 py-2 text-sm"
            @click="cancelOrder"
          >
            Cancel unpaid order
          </button>
        </div>
        <p v-if="message" class="mt-3 text-sm text-slate-600">{{ message }}</p>
      </section>
      <section class="rounded border bg-white p-5">
        <h2 class="font-semibold">Fulfillment</h2>
        <select v-model="nextStatus" class="mt-4 w-full border px-3 py-2">
          <option v-for="status in nextStatuses" :key="status">
            {{ status }}
          </option></select
        ><input
          v-if="nextStatus === 'SHIPPED'"
          v-model="trackingNumber"
          placeholder="00340434161094000000"
          class="mt-3 w-full border px-3 py-2"
        /><input
          v-if="nextStatus === 'SHIPPED'"
          v-model="trackingUrl"
          placeholder="https://www.dhl.de/..."
          class="mt-3 w-full border px-3 py-2"
        /><button
          class="mt-3 bg-ink px-4 py-2 text-sm text-white"
          @click="updateFulfillment"
        >
          Update fulfillment
        </button>
      </section>
    </div>
    <section class="mt-6 rounded border bg-white p-5">
      <h2 class="font-semibold">Payment attempts</h2>
      <div
        v-if="!data.payments?.length"
        class="mt-3 rounded border border-dashed p-4 text-sm text-slate-500"
      >
        No payment attempts yet. A payment attempt appears after a secure
        Checkout session is created.<br /><span class="text-xs italic"
          >Example: Attempt 1 · FAILED · 24 Aug 2026, 18:42</span
        >
      </div>
      <div
        v-for="payment in data.payments"
        :key="payment.id"
        class="mt-3 flex flex-wrap justify-between border-b py-2 text-sm"
      >
        <span>{{ payment.status }} · {{ payment.provider }}</span
        ><span>{{
          formatMoney({
            amount: payment.amount_minor,
            currency: payment.currency,
          })
        }}</span>
      </div>
    </section>
    <section class="mt-6 rounded border bg-white p-5">
      <h2 class="font-semibold">Items</h2>
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
            amount: item.line_total_minor,
            currency: data.order.currency,
          })
        }}</span>
      </div>
    </section>
    <section class="mt-6 rounded border bg-white p-5">
      <h2 class="font-semibold">Internal note</h2>
      <div class="mt-3 flex gap-2">
        <input
          v-model="note"
          placeholder="Customer asked to delay shipping until Friday."
          class="min-w-0 flex-1 border px-3 py-2"
        /><button class="bg-ink px-4 py-2 text-sm text-white" @click="addNote">
          Add
        </button>
      </div>
      <p
        v-for="item in data.notes"
        :key="item.id"
        class="mt-3 border-t pt-3 text-sm"
      >
        <strong>{{ item.admin_email }}</strong> · {{ item.note }}
      </p>
      <FieldHint
        text="Examples: Address correction confirmed · Customer contacted by WhatsApp · Hold shipment until Friday."
      />
    </section>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data, refresh } = await useFetch<any>(
  `/api/admin/orders/${route.params.orderNumber}`,
)
const nextStatus = ref('PICKING')
const trackingNumber = ref('')
const trackingUrl = ref('')
const nextStatuses = ['PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'RETURNED']
const note = ref('')
const message = ref('')
const canPay = computed(
  () =>
    ['UNPAID', 'FAILED'].includes(data.value?.order?.payment_status) &&
    data.value?.order?.order_status === 'PENDING_PAYMENT',
)
const canCancel = computed(
  () => canPay.value && data.value?.order?.fulfillment_status === 'UNFULFILLED',
)
const updateFulfillment = async () => {
  await $fetch(`/api/admin/orders/${route.params.orderNumber}/fulfillment`, {
    method: 'PATCH',
    body: {
      status: nextStatus.value,
      trackingNumber: trackingNumber.value || undefined,
      trackingUrl: trackingUrl.value || undefined,
    },
  })
  await refresh()
}
const createPayment = async () => {
  const result = await $fetch<{ checkoutUrl: string }>(
    `/api/admin/orders/${route.params.orderNumber}/payment-link`,
    { method: 'POST' },
  )
  message.value = `Checkout created: ${result.checkoutUrl}`
  await refresh()
}
const cancelOrder = async () => {
  if (!confirm('Cancel this unpaid order?')) return
  await $fetch(`/api/admin/orders/${route.params.orderNumber}/cancel`, {
    method: 'PATCH',
  })
  await refresh()
}
const addNote = async () => {
  if (!note.value.trim()) return
  await $fetch(`/api/admin/orders/${route.params.orderNumber}/notes`, {
    method: 'POST',
    body: { note: note.value },
  })
  note.value = ''
  await refresh()
}
</script>
