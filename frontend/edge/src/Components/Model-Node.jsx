import React from 'react'

const ModelNode = ({type, selected, last}) => {
    return (
        <div className={`model-node ${type === "Input" && "model-node-input"}`}>
            <div className={selected ? "model-node-selected" : "model-node-unselected"}>
                <p>{type}</p>
            </div>
            {!last &&
                <img src="http://localhost:3000/Node-Connector.png" className="model-node-connector" />
            }
        </div>
    )
};

export default ModelNode;
