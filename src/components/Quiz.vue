<template>
  <div
    class="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6 lg:p-8">
    <div v-if="quizStore.quizStarted && !quizStore.quizFinished"
      class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 hover:scale-[1.01]">
      <div v-if="quizStore.isInfiniteMode"
        class="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
        正确率: {{ quizStore.percentageCorrect.toFixed(0) }}%
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">
        题目 {{ quizStore.currentQuestionIndex + 1 }} / {{ quizStore.totalQuestions }}
      </h2>
      <div v-if="quizStore.currentQuestion" class="mb-8">
        <p v-if="quizStore.currentQuestion.type !== '填空题'"
          class="text-xl sm:text-2xl text-gray-800 mb-6 leading-relaxed">{{ quizStore.currentQuestion.question }}</p>

        <!-- 判断题 -->
        <div v-if="quizStore.currentQuestion.type === '判断题'" class="space-y-4">
          <label
            class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            :class="{ 'bg-blue-50 border-blue-500': userAnswer === true && !quizStore.showAnswer, 'bg-green-100 border-green-500': quizStore.showAnswer && quizStore.currentQuestion.answer === true, 'bg-red-100 border-red-500': quizStore.showAnswer && quizStore.currentQuestion.answer === false && userAnswer === true }">
            <input type="radio" :value="true" v-model="userAnswer" :disabled="quizStore.showAnswer"
              class="form-radio h-5 w-5 text-blue-600 mr-3">
            <span class="text-lg text-gray-800">正确</span>
          </label>
          <label
            class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            :class="{ 'bg-blue-50 border-blue-500': userAnswer === false && !quizStore.showAnswer, 'bg-green-100 border-green-500': quizStore.showAnswer && quizStore.currentQuestion.answer === false, 'bg-red-100 border-red-500': quizStore.showAnswer && quizStore.currentQuestion.answer === true && userAnswer === false }">
            <input type="radio" :value="false" v-model="userAnswer" :disabled="quizStore.showAnswer"
              class="form-radio h-5 w-5 text-blue-600 mr-3">
            <span class="text-lg text-gray-800">错误</span>
          </label>
        </div>

        <!-- 填空题 -->
        <div v-else-if="quizStore.currentQuestion.type === '填空题'"
          class="text-xl sm:text-2xl text-gray-800 leading-relaxed">
          <template v-for="(part, index) in parsedFillInTheBlanksQuestion" :key="index">
            <span v-if="part.type === 'text'">{{ part.value }}</span>
            <input v-else type="text" v-model="fillInTheBlanksUserAnswers[part.index!]" :disabled="quizStore.showAnswer"
              :ref="(el) => { if (el) fillInTheBlanksInputs[part.index!] = el as HTMLInputElement }"
              :size="expectedFillInTheBlanksAnswerLengths[part.index!] || 10"
              class="inline-block min-w-[80px] max-w-full shadow-inner appearance-none border border-gray-300 rounded-lg py-2 px-3 text-gray-800 leading-tight focus:ring-2 focus:ring-blue-500 transition-all duration-200 align-middle"
              placeholder="填写" />
          </template>
        </div>

        <!-- 其他题型待实现 -->

        <button v-if="!quizStore.showAnswer" @click="submitAnswerHandler" :disabled="!canSubmitAnswer"
          class="mt-8 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full transform transition-all duration-200 active:scale-95">
          提交答案
        </button>

        <div v-if="quizStore.showAnswer" class="mt-8 p-6 rounded-lg border-l-4"
          :class="isAnswerCorrect ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'">
          <p class="text-lg font-semibold mb-2">你的答案: <span class="font-normal">{{ displayUserAnswer }}</span></p>
          <p class="text-lg font-semibold">正确答案: <span class="font-normal">{{ displayCorrectAnswer }}</span></p>
          <div class="mt-6 flex flex-col sm:flex-row gap-4">
            <button type="button" v-if="!isAnswerCorrect" @click="retryQuestion" ref="retryButton"
              class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 w-full sm:w-1/2 transform transition-all duration-200 active:scale-95">
              再试一次
            </button>
            <button @click="nextQuestionHandler"
              class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-1/2 transform transition-all duration-200 active:scale-95"
              :class="{ 'sm:w-full': isAnswerCorrect }">
              下一题
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="quizStore.quizFinished && !quizStore.isInfiniteMode"
      class="text-center bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
      <h2 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">测验结束！</h2>
      <p class="text-2xl text-gray-800 mb-3">你的得分: <span class="font-bold">{{ quizStore.correctAnswersCount }}</span> /
        <span class="font-bold">{{ quizStore.totalQuestions }}</span>
      </p>
      <p class="text-2xl text-gray-800 mb-8">正确率: <span class="font-bold text-green-600">{{
        quizStore.percentageCorrect.toFixed(2) }}%</span></p>
      <button @click="goToStatistics"
        class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full transform transition-all duration-200 active:scale-95">
        查看统计
      </button>
      <button @click="resetAndGoHome"
        class="mt-4 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 w-full transform transition-all duration-200 active:scale-95">
        返回首页
      </button>
    </div>

    <div v-else class="text-center bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">测验未开始或题目加载失败。</h2>
      <button @click="resetAndGoHome"
        class="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full transform transition-all duration-200 active:scale-95">
        返回首页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';
import type { TrueFalseQuestion, FillInTheBlanksQuestion } from '../types/question.d';

/**
 * @property {object} quizStore - Quiz Store 实例。
 */
const quizStore = useQuizStore();

/**
 * @property {object} router - Vue Router 实例。
 */
const router = useRouter();

/**
 * @property {string | boolean | string[] | null} userAnswer - 用户当前题目的答案（用于判断题）。
 */
const userAnswer = ref<string | boolean | string[] | null>(null);

/**
 * @property {string[]} fillInTheBlanksUserAnswers - 用户对填空题每个空的答案。
 */
const fillInTheBlanksUserAnswers = ref<string[]>([]);

onMounted(() => {
  console.log('Quiz.vue mounted. Current question:', quizStore.currentQuestion);
  if (quizStore.currentQuestion) {
    console.log('Current question type:', quizStore.currentQuestion.type);
  }
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

/**
 * @function handleKeyPress
 * @description 处理键盘按键事件，实现回车提交答案或进入下一题。
 * @param {KeyboardEvent} event - 键盘事件对象。
 * @returns {void}
 */
function handleKeyPress(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault();

    if (quizStore.showAnswer) {
      if (isAnswerCorrect.value) {
        nextQuestionHandler();
      } else {
        retryQuestion();
      }
    } else {
      if (canSubmitAnswer.value) {
        submitAnswerHandler();
      }
    }
  }
}

/**
 * @computed {boolean} canSubmitAnswer - 判断是否可以提交答案。
 */
const canSubmitAnswer = computed<boolean>(() => {
  const question = quizStore.currentQuestion;
  if (!question) {
    return false;
  }

  if (quizStore.showAnswer) {
    return false; // 已经显示答案，不能再次提交
  }

  if (question.type === '判断题') {
    return userAnswer.value !== null;
  } else if (question.type === '填空题') {
    // 确保所有填空都已填写且不为空
    const expectedBlanks = (question.question.match(/__/g) || []).length;
    return fillInTheBlanksUserAnswers.value.length === expectedBlanks &&
      fillInTheBlanksUserAnswers.value.every(answer => answer !== null && answer.trim() !== '');
  }
  return false;
});

/**
 * @computed {Array<{type: 'text' | 'input', value: string, index?: number}>} parsedFillInTheBlanksQuestion - 解析填空题题目，分解为文本和输入框占位符。
 */
const parsedFillInTheBlanksQuestion = computed(() => {
  const question = quizStore.currentQuestion;
  if (question?.type !== '填空题') {
    return [];
  }
  const parts = question.question.split(/(__)/g);
  let inputIndex = 0;
  return parts.map((part: string) => {
    if (part === '__') {
      return { type: 'input', value: '', index: inputIndex++ };
    } else {
      return { type: 'text', value: part };
    }
  });
});

/**
 * @computed {number[]} expectedFillInTheBlanksAnswerLengths - 获取填空题每个空对应的正确答案的长度。
 */
const MIN_INPUT_SIZE = 5; // 最小输入框宽度
const MAX_INPUT_SIZE = 30; // 最大输入框宽度

/**
 * @computed {number[]} expectedFillInTheBlanksAnswerLengths - 获取填空题每个空对应的正确答案的长度。
 */
const expectedFillInTheBlanksAnswerLengths = computed(() => {
  const question = quizStore.currentQuestion;
  if (question?.type === '填空题') {
    return (question as FillInTheBlanksQuestion).answer.map((ans: string) => {
      const calculatedSize = ans.length * 1.8; // 答案长度 + 2个字符的缓冲区
      return Math.max(MIN_INPUT_SIZE, Math.min(MAX_INPUT_SIZE, calculatedSize));
    });
  }
  return [];
});

/**
 * @computed {boolean} isAnswerCorrect - 判断用户答案是否正确。
 */
const isAnswerCorrect = computed<boolean>(() => {
  const question = quizStore.currentQuestion;
  if (!question) {
    return false;
  }

  if (question.type === '判断题') {
    return (userAnswer.value === (question as TrueFalseQuestion).answer);
  } else if (question.type === '填空题') {
    const correctAnswers = (question as FillInTheBlanksQuestion).answer.map((a: string) => a.trim().toLowerCase());
    const userAnswers = fillInTheBlanksUserAnswers.value.map((a: string) => a.trim().toLowerCase());
    // 严格按照顺序匹配
    if (correctAnswers.length !== userAnswers.length) {
      return false;
    }
    return correctAnswers.every((ca: string, index: number) => ca === userAnswers[index]);
  }
  return false;
});

/**
 * @computed {string} displayUserAnswer - 格式化显示用户答案。
 */
const displayUserAnswer = computed<string>(() => {
  const question = quizStore.currentQuestion;
  if (!question) {
    return '';
  }

  if (question.type === '判断题') {
    return userAnswer.value === true ? '正确' : (userAnswer.value === false ? '错误' : '');
  } else if (question.type === '填空题') {
    return fillInTheBlanksUserAnswers.value.join(', ');
  }
  return '';
});

/**
 * @computed {string} displayCorrectAnswer - 格式化显示正确答案。
 */
const displayCorrectAnswer = computed<string>(() => {
  const question = quizStore.currentQuestion;
  if (!question) {
    return '';
  }

  if (question.type === '判断题') {
    return (question as TrueFalseQuestion).answer ? '正确' : '错误';
  } else if (question.type === '填空题') {
    return (question as FillInTheBlanksQuestion).answer.join(', ');
  }
  return '';
});

/**
 * @function submitAnswerHandler
 * @description 处理提交答案。
 * @returns {void}
 */
function submitAnswerHandler(): void {
  const question = quizStore.currentQuestion;
  if (!question) {
    return;
  }

  if (question.type === '判断题') {
    if (userAnswer.value !== null) {
      quizStore.submitAnswer(userAnswer.value, quizStore.isRetrying);
    }
  } else if (question.type === '填空题') {
    quizStore.submitAnswer(fillInTheBlanksUserAnswers.value, quizStore.isRetrying);
  }

  if (!isAnswerCorrect.value) {
    nextTick(() => {
      retryButton.value?.focus();
    });
  }
}""

/**
 * @function retryQuestion
 * @description 处理重新答题。
 * @returns {void}
 */
async function retryQuestion(): Promise<void> {
  userAnswer.value = null; // 重置判断题用户答案
  fillInTheBlanksUserAnswers.value = []; // 重置填空题用户答案
  quizStore.showAnswer = false; // 隐藏答案
  quizStore.setRetrying(true); // 设置为重试状态

  // 如果是填空题，则在UI更新后聚焦到第一个输入框
  if (quizStore.currentQuestion?.type === '填空题') {
    const blanksCount = (quizStore.currentQuestion.question.match(/__/g) || []).length;
    fillInTheBlanksUserAnswers.value = Array(blanksCount).fill('');
    await nextTick();
    const firstInput = fillInTheBlanksInputs.value[0];
    if (firstInput) {
      firstInput.focus();
    }
  }
}

/**
 * @function nextQuestionHandler
 * @description 处理下一题。
 * @returns {void}
 */
function nextQuestionHandler(): void {
  userAnswer.value = null; // 重置判断题用户答案
  fillInTheBlanksUserAnswers.value = []; // 重置填空题用户答案
  quizStore.nextQuestion();
}

/**
 * @function goToStatistics
 * @description 跳转到统计页面。
 * @returns {Promise<void>}
 */
async function goToStatistics(): Promise<void> {
  await router.push({ name: 'Statistics' });
}

/**
 * @function resetAndGoHome
 * @description 重置测验并返回首页。
 * @returns {Promise<void>}
 */
async function resetAndGoHome(): Promise<void> {
  quizStore.resetQuiz();
  await router.push({ name: 'Home' });
}

const retryButton = ref<HTMLButtonElement | null>(null);
const fillInTheBlanksInputs = ref<(HTMLInputElement | null)[]>([]);

// 监听当前题目变化，重置用户答案并初始化填空题答案数组
watch(() => quizStore.currentQuestion, async (newQuestion) => {
  userAnswer.value = null;
  fillInTheBlanksUserAnswers.value = []; // Reset for all types
  quizStore.setRetrying(false); // Reset retry state when question changes

  if (newQuestion?.type === '填空题') {
    const blanksCount = (newQuestion.question.match(/__/g) || []).length;
    fillInTheBlanksUserAnswers.value = Array(blanksCount).fill('');
    await nextTick();
    const firstInput = fillInTheBlanksInputs.value[0];
    if (firstInput) {
      firstInput.focus();
    }
  }
});
</script>


<style scoped>
/* Tailwind CSS handles most styling, no custom styles needed here */
</style>