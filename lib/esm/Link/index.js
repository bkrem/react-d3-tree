import React from 'react';
import { linkHorizontal, linkVertical } from 'd3-shape';
import { select } from 'd3-selection';
export default class Link extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.linkRef = null;
        this.state = {
            initialStyle: {
                opacity: 0,
            },
        };
        this.handleOnClick = evt => {
            this.props.onClick(this.props.linkData.source, this.props.linkData.target, evt);
        };
        this.handleOnMouseOver = evt => {
            this.props.onMouseOver(this.props.linkData.source, this.props.linkData.target, evt);
        };
        this.handleOnMouseOut = evt => {
            this.props.onMouseOut(this.props.linkData.source, this.props.linkData.target, evt);
        };
    }
    componentDidMount() {
        this.applyOpacity(1, this.props.transitionDuration);
    }
    componentWillLeave(done) {
        this.applyOpacity(0, this.props.transitionDuration, done);
    }
    applyOpacity(opacity, transitionDuration, done = () => { }) {
        if (this.props.enableLegacyTransitions) {
            select(this.linkRef)
                // @ts-ignore
                .transition()
                .duration(transitionDuration)
                .style('opacity', opacity)
                .on('end', done);
        }
        else {
            select(this.linkRef).style('opacity', opacity);
            done();
        }
    }
    drawStepPath(linkData, orientation) {
        const { source, target } = linkData;
        const deltaY = target.y - source.y;
        return orientation === 'horizontal'
            ? `M${source.y},${source.x} H${source.y + deltaY / 2} V${target.x} H${target.y}`
            : `M${source.x},${source.y} V${source.y + deltaY / 2} H${target.x} V${target.y}`;
    }
    drawDiagonalPath(linkData, orientation) {
        const { source, target } = linkData;
        return orientation === 'horizontal'
            ? linkHorizontal()({
                source: [source.y, source.x],
                target: [target.y, target.x],
            })
            : linkVertical()({
                source: [source.x, source.y],
                target: [target.x, target.y],
            });
    }
    drawStraightPath(linkData, orientation) {
        const { source, target } = linkData;
        return orientation === 'horizontal'
            ? `M${source.y},${source.x}L${target.y},${target.x}`
            : `M${source.x},${source.y}L${target.x},${target.y}`;
    }
    drawElbowPath(linkData, orientation) {
        return orientation === 'horizontal'
            ? `M${linkData.source.y},${linkData.source.x}V${linkData.target.x}H${linkData.target.y}`
            : `M${linkData.source.x},${linkData.source.y}V${linkData.target.y}H${linkData.target.x}`;
    }
    drawPath() {
        const { linkData, orientation, pathFunc } = this.props;
        if (typeof pathFunc === 'function') {
            return pathFunc(linkData, orientation);
        }
        if (pathFunc === 'elbow') {
            return this.drawElbowPath(linkData, orientation);
        }
        if (pathFunc === 'straight') {
            return this.drawStraightPath(linkData, orientation);
        }
        if (pathFunc === 'step') {
            return this.drawStepPath(linkData, orientation);
        }
        return this.drawDiagonalPath(linkData, orientation);
    }
    getClassNames() {
        const { linkData, orientation, pathClassFunc } = this.props;
        const classNames = ['rd3t-link'];
        if (typeof pathClassFunc === 'function') {
            classNames.push(pathClassFunc(linkData, orientation));
        }
        return classNames.join(' ').trim();
    }
    render() {
        const { linkData } = this.props;
        return (React.createElement("path", { ref: l => {
                this.linkRef = l;
            }, style: Object.assign({}, this.state.initialStyle), className: this.getClassNames(), d: this.drawPath(), onClick: this.handleOnClick, onMouseOver: this.handleOnMouseOver, onMouseOut: this.handleOnMouseOut, "data-source-id": linkData.source.id, "data-target-id": linkData.target.id }));
    }
}
