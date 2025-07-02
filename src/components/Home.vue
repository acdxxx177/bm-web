<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6 lg:p-8">
    <h1 class="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-10 drop-shadow-lg animate-fade-in-down">
      刷题网站
    </h1>
    <div class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
      <div class="mb-8">
        <label for="fill-in-the-blank-count" class="block text-gray-800 text-lg font-semibold mb-3">填空题数量:</label>
        <input
          id="fill-in-the-blank-count"
          type="number"
          v-model.number="fillInTheBlankCount"
          min="0"
          class="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="请输入填空题数量"
        />
      </div>
      <div class="mb-8">
        <label for="true-false-count" class="block text-gray-800 text-lg font-semibold mb-3">判断题数量:</label>
        <input
          id="true-false-count"
          type="number"
          v-model.number="trueFalseCount"
          min="0"
          class="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="请输入判断题数量"
        />
      </div>

      <div class="mb-8 flex items-center">
        <input
          id="infinite-mode"
          type="checkbox"
          v-model="isInfiniteMode"
          class="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label for="infinite-mode" class="ml-2 block text-gray-800 text-lg font-semibold">无限循环模式</label>
      </div>

      <div v-if="isInfiniteMode" class="mb-8">
        <label for="questions-to-add" class="block text-gray-800 text-lg font-semibold mb-3">每次增加题目数量:</label>
        <input
          id="questions-to-add"
          type="number"
          v-model.number="questionsToAddCount"
          min="1"
          class="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="请输入每次增加的题目数量"
        />
      </div>

      <div v-if="isInfiniteMode" class="mb-8">
        <label for="max-questions-in-pool" class="block text-gray-800 text-lg font-semibold mb-3">题池最大容量:</label>
        <input
          id="max-questions-in-pool"
          type="number"
          v-model.number="maxQuestionsInPool"
          min="1"
          class="shadow-inner appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="请输入题池最大容量"
        />
      </div>
      <button
        @click="startQuizHandler"
        class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full transform transition-all duration-200 active:scale-95"
      >
        开始测验
      </button>
      <button
        @click="goToQuestionStatsList"
        class="mt-4 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 w-full transform transition-all duration-200 active:scale-95"
      >
        查看题目统计
      </button>
      <button
        @click="startIncorrectQuizHandler"
        class="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full transform transition-all duration-200 active:scale-95"
      >
        错题训练
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';

/**
 * @property {number} fillInTheBlankCount - 用户选择的填空题数量。
 */
const fillInTheBlankCount = ref<number>(5);

/**
 * @property {number} trueFalseCount - 用户选择的判断题数量。
 */
const trueFalseCount = ref<number>(5);

/**
 * @property {boolean} isInfiniteMode - 是否启用无限循环模式。
 */
const isInfiniteMode = ref<boolean>(false);

/**
 * @property {number} questionsToAddCount - 无限循环模式下每次增加的题目数量。
 */
const questionsToAddCount = ref<number>(2);

/**
 * @property {number} maxQuestionsInPool - 无限循环模式下题池的最大容量。
 */
const maxQuestionsInPool = ref<number>(20);

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
  const totalQuestions = fillInTheBlankCount.value + trueFalseCount.value;

  if (totalQuestions > 0) {
    await quizStore.loadQuestions({
      fillInTheBlank: fillInTheBlankCount.value,
      trueFalse: trueFalseCount.value,
      isInfiniteMode: isInfiniteMode.value,
      questionsToAdd: questionsToAddCount.value,
      maxQuestions: maxQuestionsInPool.value, // Pass the new value
    });
    quizStore.startQuiz();
    await router.push({ name: 'Quiz', params: { count: totalQuestions.toString() } });
  }
}

/**
 * @function goToQuestionStatsList
 * @description 跳转到题目统计列表页面。
 * @returns {Promise<void>}
 */
async function goToQuestionStatsList(): Promise<void> {
  await router.push({ name: 'QuestionStatsList' });
}

/**
 * @function startIncorrectQuizHandler
 * @description 处理开始错题训练按钮点击事件。
 * @returns {Promise<void>}
 */
async function startIncorrectQuizHandler(): Promise<void> {
  await quizStore.loadIncorrectQuestions();
  if (quizStore.totalQuestions > 0) {
    quizStore.startQuiz();
    await router.push({ name: 'Quiz', params: { count: quizStore.totalQuestions.toString() } });
  } else {
    alert('暂无错题可供训练！');
  }
}
</script>

<style scoped>
/* Tailwind CSS handles most styling, no custom styles needed here */
</style>
