import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Tree from '../../index.js';
import { mockData, orgChart } from './mockData.js';
import { maskMarkup, renderedMarkup } from './helpers.js';

describe('server rendering', () => {
  it.each([
    ['default props', { data: mockData }],
    ['initialDepth 1, vertical', { data: orgChart, orientation: 'vertical', initialDepth: 1 }],
    ['zoom and translate', { data: mockData, zoom: 0.5, translate: { x: 100, y: 50 } }],
  ] as const)('produces the mounted markup for %s', (_name, props) => {
    const server = maskMarkup(renderToString(<Tree {...props} />));
    const client = renderedMarkup(render(<Tree {...props} />).container);

    expect(server).toBe(client);
    expect(server).not.toContain('opacity');
  });
});
