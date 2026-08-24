<template>
  <div class="status-page ornament-panel">
    <div class="status-page__symbol">✦</div>
    <p class="eyebrow">Checkout</p>
    <h1>
      {{
        state === 'paid'
          ? 'Payment received.'
          : 'We are confirming your payment.'
      }}
    </h1>
    <p class="status-page__copy">
      {{
        state === 'paid'
          ? `Order ${orderNumber} is confirmed.`
          : 'Your payment return is not proof of payment yet. This page will update when Stripe confirms the server-side payment.'
      }}
    </p>
    <NuxtLink
      class="ornament-button"
      to="/shop"
      >Continue shopping</NuxtLink
    >
  </div>
</template>
<script setup lang="ts">
const sessionId = String(useRoute().query.session_id || '')
const state = ref('confirming')
const orderNumber = ref('')
if (sessionId) {
  const result = await useFetch<{
    order_number: string
    payment_status: string
  }>(`/api/checkout/session/${encodeURIComponent(sessionId)}`)
  if (result.data.value) {
    orderNumber.value = result.data.value.order_number
    state.value =
      result.data.value.payment_status === 'PAID' ? 'paid' : 'confirming'
  }
}
</script>
