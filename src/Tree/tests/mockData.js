const mockData = [
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
      {
        name: 'Level 2: B',
        parent: 'Top Level',
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

export {
  mockData,
  mockData2,
};
