<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6 lg:p-8">
    <div class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-4xl text-center transform transition-all duration-300 hover:scale-105">
      <h2 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">题目统计列表</h2>

      <div v-if="sortedQuestionStats.length > 0" class="space-y-4 text-left">
        <div v-for="(stat, index) in sortedQuestionStats" :key="index"
          class="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4"
          :class="{ 'border-red-500': stat.incorrectAttempts > 0, 'border-green-500': stat.incorrectAttempts === 0 }">
          <p class="text-lg font-semibold text-gray-800">题目: {{ stat.question }}</p>
          <p class="text-md text-gray-700">答题次数: {{ stat.attempts }}</p>
          <p class="text-md" :class="{ 'text-red-600': stat.incorrectAttempts > 0, 'text-green-600': stat.incorrectAttempts === 0 }">
            错误次数: {{ stat.incorrectAttempts }}
          </p>
        </div>
      </div>
      <p v-else class="text-lg text-gray-600">暂无题目统计数据。</p>

      <button
        @click="goHome"
        class="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full transform transition-all duration-200 active:scale-95"
      >
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStatisticsStore } from '../stores/statistics';
import type { QuestionStatistics } from '../types/question.d';

/**
 * @property {object} statisticsStore - Statistics Store 实例。
 */
const statisticsStore = useStatisticsStore();

/**
 * @property {object} router - Vue Router 实例。
 */
const router = useRouter();

/**
 * @computed {QuestionStatistics[]} sortedQuestionStats - 按错误次数降序排序的题目统计数据。
 */
const sortedQuestionStats = computed<QuestionStatistics[]>(() => {
  return statisticsStore.getQuestionStatistics().sort((a, b) => b.incorrectAttempts - a.incorrectAttempts);
});

/**
 * @function goHome
 * @description 返回首页。
 * @returns {void}
 */
function goHome(): void {
  router.push({ name: 'Home' });
}
</script>

<style scoped>
/* Tailwind CSS handles most styling, no custom styles needed here */
</style>
