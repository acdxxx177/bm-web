import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QuestionStatistics } from '../types/question.d';

/**
 * @constant {string} LOCAL_STORAGE_KEY - localStorage 中存储统计数据的键名。
 */
const LOCAL_STORAGE_KEY = 'quizStatistics';

/**
 * @function useStatisticsStore
 * @description 定义并返回统计 Store。
 * @returns {object} Statistics Store 实例。
 */
export const useStatisticsStore = defineStore('statistics', () => {
  /**
   * @property {Map<string, QuestionStatistics>} questionStats - 存储每个题目的统计数据，以题目内容作为键。
   */
  const questionStats = ref<Map<string, QuestionStatistics>>(new Map());

  /**
   * @function loadStatistics
   * @description 从 localStorage 加载统计数据。
   * @returns {void}
   */
  function loadStatistics(): void {
    try {
      const storedStats = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        const validStats = parsedStats.map((item: any) => ({
          ...item,
          attempts: Number(item.attempts) || 0,
          incorrectAttempts: Number(item.incorrectAttempts) || 0,
          correctAttempts: Number(item.correctAttempts) || 0,
          consecutiveCorrectAttempts: Number(item.consecutiveCorrectAttempts) || 0,
        }));
        questionStats.value = new Map(validStats.map((item: QuestionStatistics) => [item.question, item]));
      }
    } catch (error) {
      console.error('Failed to load statistics from localStorage:', error);
    }
  }

  /**
   * @function saveStatistics
   * @description 将统计数据保存到 localStorage。
   * @returns {void}
   */
  function saveStatistics(): void {
    try {
      // 将 Map 转换为数组以便存储
      const statsArray = Array.from(questionStats.value.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(statsArray));
    } catch (error) {
      console.error('Failed to save statistics to localStorage:', error);
    }
  }

  /**
   * @function updateQuestionStats
   * @description 更新单个题目的统计数据。
   * @param {string} questionContent - 题目内容，作为唯一标识。
   * @param {boolean} isCorrect - 本次答题是否正确。
   * @returns {void}
   */
  function updateQuestionStats(questionContent: string, isCorrect: boolean): void {
    let stats = questionStats.value.get(questionContent);
    if (!stats) {
      stats = {
        question: questionContent,
        attempts: 0,
        incorrectAttempts: 0,
        correctAttempts: 0,
        consecutiveCorrectAttempts: 0,
      };
    }

    stats.attempts++;
    if (isCorrect) {
      stats.correctAttempts++;
      stats.consecutiveCorrectAttempts++;
    } else {
      stats.incorrectAttempts++;
      stats.consecutiveCorrectAttempts = 0; // 如果答错，则重置连续答对次数
    }

    questionStats.value.set(questionContent, stats);
    saveStatistics(); // 每次更新后保存
  }

  /**
   * @function markQuestionAsMastered
   * @description 将指定题目标记为已掌握，重置其错误次数和连续答对次数。
   * @param {string} questionContent - 题目内容，作为唯一标识。
   * @returns {void}
   */
  function markQuestionAsMastered(questionContent: string): void {
    let stats = questionStats.value.get(questionContent);
    if (stats) {
      stats.incorrectAttempts = 0;
      stats.consecutiveCorrectAttempts = 0;
      questionStats.value.set(questionContent, stats);
      saveStatistics();
    }
  }

  /**
   * @function getQuestionStatistics
   * @description 获取所有题目的统计数据列表。
   * @returns {QuestionStatistics[]} 所有题目的统计数据数组。
   */
  function getQuestionStatistics(): QuestionStatistics[] {
    return Array.from(questionStats.value.values());
  }

  const MASTERY_THRESHOLD = 3; // This should be consistent with quiz.ts

  const masteredQuestionsCount = computed(() => {
    return Array.from(questionStats.value.values()).filter(stats => stats.consecutiveCorrectAttempts >= MASTERY_THRESHOLD).length;
  });

  const incorrectQuestionsCount = computed(() => {
    return Array.from(questionStats.value.values()).filter(stats => stats.incorrectAttempts > 0).length;
  });

  // 在 store 初始化时加载统计数据
  loadStatistics();

  return {
    questionStats,
    loadStatistics,
    saveStatistics,
    updateQuestionStats,
    markQuestionAsMastered,
    getQuestionStatistics,
    masteredQuestionsCount,
    incorrectQuestionsCount,
  };
});
