<template>
  <div class="status-page ornament-panel">
    <div class="status-page__symbol">✦</div>
    <p class="eyebrow">Request received</p>
    <h1>Thank you.</h1>
    <p class="status-page__label">Your reference</p>
    <p class="status-page__reference">{{ reference }}</p>
    <OrnamentBand />
    <p class="status-page__copy">
      No payment has been taken. Your items are not reserved yet. We will
      contact you using your selected contact method.
    </p>
    <NuxtLink
      class="ornament-button"
      to="/shop"
      >Continue shopping</NuxtLink
    >
  </div>
</template>
<script setup lang="ts">
const reference = String(useRoute().query.ref || '')
</script>
