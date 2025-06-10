import { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import UrlShortener from './components/UrlShortener';
import LiveStats from './components/LiveStats';
import './App.css';

function App() {
  const [currentShortCode, setCurrentShortCode] = useState<string | null>(null);

  const handleUrlShortened = (shortUrl: string, shortCode: string) => {
    console.log(shortUrl)
    setCurrentShortCode(shortCode);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <LinkIcon className="logo" />
          <h1>URL Shortener</h1>
          <p>Shorten your URLs and track their performance</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <section className="shortener-section">
            <UrlShortener onUrlShortened={handleUrlShortened} />
          </section>

          <section className="stats-section">
            <LiveStats shortCode={currentShortCode} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 URL Shortener. Built with React & TypeScript.</p>
      </footer>
    </div>
  );
}

export default App;
