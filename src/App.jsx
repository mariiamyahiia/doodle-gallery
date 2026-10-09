import DrawCanvas from './components/DrawCanvas';
import Gallery from './components/Gallery';

const TITLE = 'Doodle Gallery';

function App() {
  return (
    <>
      <header className="site-header">
        <h1 className="site-title" aria-label={TITLE}>
          {TITLE.split('').map((ch, i) => (
            <span key={i} className="letter" aria-hidden="true">
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h1>

        <svg className="squiggle" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M5 12 Q 20 2, 35 12 T 65 12 T 95 12 T 125 12 T 155 12 T 185 12 T 215 12 T 245 12 T 275 12 T 295 12"
            fill="none"
            stroke="#e59aa6"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>

        <p className="tagline">unleash your inner artist (or chaos)</p>
      </header>

      <main>
        <section className="panel">
          <h2 className="panel-title">Draw</h2>
          <DrawCanvas />
        </section>

        <section className="panel">
          <h2 className="panel-title">The Gallery</h2>
          <Gallery />
        </section>
      </main>
    </>
  );
}

export default App;