const debugData = [
  {
    name: '1',
    children: [
      {
        name: '2',
      }, {
        name: '2',
      }
    ]
  }
];

const treeData = [
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

const treeData2 = [
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
            name: 'Son of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
          {
            name: 'Daughter of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
          {
            name: 'Son of A',
          },
          {
            name: 'Daughter of A',
          },
        ],
      },
      {
        name: 'Level 2: B',
        children: [
          {
            name: 'Son of B',
          },
          {
            name: 'Daughter of B',
          },
        ],
      },
    ],
  },
];

const collapseData = {
  name: 'Top Level',
  attributes: {
    keyA: 'val A',
    keyB: 'val B',
    keyC: 'val C',
  },
  children: [{
      name: 'Level 2: A',
      attributes: {
          _collapsed: `true`
        },
        _collapsed: true,
      children: [{
          name: 'Level 3: A',
          attributes: {
              _collapsed: `true`
            },
            _collapsed: true,
          children: [{
              name: 'Son of A',
            },
            {
              name: 'Daughter of A',
            },
            {
              name: 'Son of A',
            },
            {
              name: 'Daughter of A',
            },
          ],
        },
        {
          name: 'Daughter of A',
        },
        {
          name: 'Son of A',
        },
        {
          name: 'Daughter of A',
        },
      ],
    },
    {
      name: 'Level 2: B',
      children: [{
          name: 'Son of B',
        },
        {
          name: 'Daughter of B',
        },
      ],
    },
  ],
};

const individualShapesData = [
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
        nodeSvgShape:  {
          shape: 'rect',
          shapeProps: {
            width: 20,
            height: 20,
            x: -10,
            y: -10,
          },
        },
        attributes: {
          keyA: 'val A',
          keyB: 'val B',
          keyC: 'val C',
        },
        children: [
          {
            name: 'Son of A',
            nodeSvgShape:  {
              shape: 'rect',
              shapeProps: {
                width: 20,
                height: 20,
                x: -10,
                y: -10,
              },
            },
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
          {
            name: 'Daughter of A',
            attributes: {
              keyA: 'val A',
              keyB: 'val B',
              keyC: 'val C',
            },
          },
          {
            name: 'Son of A',
            nodeSvgShape:  {
              shape: 'rect',
              shapeProps: {
                width: 20,
                height: 20,
                x: -10,
                y: -10,
              },
            },
          },
          {
            name: 'Daughter of A',
          },
        ],
      },
      {
        name: 'Level 2: B',
        children: [
          {
            name: 'Son of B',
            nodeSvgShape:  {
              shape: 'rect',
              shapeProps: {
                width: 20,
                height: 20,
                x: -10,
                y: -10,
              },
            },
          },
          {
            name: 'Daughter of B',
            nodeSvgShape:  {
              shape: 'rect',
              shapeProps: {
                width: 20,
                height: 20,
                x: -10,
                y: -10,
              },
            },
          },
        ],
      },
    ],
  },
]

const mockFlatArray = [{
  "parent": "CSVNode1",
  "child": "CSVNode2",
  "FlatJSON Attribute A": "22",
  "FlatJSON Attribute B": "someValue"
}, {
  "parent": "CSVNode1",
  "child": "CSVNode3",
  "FlatJSON Attribute A": "23",
  "FlatJSON Attribute B": "someValue"
}, {
  "parent": "CSVNode2",
  "child": "CSVNode4",
  "FlatJSON Attribute A": "1",
  "FlatJSON Attribute B": "someValue"
}, {
  "parent": "CSVNode2",
  "child": "CSVNode5",
  "FlatJSON Attribute A": "2",
  "FlatJSON Attribute B": "someValue"
}];

const hierarchy = [
  {
    "children": [
      {
        "children": [
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          }
        ],
        "name": "test"
      },
      {
        "name": "test"
      },
      {
        "children": [
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              }
            ],
            "name": "test"
          }
        ],
        "name": "test"
      },
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "children": [
                      {
                        "name": "test"
                      }
                    ],
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          }
        ],
        "name": "test"
      },
      {
        "children": [
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          }
        ],
        "name": "test"
      },
      {
        "children": [
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "name": "test"
          }
        ],
        "name": "test"
      },
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          }
        ],
        "name": "test"
      },
      {
        "children": [
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "children": [
                      {
                        "name": "test"
                      }
                    ],
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "children": [
                  {
                    "name": "test"
                  },
                  {
                    "name": "test"
                  }
                ],
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              }
            ],
            "name": "test"
          },
          {
            "name": "test"
          },
          {
            "children": [
              {
                "name": "test"
              },
              {
                "name": "test"
              },
              {
                "name": "test"
              }
            ],
            "name": "test"
          }
        ],
        "name": "test"
      }
    ],
    "name": "test"
  }
]


export {
  debugData,
  treeData,
  treeData2,
  collapseData,
  mockFlatArray,
  hierarchy,
  individualShapesData
}
