import React from 'react';

class NodeLabelComponent extends React.PureComponent {
  static defaultProps = {
    nodeData: {}
  }
  render() {
    const {nodeData} = this.props
    return (
      <div style={{border: '1px solid black'}}>
        <h2>{nodeData.name}</h2>
        <ul>
          {nodeData.attributes && Object.keys(nodeData.attributes).map((labelKey, i) => (
            <li key={`${labelKey}-${i}`}>
              {labelKey}: {nodeData.attributes[labelKey]}
            </li>
          ))}
        </ul>
        {nodeData._children && 
          <button>{nodeData._collapsed ? 'Expand' : 'Collapse'}</button>
        }
      </div>
    )
  }
}

export default NodeLabelComponent