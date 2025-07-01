/**
 * @fileoverview 定义了项目中所有题目的类型接口。
 */

/**
 * @interface TrueFalseQuestion
 * @description 判断题接口。
 */
export interface TrueFalseQuestion {
  /**
   * @property {string} question - 题目内容。
   */
  question: string;
  /**
   * @property {boolean} answer - 正确答案 (true/false)。
   */
  answer: boolean;
  /**
   * @property {string} type - 题目类型。
   */
  type: '判断题';
}

/**
 * @interface FillInTheBlanksQuestion
 * @description 填空题接口。
 */
export interface FillInTheBlanksQuestion {
  /**
   * @property {string} question - 题目内容，包含下划线表示填空位置。
   */
  question: string;
  /**
 * @property {string[]} answer - 填空题的正确答案，每个空对应一个字符串。
 */
  answer: string[];
  /**
   * @property {string} type - 题目类型。
   */
  type: '填空题';
}

/**
 * @interface SingleChoiceQuestion
 * @description 单选题接口。
 */
export interface SingleChoiceQuestion {
  /**
   * @property {string} question - 题目内容。
   */
  question: string;
  /**
   * @property {string[]} options - 选项列表。
   */
  options: string[];
  /**
   * @property {string} answer - 正确选项的文本内容。
   */
  answer: string;
  /**
   * @property {string} type - 题目类型。
   */
  type: '单选题';
}

/**
 * @interface MultipleChoiceQuestion
 * @description 多选题接口。
 */
export interface MultipleChoiceQuestion {
  /**
   * @property {string} question - 题目内容。
   */
  question: string;
  /**
   * @property {string[]} options - 选项列表。
   */
  options: string[];
  /**
   * @property {string[]} answer - 正确选项的文本内容数组。
   */
  answer: string[];
  /**
   * @property {string} type - 题目类型。
   */
  type: '多选题';
}

/**
 * @interface ShortAnswerQuestion
 * @description 简答题接口。
 */
export interface ShortAnswerQuestion {
  /**
   * @property {string} question - 题目内容。
   */
  question: string;
  /**
   * @property {string} answer - 简答题的参考答案。
   */
  answer: string;
  /**
   * @property {string} type - 题目类型。
   */
  type: '简答题';
}

/**
 * @interface QuestionStatistics
 * @description 题目统计接口。
 */
export interface QuestionStatistics {
  /**
   * @property {string} question - 题目内容，作为唯一标识。
   */
  question: string;
  /**
   * @property {number} attempts - 答题次数。
   */
  attempts: number;
  /**
   * @property {number} incorrectAttempts - 错误次数。
   */
  incorrectAttempts: number;
  /**
   * @property {number} correctAttempts - 正确次数。
   */
  correctAttempts: number;
  /**
   * @property {number} consecutiveCorrectAttempts - 连续正确次数。
   */
  consecutiveCorrectAttempts: number;
}

/**
 * @typedef {TrueFalseQuestion | FillInTheBlanksQuestion | SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion} Question
 * @description 所有题目类型的联合类型。
 */
export type Question = TrueFalseQuestion | FillInTheBlanksQuestion | SingleChoiceQuestion | MultipleChoiceQuestion | ShortAnswerQuestion;