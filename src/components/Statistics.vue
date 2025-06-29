<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6 lg:p-8">
    <div class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
      <h2 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">测验结果</h2>
      <p class="text-2xl text-gray-800 mb-3">总题目数: <span class="font-bold">{{ quizStore.totalQuestions }}</span></p>
      <p class="text-2xl text-gray-800 mb-3">正确答案数: <span class="font-bold">{{ quizStore.correctAnswersCount }}</span></p>
      <p class="text-2xl text-gray-800 mb-8">正确率: <span class="font-bold text-green-600">{{ quizStore.percentageCorrect.toFixed(2) }}%</span></p>
      <button
        @click="goHome"
        class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full transform transition-all duration-200 active:scale-95"
      >
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';

/**
 * @property {object} quizStore - Quiz Store 实例。
 */
const quizStore = useQuizStore();

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
