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

  type ReactD3TreeTranslate = {x: number, y: number}

  type ReactD3TreeProps = {
    className?: string,
    data: ReactD3TreeItem[] | ReactD3TreeItem,
    nodeSvgShape?: NodeSvgShape,
    nodeLabelComponent?: object,
    onClick?: (targetNode: ReactD3TreeItem, event: Event) => any,
    onMouseOver?: (targetNode: ReactD3TreeItem, event: Event) => any,
    onMouseOut?: (targetNode: ReactD3TreeItem, event: Event) => any,
    onLinkClick?: (linkSource: ReactD3TreeItem, linkTarget: ReactD3TreeItem, event: Event) => any,
    onLinkMouseOver?: (linkSource: ReactD3TreeItem, linkTarget: ReactD3TreeItem, event: Event) => any,
    onLinkMouseOut?: (linkSource: ReactD3TreeItem, linkTarget: ReactD3TreeItem, event: Event) => any,
    onUpdate?: (updateTarget: { targetNode: ReactD3TreeItem | null, currentTranslate: ReactD3TreeTranslate, currentZoom: number}) => any,
    orientation?: "horizontal" | "vertical",
    translate?: Partial<ReactD3TreeTranslate>,
    pathFunc?: ("diagonal" | "elbow" | "straight" | "step") | ((...args: any[]) => any),
    pathClass?: ((...args: any[]) => any),
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

  export {Tree, ReactD3TreeProps, ReactD3TreeItem, ReactD3TreeTranslate, NodeSvgShape};
  export default Tree;
}
