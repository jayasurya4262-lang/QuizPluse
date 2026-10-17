import { describe, it, expect } from 'vitest';
import { evaluateAttempt, QuestionWithOptions, StudentAnswerInput } from '../services/evaluation.service';

describe('Evaluation Service (TRIAL-33, TRIAL-34, TRIAL-35)', () => {
  const sampleQuestions: QuestionWithOptions[] = [
    {
      id: 'q1',
      type: 'MCQ',
      text: 'What is 2 + 2?',
      marks: 2,
      explanation: 'Basic math',
      options: [
        { id: 'opt1', text: '3', isCorrect: false },
        { id: 'opt2', text: '4', isCorrect: true },
        { id: 'opt3', text: '5', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      type: 'SHORT_ANSWER',
      text: 'What is the capital of France?',
      marks: 3,
      expectedAnswer: 'Paris;paris',
      explanation: 'Paris is the capital.',
      options: [],
    },
    {
      id: 'q3',
      type: 'MCQ',
      text: 'Is water liquid at room temperature?',
      marks: 1,
      options: [
        { id: 'opt4', text: 'Yes', isCorrect: true },
        { id: 'opt5', text: 'No', isCorrect: false },
      ],
    },
  ];

  it('correctly evaluates all correct answers and calculates percentage and pass threshold', () => {
    const studentAnswers: StudentAnswerInput[] = [
      { questionId: 'q1', selectedOptionId: 'opt2' }, // +2
      { questionId: 'q2', textAnswer: 'Paris' }, // +3
      { questionId: 'q3', selectedOptionId: 'opt4' }, // +1
    ];

    const result = evaluateAttempt(sampleQuestions, studentAnswers, 60);

    expect(result.score).toBe(6);
    expect(result.totalMarks).toBe(6);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctCount).toBe(3);
    expect(result.incorrectCount).toBe(0);
    expect(result.unansweredCount).toBe(0);
  });

  it('handles partial correctness, case-insensitive trimmed short answers, and failure threshold', () => {
    const studentAnswers: StudentAnswerInput[] = [
      { questionId: 'q1', selectedOptionId: 'opt1' }, // wrong (0)
      { questionId: 'q2', textAnswer: '  paris  ' }, // trimmed lowercase match (+3)
      // q3 is unanswered
    ];

    const result = evaluateAttempt(sampleQuestions, studentAnswers, 70);

    expect(result.score).toBe(3);
    expect(result.totalMarks).toBe(6);
    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(false); // 50% < 70% threshold
    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.unansweredCount).toBe(1);
  });

  it('handles completely unanswered attempt', () => {
    const result = evaluateAttempt(sampleQuestions, [], 50);

    expect(result.score).toBe(0);
    expect(result.totalMarks).toBe(6);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.correctCount).toBe(0);
    expect(result.incorrectCount).toBe(0);
    expect(result.unansweredCount).toBe(3);
  });
});
