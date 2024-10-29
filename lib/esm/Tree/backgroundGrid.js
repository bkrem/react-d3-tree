import React from "react";
export const getDefaultBackgroundGridParam = (param) => {
    if (param === undefined)
        return undefined;
    const { thickness = 2, color = "#bbb", gridCellSize = { width: 24, height: 24 }, } = param;
    return Object.assign({ thickness,
        color,
        gridCellSize }, param);
};
const BackgroundGrid = (props) => {
    const { type, thickness, color, gridCellSize, gridCellFunc } = getDefaultBackgroundGridParam(props);
    return React.createElement(React.Fragment, null,
        React.createElement("pattern", { id: "bgPattern", className: `rd3t-pattern ${props.patternInstanceRef}`, patternUnits: "userSpaceOnUse", width: gridCellSize.width, height: gridCellSize.height },
            type === "dot"
                ? React.createElement("rect", { width: thickness, height: thickness, rx: thickness, fill: color })
                : null,
            type === "line"
                ? React.createElement(React.Fragment, null,
                    React.createElement("line", { strokeWidth: thickness, stroke: color, x1: "0", y1: "0", x2: gridCellSize.width, y2: "0", opacity: "1" }),
                    React.createElement("line", { strokeWidth: thickness, stroke: color, x1: "0", y1: "0", x2: "0", y2: gridCellSize.height, opacity: "1" }))
                : null,
            type === "custom"
                ? gridCellFunc === null || gridCellFunc === void 0 ? void 0 : gridCellFunc()
                : null),
        React.createElement("rect", { fill: "url(#bgPattern)", width: "100%", height: "100%", id: 'bgPatternContainer' }));
};
export default BackgroundGrid;
