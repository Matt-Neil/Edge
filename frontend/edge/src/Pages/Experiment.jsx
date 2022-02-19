import React, {useState, useEffect, useRef} from 'react'
import {useParams, useHistory} from "react-router-dom"
import itemsAPI from '../API/items'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ModelNode from '../Components/Model-Node';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Experiment = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false)
    const [exist, setExist] = useState()
    const [model, setModel] = useState()
    const [configuration, setConfiguration] = useState()
    const [updated, setUpdated] = useState()
    const [changedSettings, setChangedSettings] = useState(false)
    const [changedModel, setChangedModel] = useState(false)
    const [disabledTrain, setDisableTrain] = useState(true)
    const [date, setDate] = useState()
    const [visibility, setVisibility] = useState()
    const [section, setSection] = useState("model")
    const [experiment, setExperiment] = useState()
    const [selectedNode, setSelectedNode] = useState(0)
    const [addNode, setAddNode] = useState(false)
    const [refreshDiagram, setRefreshDiagram] = useState()
    const [title, setTitle] = useState("")
    const modelRef = useRef(null)
    const workspaceID = useParams().workspace;
    const experimentID = useParams().experiment;
    const history = useHistory()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const experiment = await itemsAPI.get(`/experiment/${experimentID}?workspace=${workspaceID}`);

                setExperiment(experiment.data.data);
                setUpdated(experiment.data.data.experiments.updated);
                setTitle(experiment.data.data.experiments.title)
                setModel(experiment.data.data.experiments.model)
                setVisibility(experiment.data.data.experiments.visibility)
                setConfiguration(experiment.data.data.experiments.configuration)

                setExist(true)
                setLoaded(true)
            } catch (err) {
                setExist(false)
                setLoaded(true)
            }
        }
        fetchData();
    }, [])    

    useEffect(() => {
        if (loaded && exist) {
            const updatedDate = new Date(updated);
            const currentDate = new Date();
    
            if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 365) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 365)).toString()} years ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 30) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 30).toString())} months ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 1) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24))).toString()} days ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600) >= 1) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600))).toString()} hours ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60) >= 1) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60))).toString()} minutes ago`)
            } else {
                setDate("Updated just now")
            }
        }
    }, [loaded, updated])

    const updateVisibility = async () => {
        try {
            await itemsAPI.put(`/experiment-visibility/${experimentID}?workspace=${workspaceID}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    const updateExperiment = async () => {
        try {
            await itemsAPI.put(`/experiment/${experimentID}?workspace=${workspaceID}`, {
                title: title,
                model: model,
                configuration: configuration,
                updated: new Date().toISOString()
            })

            if (changedModel) {
                setDisableTrain(false)
            }
            setUpdated(new Date().toISOString())
            setChangedSettings(false)
            setChangedModel(false)
        } catch (err) {}
    }

    const deleteExperiment = async () => {
        try {
            await itemsAPI.delete(`/experiment/${experimentID}?workspace=${workspaceID}`)

            history.replace(`/workspace/${workspaceID}`)
        } catch (err) {}
    }

    return (
        <>
            {loaded && exist ?
                <div className="width-body">  
                    <div className="item-body">
                        <div className="item-top">
                            <div className="item-heading">
                                <ArrowBackIcon className="experiment-back-icon" onClick={() => {history.push(`/workspace/${workspaceID}`)}} />
                                {experiment.self ? 
                                    <input className="item-title-input"
                                            placeholder="Title" 
                                            value={title}
                                            onChange={e => {
                                                setTitle(e.target.value)
                                                {!changedSettings && setChangedSettings(true)}
                                            }} /> 
                                : 
                                    <h1>{experiment.experiments.title}</h1>
                                }
                            </div>
                            <div>
                                <p className="item-meta">{date}</p>
                                <span />
                                {experiment.self && 
                                    <>
                                        {visibility ? 
                                            <VisibilityIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                        :
                                            <VisibilityOffIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                        }
                                    </>
                                }
                            </div>
                            {experiment.self &&
                                <div className="item-middle">
                                    <button className="dark-grey-button item-delete"
                                            onClick={() => {deleteExperiment()}}>Delete</button>
                                    <button className={`item-save ${!changedSettings && !changedModel ? "grey-button" : "blue-button"}`}
                                            disabled={!changedSettings && !changedModel}
                                            onClick={() => {updateExperiment()}}>Save Changes</button>
                                </div>
                            }
                            <select className="item-select" onChange={e => {setSection(e.target.value)}}>
                                <option value="model">Model</option>
                                <option value="results">Results</option>
                            </select>
                        </div>
                        <div className="item-bottom">
                            {section === "model" ? 
                                <div className="experiment-modelling-body">
                                    <div className="experiment-model">
                                        <div className="model-diagram" key={refreshDiagram}>
                                            {model.map((node, i) => {
                                                return (
                                                    <div key={i}>
                                                        <div className={"model-diagram-node"}>
                                                            <div disabled={!experiment.self} onClick={() => {setSelectedNode(i)}}>
                                                                <ModelNode setSelectedNode={setSelectedNode} type={node.type} value={node.value} selected={i === selectedNode} last={i === model.length-1} />
                                                            </div>
                                                            {experiment.self &&
                                                                <>
                                                                    {node.type !== "Input" &&
                                                                        <div onClick={() => {{selectedNode === i ?
                                                                                                setSelectedNode(state => state-1)
                                                                                            : selectedNode < i ?
                                                                                                setSelectedNode(state => state)
                                                                                            : selectedNode > i &&
                                                                                                <>
                                                                                                    {selectedNode-i === 1 ?
                                                                                                        setSelectedNode(state => state-1)
                                                                                                    :
                                                                                                        setSelectedNode(i)
                                                                                                    } 
                                                                                                </>  
                                                                                            }
                                                                                            model.splice(i, 1)
                                                                                            {!changedModel && setChangedModel(true)}
                                                                                            setRefreshDiagram(new Date().getTime())}}>
                                                                            <ClearIcon className="model-diagram-remove" />
                                                                        </div>
                                                                    }
                                                                </>
                                                            }
                                                        </div>
                                                        {i === model.length-1 && node.type !== "Output" &&
                                                            <>
                                                                {addNode ?
                                                                    <div className="model-diagram-add">
                                                                        <div onClick={() => {setAddNode(false)}}>
                                                                            <RemoveIcon className="model-diagram-add-icon" />
                                                                        </div>
                                                                        <div className="model-diagram-add-options">
                                                                            <button onClick={() => {setModel(state => [...state, {
                                                                                type: "Dense",
                                                                                value: 0,
                                                                                activation: ""
                                                                            }])
                                                                            setAddNode(false)
                                                                            setSelectedNode(state => state + 1)
                                                                            {!changedModel && setChangedModel(true)}
                                                                            }}>Dense</button>
                                                                            {model.length > 1 &&
                                                                                <button onClick={() => {setModel(state => [...state, {
                                                                                    type: "Output",
                                                                                    value: 0,
                                                                                    activation: ""
                                                                                }])
                                                                                setSelectedNode(state => state + 1)
                                                                                setAddNode(false)
                                                                                }}>Output</button>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                :
                                                                    <>
                                                                        {experiment.self &&
                                                                            <div onClick={() => {setAddNode(true)}}>
                                                                                <AddIcon className="model-diagram-add-icon" />
                                                                            </div>
                                                                        }
                                                                    </>
                                                                }
                                                            </>
                                                        }
                                                    </div>
                                                )
                                            })}
                                            <div ref={modelRef} />
                                        </div>
                                    </div>
                                    <div className="model-configuration">
                                        {experiment.self &&
                                            <button className={disabledTrain ? "grey-button" : "blue-button"}
                                                    disabled={disabledTrain}
                                                    onClick={() => {}}>Train</button>
                                        }
                                        <div className="model-configuration-option">
                                            <div>
                                                <label>Epochs</label>
                                                <input value={configuration.epochs} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            epochs: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}} />
                                            </div>
                                            <div>
                                                <label>Training Split</label>
                                                <input value={configuration.trainingSplit} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            trainingSplit: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}} />
                                            </div>
                                            <div>
                                                <label>Validation Split</label>
                                                <input value={configuration.validationSplit} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            validationSplit: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}} />
                                            </div>
                                            <div>
                                                <label>Test Split</label>
                                                <input value={configuration.testSplit} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            testSplit: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}} />
                                            </div>
                                            <div>
                                                <label>Maximum Error</label>
                                                <input value={configuration.maxError} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            maxError: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}} />
                                            </div>
                                            <div>
                                                <label>Batch Size</label>
                                                <input value={configuration.batch} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            batch: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}} />
                                            </div>
                                            <div>
                                                <label>Optimiser</label>
                                                <select value={configuration.optimiser} 
                                                        disabled={!experiment.self}
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            optimiser: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}}>
                                                    <option disabled selected value=""></option>
                                                    <option value="Sigmoid">Sigmoid</option>
                                                    <option value="Relu">Relu</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label>Model Type</label>
                                                <select value={configuration.model}
                                                        disabled={!experiment.self} 
                                                        onChange={e => {setConfiguration(state => ({
                                                            ...state,
                                                            model: e.target.value
                                                        }))
                                                        {!changedModel && setChangedModel(true)}}}>
                                                    <option disabled selected value=""></option>
                                                    <option value="Regression">Regression</option>
                                                    <option value="Classification">Classification</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="model-selected">
                                            <p>{model[selectedNode].type}</p>
                                            <div>
                                                <label>Units</label>
                                                <input value={model[selectedNode].value} 
                                                        disabled={model[selectedNode].type === "Input"}
                                                        onChange={e => {setModel(state => {
                                                                            const stateCopy = [...state]
                                                                        
                                                                            stateCopy[selectedNode] = {
                                                                                ...stateCopy[selectedNode],
                                                                                value: Number(e.target.value)
                                                                            }
                                                                        
                                                                            return stateCopy
                                                                        })
                                                                        setRefreshDiagram(new Date().getTime())
                                                                        {!changedModel && setChangedModel(true)}}} />
                                                {model[selectedNode].type !== "Output" && model[selectedNode].type !== "Input" &&
                                                    <>
                                                        <label>Activation</label>
                                                        <select value={model[selectedNode].activation} 
                                                                onChange={e => {setModel(state => {
                                                                                    const stateCopy = [...state]
                                                                                
                                                                                    stateCopy[selectedNode] = {
                                                                                        ...stateCopy[selectedNode],
                                                                                        activation: e.target.value
                                                                                    }
                                                                                
                                                                                    return stateCopy
                                                                                })
                                                                                setRefreshDiagram(new Date().getTime())
                                                                                {!changedModel && setChangedModel(true)}}}>
                                                                <option disabled selected value=""></option>
                                                                <option value="Relu">Relu</option>
                                                                <option value="Sigmoid">Sigmoid</option>
                                                        </select>
                                                    </>
                                                }  
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            :
                                <div></div>
                            }
                        </div>
                    </div>
                </div>
            : loaded && !exist &&
                <div className="width-body">  
                    <p className="item-exist">Cannot find experiment</p>
                </div>
            }   
        </>
    )
}

export default Experiment