<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6 lg:p-8">
    <h1 class="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-10 drop-shadow-lg animate-fade-in-down">
      刷题网站
    </h1>
    <div class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
      <div class="mb-8">
        <label for="question-count" class="block text-gray-800 text-lg font-semibold mb-3">选择题目数量:</label>
        <input
          id="question-count"
          type="number"
          v-model.number="questionCount"
          min="1"
          class="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="请输入题目数量"
        />
      </div>
      <button
        @click="startQuizHandler"
        class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full transform transition-all duration-200 active:scale-95"
      >
        开始测验
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';

/**
 * @property {number} questionCount - 用户选择的题目数量。
 */
const questionCount = ref<number>(10);

/**
 * @property {object} quizStore - Quiz Store 实例。
 */
const quizStore = useQuizStore();

/**
 * @property {object} router - Vue Router 实例。
 */
const router = useRouter();

/**
 * @function startQuizHandler
 * @description 处理开始测验按钮点击事件。
 * @returns {Promise<void>}
 */
async function startQuizHandler(): Promise<void> {
  if (questionCount.value > 0) {
    await quizStore.loadQuestions(questionCount.value);
    quizStore.startQuiz();
    await router.push({ name: 'Quiz', params: { count: questionCount.value.toString() } });
  }
}
</script>

<style scoped>
/* Tailwind CSS handles most styling, no custom styles needed here */
</style>
