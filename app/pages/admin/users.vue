<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
const { data, refresh } = await useFetch<{
  users: Array<{ id: string; email: string; role: string; active: boolean }>
}>('/api/admin/users')
const email = ref('')
const role = ref<'ADMIN' | 'OPERATOR'>('OPERATOR')
const error = ref('')
async function createUser() {
  error.value = ''
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: { email: email.value, role: role.value },
    })
    email.value = ''
    await refresh()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create user.'
  }
}
async function update(user: { id: string; role: string; active: boolean }) {
  await $fetch(`/api/admin/users/${user.id}`, {
    method: 'PATCH',
    body: { role: user.role, active: user.active },
  })
  await refresh()
}
</script>
<template>
  <div class="space-y-6">
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Access</p>
      <h1 class="mt-2 text-3xl font-semibold">Admin users</h1>
      <p class="mt-2 text-sm text-slate-600">
        Example: operations@licnost.com · ADMIN has full access; OPERATOR
        manages requests, orders and fulfillment.
      </p>
    </div>
    <form
      class="flex flex-wrap gap-2 rounded border bg-white p-4"
      @submit.prevent="createUser"
    >
      <input
        v-model="email"
        required
        type="email"
        placeholder="operator@example.com"
        class="rounded border px-3 py-2"
      /><select v-model="role" class="rounded border px-3 py-2">
        <option>OPERATOR</option>
        <option>ADMIN</option></select
      ><button
        class="rounded bg-black px-4 py-2 text-sm font-semibold text-white"
      >
        Add user</button
      ><span v-if="error" class="w-full text-sm text-red-700">{{ error }}</span>
    </form>
    <div class="overflow-x-auto rounded border bg-white">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Role</th>
            <th class="px-4 py-3">Active</th>
            <th class="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in data?.users || []" :key="user.id" class="border-b">
            <td class="px-4 py-3">{{ user.email }}</td>
            <td class="px-4 py-3">
              <select v-model="user.role" class="rounded border px-2 py-1">
                <option>OPERATOR</option>
                <option>ADMIN</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <input v-model="user.active" type="checkbox" />
            </td>
            <td class="px-4 py-3">
              <button class="underline" @click="update(user)">Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
