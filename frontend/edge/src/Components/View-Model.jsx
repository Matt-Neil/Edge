import React from 'react'

const Model = () => {
    return (
        <div className="model">
            <div>
                <p className="model-configuration">Number of Hidden Layers</p>
                <p className="model-value"></p>
            </div>
            <div>
                <p className="model-configuration">Initial Learning Rate</p>
                <p className="model-value"></p>
            </div>
            <div>
                <p className="model-configuration">Learning Rate Decay</p>
                <p className="model-value"></p>
            </div>
            <div>
                <p className="model-configuration">Momentum Value</p>
                <p className="model-value"></p>
            </div>
            <div>
                <p className="model-configuration">Maximum Error</p>
                <p className="model-value"></p>
            </div>
            <div>
                <p className="model-configuration">Batch Training</p>
                <p className="model-value"></p>
            </div>
            <div>
                <p className="model-configuration">Categorical Output</p>
                <p className="model-value"></p>
            </div>
        </div>
    )
}

export default Model
