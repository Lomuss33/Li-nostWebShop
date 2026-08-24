<template>
  <div class="mx-auto max-w-md px-5 py-24">
    <p class="text-xs tracking-[.25em] text-muted">LIČNOST OPERATIONS</p>
    <h1 class="mt-3 font-display text-4xl">Administrator login</h1>
    <p class="mt-4 text-sm text-muted">
      Use the server-configured bootstrap token. This setup does not expose an
      admin registration route.
    </p>
    <form class="mt-8 grid gap-4" @submit.prevent="login">
      <input
        v-model="email"
        type="email"
        required
        placeholder="operations@licnost.com"
      /><input
        v-model="token"
        type="password"
        required
        placeholder="adm_xxxxxxxxxxxxx"
      />
      <p v-if="error" class="text-sm text-red-700">{{ error }}</p>
      <button class="bg-ink px-5 py-3 text-sm text-white">Sign in</button>
    </form>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: false })
const email = ref('')
const token = ref('')
const error = ref('')
const route = useRoute()
const login = async () => {
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: email.value, token: token.value },
    })
    await navigateTo(String(route.query.redirect || '/admin'))
  } catch {
    error.value = 'Could not sign in with those credentials.'
  }
}
</script>
