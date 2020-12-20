/* eslint-disable camelcase */

// The naming of the mock trees describes their shape.
// E.g. `mockTree_D1N2_D2N2` -> _Depth1with2Nodes_Depth2with2Nodes_...

export const mockTree_D1N2_D2N2 = [
  {
    name: 'Top Level',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
        children: [
          {
            name: '3: Son of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
          {
            name: '3: Daughter of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
        ],
      },
      {
        name: 'Level 2: B',
      },
    ],
  },
];

const mockData = [
  {
    name: 'Top Level',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: '2: A',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
        children: [
          {
            name: '3: Son of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
          {
            name: '3: Daughter of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
        ],
      },
      {
        name: '2: B',
      },
    ],
  },
];

const mockData2 = [
  {
    name: 'Top Level',
    parent: 'null',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        parent: 'Top Level',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
      },
    ],
  },
];

const mockData4 = [
  {
    name: 'Top Level',
    parent: 'null',
    attributes: {
      keyA: 'val A',
      keyB: 'val B',
      keyC: 'val C',
    },
    children: [
      {
        name: 'Level 2: A',
        parent: 'Top Level',
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
        children: [
          {
            name: 'Level 3: A',
            parent: 'Level 2: B',
          },
          {
            name: 'Level 3: B',
            parent: 'Level 2: A',
          },
        ],
      },
      {
        name: 'Level 2: B',
        parent: 'Level 2: A',
        children: [
          {
            name: 'Level 3: B',
            parent: 'Level 2: B',
          },
        ],
      },
    ],
  },
];

export { mockData, mockData2, mockData4 };
