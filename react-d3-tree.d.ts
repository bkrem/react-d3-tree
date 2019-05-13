declare module "react-d3-tree" {
  type NodeSvgShape = {
    shape?: string,
    shapeProps?: object
  }

  type ReactD3TreeItem = {
    name?: string,
    attributes?: {
      [key: string]: string,
    };
    children?: ReactD3TreeItem[],
    _collapsed?: boolean,
    nodeSvgShape?: NodeSvgShape
  };

  type ReactD3TreeProps = {
    data: ReactD3TreeItem[] | ReactD3TreeItem,
    nodeSvgShape?: NodeSvgShape,
    nodeLabelComponent?: object,
    onClick?: (targetNode: ReactD3TreeItem, event: Event) => any,
    onMouseOver?: (targetNode: ReactD3TreeItem, event: Event) => any,
    onMouseOut?: (targetNode: ReactD3TreeItem, event: Event) => any,
    onUpdate?: (targetNode: ReactD3TreeItem, event: Event) => any,
    orientation?: "horizontal" | "vertical",
    translate?: {
      x?: number,
      y?: number
    },
    pathFunc?: ("diagonal" | "elbow" | "straight") | ((...args: any[]) => any),
    transitionDuration?: number,
    depthFactor?: number,
    collapsible?: boolean,
    useCollapseData?: boolean,
    initialDepth?: number,
    zoomable?: boolean,
    zoom?: number,
    scaleExtent?: {
      min?: number,
      max?: number
    },
    nodeSize?: {
      x?: number,
      y?: number
    },
    separation?: {
      siblings?: number,
      nonSiblings?: number
    },
    textLayout?: object,
    allowForeignObjects?: boolean,
    shouldCollapseNeighborNodes?: boolean,
    circleRadius?: number,
    styles?: {
      nodes?: object,
      links?: object
    }
  };

  var Tree: React.ComponentClass<ReactD3TreeProps>;
  
  export {Tree};
  export default Tree;
}