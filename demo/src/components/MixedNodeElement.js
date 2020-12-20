import React from 'react';

const MixedNodeElement = ({ nodeData = {}, triggerNodeToggle, foreignObjectProps = {} }) => {
  return (
    <React.Fragment>
      <circle r={20}></circle>
      <foreignObject {...foreignObjectProps}>
        <div style={{ border: '1px solid black' }}>
          <h3>{nodeData.name}</h3>
          <ul>
            {nodeData.attributes &&
              Object.keys(nodeData.attributes).map((labelKey, i) => (
                <li key={`${labelKey}-${i}`}>
                  {labelKey}: {nodeData.attributes[labelKey]}
                </li>
              ))}
          </ul>
          {nodeData.children && (
            <button onClick={triggerNodeToggle}>
              {nodeData.__rd3t.collapsed ? 'Expand' : 'Collapse'}
            </button>
          )}
        </div>
      </foreignObject>
    </React.Fragment>
  );
};

export default MixedNodeElement;
