<template>
  <div>
    <h1 class="font-display text-4xl">Settings</h1>
    <div class="mt-8 max-w-xl rounded border bg-white p-6">
      <h2 class="font-semibold">Operational configuration</h2>
      <dl class="mt-5 grid gap-3 text-sm">
        <div class="flex justify-between border-b pb-2">
          <dt>Database</dt>
          <dd class="text-green-700">Connected</dd>
        </div>
        <div class="flex justify-between border-b pb-2">
          <dt>Stripe</dt>
          <dd>{{ status?.stripe || 'Unknown' }}</dd>
        </div>
        <div class="flex justify-between border-b pb-2">
          <dt>Email mode</dt>
          <dd>{{ status?.emailMode || 'Unknown' }}</dd>
        </div>
        <div class="flex justify-between border-b pb-2">
          <dt>Resend</dt>
          <dd>{{ status?.resend || 'Unknown' }}</dd>
        </div>
        <div class="flex justify-between">
          <dt>Admin notifications</dt>
          <dd>{{ status?.adminEmail || 'Unknown' }}</dd>
        </div>
      </dl>
      <p class="mt-6 text-xs text-slate-500">
        Secrets are environment configuration and are never displayed or stored
        here.
      </p>
      <p class="mt-3 text-xs italic text-slate-500">
        Example ready setup: Stripe TEST MODE, EMAIL_MODE=resend, verified
        sending domain, confirmed Germany shipping rate, and tax settings
        reviewed by your adviser.
      </p>
      <NuxtLink
        to="/admin/settings/shipping"
        class="mt-4 inline-block text-sm underline"
        >Manage shipping configuration</NuxtLink
      >
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: status } = await useFetch<{
  stripe: string
  emailMode: string
  resend: string
  adminEmail: string
}>('/api/admin/settings')
</script>
