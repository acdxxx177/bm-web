import { defineStore } from 'pinia';
import { ref } from 'vue';
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
        // 将解析后的对象转换为 Map
        questionStats.value = new Map(parsedStats.map((item: QuestionStatistics) => [item.question, item]));
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
      };
    }

    stats.attempts++;
    if (!isCorrect) {
      stats.incorrectAttempts++;
    }

    questionStats.value.set(questionContent, stats);
    saveStatistics(); // 每次更新后保存
  }

  /**
   * @function getQuestionStatistics
   * @description 获取所有题目的统计数据列表。
   * @returns {QuestionStatistics[]} 所有题目的统计数据数组。
   */
  function getQuestionStatistics(): QuestionStatistics[] {
    return Array.from(questionStats.value.values());
  }

  // 在 store 初始化时加载统计数据
  loadStatistics();

  return {
    questionStats,
    loadStatistics,
    saveStatistics,
    updateQuestionStats,
    getQuestionStatistics,
  };
});
