import React, { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { Orientation, TreeLinkDatum, PathFunctionOption, PathFunction, TreeNodeDatum, PathClassFunction } from '../types/common.js';
type LinkEventHandler = (source: HierarchyPointNode<TreeNodeDatum>, target: HierarchyPointNode<TreeNodeDatum>, evt: SyntheticEvent) => void;
interface LinkProps {
    linkData: TreeLinkDatum;
    orientation: Orientation;
    pathFunc: PathFunctionOption | PathFunction;
    pathClassFunc?: PathClassFunction;
    enableLegacyTransitions: boolean;
    transitionDuration: number;
    onClick: LinkEventHandler;
    onMouseOver: LinkEventHandler;
    onMouseOut: LinkEventHandler;
}
type LinkState = {
    initialStyle: {
        opacity: number;
    };
};
export default class Link extends React.PureComponent<LinkProps, LinkState> {
    private linkRef;
    state: {
        initialStyle: {
            opacity: number;
        };
    };
    componentDidMount(): void;
    componentWillLeave(done: any): void;
    applyOpacity(opacity: number, transitionDuration: LinkProps['transitionDuration'], done?: () => void): void;
    drawStepPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']): string;
    drawDiagonalPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']): string;
    drawStraightPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']): string;
    drawElbowPath(linkData: LinkProps['linkData'], orientation: LinkProps['orientation']): string;
    drawPath(): string;
    getClassNames(): string;
    handleOnClick: (evt: any) => void;
    handleOnMouseOver: (evt: any) => void;
    handleOnMouseOut: (evt: any) => void;
    render(): JSX.Element;
}
export {};
