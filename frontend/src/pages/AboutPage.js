import ChessQuiz from '../components/ChessQuiz';

// Learning timeline items — rendered with .map() (Step 6 pattern)
const TIMELINE = [
  { year: '2013', text: 'Learned the basic movements of the pieces from my Aunt.' },
  { year: '2015', text: 'Paused to focus on damath, but eventually returned to chess.' },
  { year: '2020', text: 'Joined the local city chess club and participated in my first over-the-board tournament.' },
  { year: '2026', text: 'Continuing to learn and improve every day.' },
];

// Photo rows for each section — rendered with .map()
const LOVE_PHOTOS = [
  { src: 'pics/hello.jpg',  alt: 'Burning passion for chess'     },
  { src: 'pics/hello1.jpg', alt: 'Tournament play'               },
  { src: 'pics/hello6.jpg', alt: 'Studying tactics'              },
];

const JOURNEY_PHOTOS = [
  { src: 'pics/hello2.jpg', alt: 'Starting to learn chess'       },
  { src: 'pics/hello3.jpg', alt: 'A classic chess set'           },
  { src: 'pics/hello4.jpg', alt: 'Learning new tactics'          },
];

function AboutPage() {
  return (
    <>

      <main className='container'>

        {/* ── Section 1: What I Love About Chess ── */}
        <section className='card-warm' style={{ marginBottom: '30px' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '16px' }}>
            What I Love About Chess
          </h2>

          <p className='prose drop-cap' style={{ marginBottom: '12px' }}>
            Chess is often described as a game, but to me, it is a form of art and a
            rigorous mental discipline. What fascinates me most is its perfect-information
            nature. Unlike card games where hidden elements or luck play a role, in chess
            everything is laid out before you. If you lose, it isn't because of a bad draw;
            it is because your opponent found a deeper truth in the position than you did.
          </p>

          <p className='prose' style={{ marginBottom: '16px' }}>
            The complexity is staggering. After just three moves each, there are over nine
            million possible positions. This infinite depth ensures that no two games are
            ever truly the same, providing a lifetime of discovery and intellectual growth.
            Family and friends can be found in playing chess.
          </p>

          {/* Photo row rendered with .map() */}
          <div className='img-row'>
            {LOVE_PHOTOS.map(({ src, alt }) => (
              <img
                key={src}
                src={src}
                alt={alt}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>

          <blockquote style={{ marginTop: '20px' }}>
            "Chess is the struggle against the error." — Johannes Zukertort
          </blockquote>
        </section>

        {/* ── Section 2: Chess Quiz ── */}
        <section style={{ marginBottom: '30px' }}>
          {/* ChessQuiz is a self-contained child component */}
          <ChessQuiz />
        </section>

        {/* ── Section 3: My Journey with Chess ── */}
        <section className='card-warm'>
          <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '16px' }}>
            My Journey with Chess
          </h2>

          <p className='prose drop-cap' style={{ marginBottom: '16px' }}>
            My fascination with the "Game of Kings" began as a simple curiosity and evolved
            into a primary passion. It has taught me the importance of patience — the
            understanding that a premature attack often leads to disaster. It has also taught
            me resilience; in chess, as in life, you must learn to evaluate your mistakes
            without emotion to improve for the next round.
          </p>

          <h3 style={{ fontFamily: "'Cinzel', serif", margin: '16px 0 10px' }}>
            My Learning Timeline
          </h3>

          {/* Timeline rendered with .map() */}
          <ol style={{ marginLeft: '1.4rem' }}>
            {TIMELINE.map(({ year, text }) => (
              <li key={year} style={{ marginBottom: '8px' }}>
                <strong>{year}:</strong> {text}
              </li>
            ))}
          </ol>

          <p className='prose' style={{ margin: '16px 0' }}>
            Today, I continue to play whenever I have free time. Whether it is a fast-paced
            Blitz game or a slow, calculated Classical match, the thrill of finding a tactical
            combination — a fork or a pin — never gets old. My goal is to improve my critical
            thinking and share the joy of this game with the next generation of players.
          </p>

          {/* Journey photo row */}
          <div className='img-row'>
            {JOURNEY_PHOTOS.map(({ src, alt }) => (
              <img
                key={src}
                src={src}
                alt={alt}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>
        </section>

      </main>
    </>
  );
}

export default AboutPage;
