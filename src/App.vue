<script setup lang="ts">
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold">刷题系统</span>
            </div>
            <nav class="ml-8 flex space-x-8">
              <router-link to="/" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                首页
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </header>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    
    <footer class="bg-white dark:bg-gray-800 shadow-inner mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} 刷题系统. 保留所有权利。
        </p>
      </div>
    </footer>
  </div>
</template>
