import { useEffect, useState, type ReactNode } from 'react';

/** Colours prop names and values in a `<Tree … />` snippet, one line at a time. */
function highlight(jsx: string): ReactNode[] {
  return jsx.split('\n').map((line, i) => {
    const match = /^(\s*)([A-Za-z]+)=(.*)$/.exec(line);
    const content = match ? (
      <>
        {match[1]}
        <span className="code__attr">{match[2]}</span>=<span className="code__val">{match[3]}</span>
      </>
    ) : (
      line
    );
    return (
      <span key={i}>
        {content}
        {'\n'}
      </span>
    );
  });
}

export function CodeDrawer({ jsx }: { jsx: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(jsx).then(() => setCopied(true));
  };

  return (
    <details className="code" open>
      <summary className="code__title">Your &lt;Tree /&gt;</summary>
      <div className="code__body">
        <pre className="code__pre">
          <code>{highlight(jsx)}</code>
        </pre>
        <p className="code__note">Only props that differ from the defaults are listed.</p>
        <button type="button" className="code__copy" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </details>
  );
}
