import React from 'react'

const ModelNode = ({type, value, selected, last}) => {
    return (
        <div className="model-node">
            <div className={selected ? "model-node-selected" : "model-node-unselected"}>
                <p>{type}</p>
            </div>
            <p className="model-node-value">{value}</p>
            {!last &&
                <img src="http://localhost:3000/Node-Connector.png" className="model-node-connector" />
            }
        </div>
    )
};

export default ModelNode;
