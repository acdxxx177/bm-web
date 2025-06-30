<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6 lg:p-8">
    <div class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
      <h2 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">测验结果</h2>
      <p class="text-2xl text-gray-800 mb-3">总题目数: <span class="font-bold">{{ quizStore.totalQuestions }}</span></p>
      <p class="text-2xl text-gray-800 mb-3">正确答案数: <span class="font-bold">{{ quizStore.correctAnswersCount }}</span></p>
      <p class="text-2xl text-gray-800 mb-8">正确率: <span class="font-bold text-green-600">{{ quizStore.percentageCorrect.toFixed(2) }}%</span></p>

      <div class="mt-8 pt-8 border-t-2 border-gray-200">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">题目统计</h3>
        <div v-if="statisticsStore.getQuestionStatistics().length > 0" class="space-y-4 text-left">
          <div v-for="(stat, index) in statisticsStore.getQuestionStatistics()" :key="index"
            class="bg-gray-50 p-4 rounded-lg shadow-sm">
            <p class="text-lg font-semibold text-gray-800">题目: {{ stat.question }}</p>
            <p class="text-md text-gray-700">答题次数: {{ stat.attempts }}</p>
            <p class="text-md text-red-600">错误次数: {{ stat.incorrectAttempts }}</p>
          </div>
        </div>
        <p v-else class="text-lg text-gray-600">暂无题目统计数据。</p>
      </div>

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
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';
import { useStatisticsStore } from '../stores/statistics';

/**
 * @property {object} quizStore - Quiz Store 实例。
 */
const quizStore = useQuizStore();

/**
 * @property {object} statisticsStore - Statistics Store 实例。
 */
const statisticsStore = useStatisticsStore();

/**
 * @property {object} router - Vue Router 实例。
 */
const router = useRouter();

/**
 * @function goHome
 * @description 重置测验并返回首页。
 * @returns {void}
 */
function goHome(): void {
  quizStore.resetQuiz();
  router.push({ name: 'Home' });
}
</script>

<style scoped>
/* Tailwind CSS handles most styling, no custom styles needed here */
</style>
