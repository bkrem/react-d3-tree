import React from 'react';
import { shallow } from 'enzyme';
import ForeignObjectElement, { BASE_MARGIN } from '../ForeignObjectElement';

const TestComponent = () => <div />;

const mockNodeData = {
  id: 'abc123',
  name: 'mockNode',
  depth: 3,
  x: 111,
  y: 222,
  parent: {
    x: 999,
    y: 888,
  },
};

const mockProps = {
  nodeData: mockNodeData,
  nodeSize: {
    x: 123,
    y: 321,
  },
  render: <TestComponent />,
};

describe('<ForeignObjectElement />', () => {
  const setup = (addedProps, renderer = shallow) => {
    const props = {
      ...mockProps,
      ...addedProps,
    };
    return renderer(<ForeignObjectElement {...props} />);
  };

  describe('props.render', () => {
    it('clones the NodeLabelComponent defined in `props.render` as expected', () => {
      const renderedComponent = setup();
      expect(renderedComponent.find(TestComponent).length).toBe(1);
    });

    it('passes `props.nodeData` into the rendered NodeLabelComponent', () => {
      const renderedComponent = setup();
      expect(renderedComponent.find(TestComponent).prop('nodeData')).toBeDefined();
    });
  });

  describe('foreignObject Wrapper', () => {
    it('sets width/height to nodeSize.x/nodeSize.y with a margin by default', () => {
      const renderedComponent = setup();
      expect(renderedComponent.find('foreignObject').prop('width')).toBe(
        mockProps.nodeSize.x - BASE_MARGIN,
      );
      expect(renderedComponent.find('foreignObject').prop('height')).toBe(
        mockProps.nodeSize.y - BASE_MARGIN,
      );
    });

    it('accepts any props defined in `props.foreignObjectWrapper`', () => {
      const foreignObjectWrapper = {
        width: 999,
        height: 111,
        x: 12,
      };
      const renderedComponent = setup({ foreignObjectWrapper });
      expect(renderedComponent.find('foreignObject').prop('width')).toBe(
        foreignObjectWrapper.width,
      );
      expect(renderedComponent.find('foreignObject').prop('height')).toBe(
        foreignObjectWrapper.height,
      );
      expect(renderedComponent.find('foreignObject').prop('x')).toBe(foreignObjectWrapper.x);
    });
  });
});
