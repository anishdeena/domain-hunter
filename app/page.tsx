'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface DomainResult {
  domain: string;
  available: boolean;
  price: string;
  buyLink: string;
}

export default function Home() {
  const [tld, setTld] = useState<'ai' | 'com'>('ai');
  const [charCount, setCharCount] = useState(4);
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [checked, setChecked] = useState(0);
  const [readableOnly, setReadableOnly] = useState(true);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [clock, setClock] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to bottom when new results arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  const search = useCallback(async () => {
    if (searching) {
      abortRef.current?.abort();
      setSearching(false);
      return;
    }

    setResults([]);
    setChecked(0);
    setSearching(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/search?tld=${tld}&length=${charCount}&readable=${readableOnly ? '1' : '0'}`,
        { signal: controller.signal }
      );

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'progress') {
              setChecked(data.checked);
            } else if (data.type === 'result') {
              setResults((prev) => [...prev, data.result]);
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error(e);
    } finally {
      setSearching(false);
    }
  }, [searching, tld, charCount, readableOnly]);

  const availableCount = results.filter((r) => r.available).length;
  const displayed = showOnlyAvailable
    ? results.filter((r) => r.available)
    : results;

  return (
    <>
      <div className="app-layout">
        {/* ─── Sidebar ─── */}
        <div className="sidebar">
          <div className="window" style={{ flex: 'none' }}>
            <div className="titlebar">
              <span className="titlebar-text">Search Options</span>
              <div className="titlebar-buttons">
                <button className="titlebar-btn">_</button>
              </div>
            </div>
            <div className="window-body">
              <div className="control-panel">
                <div className="field-group">
                  <span className="field-label">Domain TLD</span>
                  <div className="radio-group">
                    {(['ai', 'com'] as const).map((t) => (
                      <button
                        key={t}
                        className={`radio-option ${tld === t ? 'active' : ''}`}
                        onClick={() => setTld(t)}
                      >
                        .{t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-group">
                  <span className="field-label">Characters</span>
                  <span className="field-hint">Length of domain name</span>
                  <div className="number-input-wrap">
                    <input
                      type="number"
                      className="number-input"
                      value={charCount}
                      min={2}
                      max={6}
                      onChange={(e) =>
                        setCharCount(
                          Math.max(2, Math.min(6, parseInt(e.target.value) || 2))
                        )
                      }
                    />
                    <div className="number-btn-col">
                      <button
                        className="number-btn"
                        onClick={() =>
                          setCharCount((c) => Math.min(6, c + 1))
                        }
                      >
                        &#9650;
                      </button>
                      <button
                        className="number-btn"
                        onClick={() =>
                          setCharCount((c) => Math.max(2, c - 1))
                        }
                      >
                        &#9660;
                      </button>
                    </div>
                  </div>
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    className="win-checkbox"
                    checked={readableOnly}
                    onChange={(e) => setReadableOnly(e.target.checked)}
                  />
                  <span className="checkbox-label">Readable only</span>
                  <span className="checkbox-hint">
                    Skip unpronounceable combos
                  </span>
                </label>

                <button
                  className={`btn-go ${searching ? 'searching' : ''}`}
                  onClick={search}
                >
                  {searching ? 'Stop' : 'Go'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="window" style={{ flex: 1 }}>
            <div className="titlebar">
              <span className="titlebar-text">Status</span>
            </div>
            <div className="window-body">
              <div className="stats-panel">
                <div className="stat-row">
                  <span className="stat-label">Checked</span>
                  <span className="stat-value blue">{checked}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Available</span>
                  <span className="stat-value green">{availableCount}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Taken</span>
                  <span className="stat-value">
                    {results.length - availableCount}
                  </span>
                </div>
                {searching && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, (checked / Math.min(Math.pow(26, charCount), 500)) * 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Results ─── */}
        <div className="main-area window">
          <div className="titlebar">
            <span className="titlebar-text">
              Domain Finder &mdash; {charCount}-letter .{tld} domains
            </span>
            <div className="titlebar-buttons">
              <button className="titlebar-btn">_</button>
              <button className="titlebar-btn">&#9633;</button>
              <button className="titlebar-btn">&times;</button>
            </div>
          </div>
          <div className="window-body results-container">
            <div className="results-toolbar">
              <button
                className={`filter-btn ${!showOnlyAvailable ? 'active' : ''}`}
                onClick={() => setShowOnlyAvailable(false)}
              >
                All ({results.length})
              </button>
              <button
                className={`filter-btn ${showOnlyAvailable ? 'active' : ''}`}
                onClick={() => setShowOnlyAvailable(true)}
              >
                Available ({availableCount})
              </button>
            </div>
            <div className="results-header">
              <span>Domain</span>
              <span>Status</span>
              <span>Est. Price</span>
              <span></span>
            </div>
            <div className="results-scroll" ref={scrollRef}>
              {displayed.length === 0 && !searching ? (
                <div className="empty-state">
                  <div className="empty-icon">&#9632;</div>
                  <div className="empty-text">
                    Select a TLD and character count, then hit Go to scan for
                    available domains.
                  </div>
                </div>
              ) : (
                displayed.map((r, i) => (
                  <div className="result-row" key={r.domain + i}>
                    <span className="domain-name">{r.domain}</span>
                    <span
                      className={`status-badge ${r.available ? 'available' : 'taken'}`}
                    >
                      {r.available ? 'Available' : 'Taken'}
                    </span>
                    <span className="price-text">
                      {r.available ? r.price : '—'}
                    </span>
                    <span>
                      {r.available && (
                        <a
                          href={r.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="buy-link"
                        >
                          Buy &rarr;
                        </a>
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
            {searching && (
              <div className="scan-indicator">
                <div className="scan-dot" />
                <span className="scan-text">
                  Scanning {charCount}-letter .{tld} domains...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Taskbar ─── */}
      <div className="taskbar">
        <button className="start-btn">
          <span style={{ fontSize: 13 }}>&#9632;</span> Start
        </button>
        <button className="taskbar-item">
          &#9632; Domain Finder
        </button>
        <div className="taskbar-clock">{clock}</div>
      </div>
    </>
  );
}
