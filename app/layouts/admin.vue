<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <header class="border-b bg-white">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"
      >
        <NuxtLink to="/admin" class="font-display font-bold tracking-[.2em]"
          >LIČNOST OPS</NuxtLink
        ><button class="text-sm underline" @click="logout">Sign out</button>
      </div>
    </header>
    <div class="mx-auto flex max-w-7xl">
      <aside class="hidden w-52 shrink-0 border-r bg-white p-4 md:block">
        <nav class="grid gap-1 text-sm">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded px-3 py-2 hover:bg-slate-100"
            >{{ link.label }}</NuxtLink
          >
        </nav>
      </aside>
      <main class="min-w-0 flex-1 px-5 py-8"><slot /></main>
    </div>
  </div>
</template>
<script setup lang="ts">
const links = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Requests', to: '/admin/requests' },
  { label: 'Inventory', to: '/admin/inventory' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Readiness', to: '/admin/readiness' },
]
const logout = async () => {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>
