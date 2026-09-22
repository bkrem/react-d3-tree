import type { RawNodeDatum } from '../../index.js';

// The naming of the mock trees describes their shape.
// E.g. `mockTree_D1N2_D2N2` -> _Depth1with2Nodes_Depth2with2Nodes_...

const attributes = {
  keyA: 'val A',
  keyB: 'val B',
  keyC: 'val C',
};

export const mockTree_D1N2_D2N2: RawNodeDatum = {
  name: 'Top Level',
  attributes,
  children: [
    {
      name: 'Level 2: A',
      attributes,
      children: [
        { name: '3: Son of A', attributes },
        { name: '3: Daughter of A', attributes },
      ],
    },
    {
      name: 'Level 2: B',
    },
  ],
};

export const mockData: RawNodeDatum = {
  name: 'Top Level',
  attributes,
  children: [
    {
      name: '2: A',
      attributes,
      children: [
        { name: '3: Son of A', attributes },
        { name: '3: Daughter of A', attributes },
      ],
    },
    {
      name: '2: B',
    },
  ],
};

export const mockData2: RawNodeDatum = {
  name: 'Top Level',
  attributes,
  children: [
    {
      name: 'Level 2: A',
      attributes,
    },
  ],
};

// The README's usage example.
export const orgChart: RawNodeDatum = {
  name: 'CEO',
  children: [
    {
      name: 'Manager',
      attributes: { department: 'Production' },
      children: [
        {
          name: 'Foreman',
          attributes: { department: 'Fabrication' },
          children: [{ name: 'Worker' }],
        },
        {
          name: 'Foreman',
          attributes: { department: 'Assembly' },
          children: [{ name: 'Worker' }],
        },
      ],
    },
  ],
};

export const mockData4: RawNodeDatum = {
  name: 'Top Level',
  attributes,
  children: [
    {
      name: 'Level 2: A',
      attributes,
      children: [{ name: 'Level 3: A' }, { name: 'Level 3: B' }],
    },
    {
      name: 'Level 2: B',
      children: [{ name: 'Level 3: B' }],
    },
  ],
};
