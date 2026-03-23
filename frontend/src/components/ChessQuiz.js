import { useState } from 'react';
import quizData from '../data/quizData';

function ChessQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected,     setSelected]     = useState(null);   // index of chosen option
  const [score,        setScore]         = useState(0);
  const [result,       setResult]        = useState('');    // "Correct!" / "Wrong! ..."
  const [submitted,    setSubmitted]     = useState(false); // locked after submitting
  const [finished,     setFinished]      = useState(false); // all questions done

  const current = quizData[currentIndex];

  // User clicks an option button
  const handleSelect = (index) => {
    if (submitted) return; // don't allow re-selecting after submit
    setSelected(index);
  };

  // User clicks Submit Answer
  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);

    const isCorrect = selected === current.answer;
    const newScore  = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setResult(
      isCorrect
        ? '✓ Correct!'
        : `✗ Wrong! The answer is: ${current.options[current.answer]}`
    );

    // After 1.5 s, advance to the next question (or end the quiz)
    setTimeout(() => {
      const next = currentIndex + 1;
      if (next < quizData.length) {
        setCurrentIndex(next);
        setSelected(null);
        setSubmitted(false);
        setResult('');
      } else {
        setFinished(true);
      }
    }, 1500);
  };

  // Restart from the beginning
  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setResult('');
    setSubmitted(false);
    setFinished(false);
  };

  // ── Conditional rendering: final score screen ────────────────────────────
  if (finished) {
    return (
      <div className='quiz-container'>
        <div className='quiz-inner'>
          <p className='quiz-question'>Quiz Complete!</p>
          <p className='quiz-score'>
            Your final score: <strong>{score}</strong> out of{' '}
            <strong>{quizData.length}</strong>
          </p>
          <button className='btn-primary' onClick={handleRestart}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // ── Normal quiz view ─────────────────────────────────────────────────────
  return (
    <div className='quiz-container'>
      <div className='quiz-inner'>
        <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '12px' }}>
          Test Your Chess Knowledge
        </h2>

        {/* Progress indicator */}
        <p style={{ fontSize: '0.82rem', color: 'var(--accent)', marginBottom: '6px' }}>
          Question {currentIndex + 1} of {quizData.length}
        </p>

        <p className='quiz-question'>{current.question}</p>

        {/* Render answer options with .map() */}
        <div className='quiz-options'>
          {current.options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option${selected === index ? ' selected' : ''}`}
              onClick={() => handleSelect(index)}
              disabled={submitted}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Submit button — disabled until an option is chosen */}
        <button
          className='btn-primary'
          onClick={handleSubmit}
          disabled={selected === null || submitted}
        >
          Submit Answer
        </button>

        {/* Result message shown after submit */}
        {result && <p className='quiz-result'>{result}</p>}
      </div>
    </div>
  );
}

export default ChessQuiz;
