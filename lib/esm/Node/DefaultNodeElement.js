import React from 'react';
const DEFAULT_NODE_CIRCLE_RADIUS = 15;
const textLayout = {
    title: {
        textAnchor: 'start',
        x: 40,
    },
    attribute: {
        x: 40,
        dy: '1.2em',
    },
};
const DefaultNodeElement = ({ nodeDatum, toggleNode, onNodeClick, onNodeMouseOver, onNodeMouseOut, }) => (React.createElement(React.Fragment, null,
    React.createElement("circle", { r: DEFAULT_NODE_CIRCLE_RADIUS, onClick: evt => {
            toggleNode();
            onNodeClick(evt);
        }, onMouseOver: onNodeMouseOver, onMouseOut: onNodeMouseOut }),
    React.createElement("g", { className: "rd3t-label" },
        React.createElement("text", Object.assign({ className: "rd3t-label__title" }, textLayout.title), nodeDatum.name),
        React.createElement("text", { className: "rd3t-label__attributes" }, nodeDatum.attributes &&
            Object.entries(nodeDatum.attributes).map(([labelKey, labelValue], i) => (React.createElement("tspan", Object.assign({ key: `${labelKey}-${i}` }, textLayout.attribute),
                labelKey,
                ": ",
                typeof labelValue === 'boolean' ? labelValue.toString() : labelValue)))))));
export default DefaultNodeElement;
