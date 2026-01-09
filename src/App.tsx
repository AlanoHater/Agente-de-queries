import { useState, FormEvent } from 'react';
import './App.css';

interface QueryResponse {
  output: string;
  error: boolean;
}

function App() {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError(true);
      setResponse('Por favor, ingresa una consulta válida.');
      return;
    }

    setLoading(true);
    setError(false);
    setResponse('');

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data: QueryResponse = await res.json();
      
      setResponse(data.output);
      setError(data.error || !res.ok);
      
    } catch (err) {
      setError(true);
      setResponse(
        'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResponse('');
    setError(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 Agente SQL con IA</h1>
          <p className="subtitle">
            Consulta tu base de datos en lenguaje natural usando GPT-4 y LangChain
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="query-section">
          <form onSubmit={handleSubmit} className="query-form">
            <div className="input-group">
              <label htmlFor="query-input" className="input-label">
                Tu consulta
              </label>
              <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ejemplo: Muéstrame los últimos 5 usuarios registrados"
                className="query-input"
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : (
                  '🔍 Consultar'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                disabled={loading}
              >
                🗑️ Limpiar
              </button>
            </div>
          </form>
        </div>

        {response && (
          <div className={`response-section ${error ? 'error' : 'success'}`}>
            <div className="response-header">
              <h2>{error ? '❌ Error' : '✅ Resultado'}</h2>
            </div>
            <div className="response-content">
              <pre>{response}</pre>
            </div>
          </div>
        )}

        <div className="examples-section">
          <h3>💡 Ejemplos de consultas</h3>
          <div className="examples-grid">
            <button
              className="example-card"
              onClick={() => setQuery('Muéstrame todas las tablas de la base de datos')}
              disabled={loading}
            >
              <span className="example-icon">📊</span>
              <span className="example-text">Ver tablas disponibles</span>
            </button>
            
            <button
              className="example-card"
              onClick={() => setQuery('Cuántos registros hay en total')}
              disabled={loading}
            >
              <span className="example-icon">🔢</span>
              <span className="example-text">Contar registros</span>
            </button>
            
            <button
              className="example-card"
              onClick={() => setQuery('Muéstrame los últimos 10 registros')}
              disabled={loading}
            >
              <span className="example-icon">📝</span>
              <span className="example-text">Últimos registros</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Potenciado por <strong>OpenAI GPT-4</strong>, <strong>LangChain</strong> y{' '}
          <strong>Supabase</strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
