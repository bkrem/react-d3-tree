import { useState } from 'react';
import { parseDatasetJson, type Dataset } from '../data/datasets.js';
import type { DatasetId } from '../state/playground.js';

interface DataPanelProps {
  datasets: Dataset[];
  selected: DatasetId;
  onSelect: (id: DatasetId) => void;
  onLoadCustom: (dataset: Dataset) => void;
}

export function DataPanel({ datasets, selected, onSelect, onLoadCustom }: DataPanelProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const result = parseDatasetJson(text);
    if (result.ok) {
      setError(null);
      onLoadCustom(result.dataset);
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <fieldset className="datasets">
        <legend className="sr-only">Dataset</legend>
        {datasets.map(dataset => (
          <label
            key={dataset.id}
            className={
              dataset.id === selected ? 'datasets__opt datasets__opt--on' : 'datasets__opt'
            }
          >
            <input
              type="radio"
              className="sr-only"
              name="dataset"
              value={dataset.id}
              checked={dataset.id === selected}
              onChange={() => onSelect(dataset.id)}
            />
            <span className="datasets__dot" aria-hidden="true" />
            <span>{dataset.label}</span>
            <span className="datasets__n">{dataset.nodeCount.toLocaleString()}</span>
          </label>
        ))}
      </fieldset>

      <details className="paste">
        <summary>Paste your own JSON</summary>
        <label className="sr-only" htmlFor="paste-json">
          JSON for the data prop
        </label>
        <textarea
          id="paste-json"
          className="paste__text"
          rows={8}
          spellCheck={false}
          placeholder={'{ "name": "root", "children": [{ "name": "leaf" }] }'}
          value={text}
          onChange={evt => setText(evt.target.value)}
        />
        {error && (
          <p className="paste__error" role="alert">
            {error}
          </p>
        )}
        <div className="paste__actions">
          <button type="button" className="btn" onClick={load} disabled={text.trim() === ''}>
            Load JSON
          </button>
        </div>
        <p className="hint">
          A root node, or an array holding one. Each node has a <code>name</code>, optional{' '}
          <code>attributes</code>, and <code>children</code>. Pasted data isn't part of the
          shareable URL.
        </p>
      </details>
    </>
  );
}
