import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

const MixedNodeElement = ({ nodeData = {}, triggerNodeToggle, foreignObjectProps = {} }) => {
  return (
    <React.Fragment>
      <circle r={20}></circle>
      <foreignObject {...foreignObjectProps}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
          <input type="number" />
          <TextField select fullWidth>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
          </TextField>
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
