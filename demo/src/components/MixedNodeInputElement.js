import React from 'react';

const MixedNodeElement = ({ nodeData = {}, triggerNodeToggle, foreignObjectProps = {} }) => {
  return (
    <React.Fragment>
      <circle r={20}></circle>
      <foreignObject {...foreignObjectProps}>
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid black',
            paddingBottom: '1rem',
            backgroundColor: 'rgb(248, 248, 255)', // ghostwhite
          }}
        >
          <h3>{nodeData.name}</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {nodeData.attributes &&
              Object.keys(nodeData.attributes).map((labelKey, i) => (
                <li key={`${labelKey}-${i}`}>
                  {labelKey}: {nodeData.attributes[labelKey]}
                </li>
              ))}
          </ul>
          <select>
            <option value="1">Option: 1</option>
            <option value="2">Option: 2</option>
            <option value="3">Option: 3</option>
          </select>
          {nodeData.children && (
            <button style={{ textAlign: 'center' }} onClick={triggerNodeToggle}>
              {nodeData.__rd3t.collapsed ? '⬅️ ➡️ Expand' : '➡️ ⬅️ Collapse'}
            </button>
          )}
        </div>
      </foreignObject>
    </React.Fragment>
  );
};

export default MixedNodeElement;
