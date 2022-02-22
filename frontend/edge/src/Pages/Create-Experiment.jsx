import React, {useState, useEffect, useContext, useRef} from 'react'
import {useHistory, useParams} from "react-router-dom"
import itemsAPI from '../API/items'
import { OpenItemsContext } from '../Contexts/openItemsContext';
import ModelNode from '../Components/Model-Node';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CreateExperiment = ({currentUser}) => {
    const [stage, setStage] = useState("setup");
    const [title, setTitle] = useState("");
    const [loaded, setLoaded] = useState(false)
    const [noData, setNoData] = useState()
    const [exist, setExist] = useState(false)
    const [visibility, setVisibility] = useState(false);
    const [model, setModel] = useState([])
    const [selectedNode, setSelectedNode] = useState(0)
    const [configuration, setConfiguration] = useState({epochs: "", trainingSplit: "", validationSplit: "", testSplit: "", 
                                                        maxError: "", batch: "", optimiser: "", model: ""})
    const [experiments, setExperiments] = useState([]);
    const [addNode, setAddNode] = useState(false)
    const [disableTrain, setDisabledTrain] = useState(true)
    const [refreshDiagram, setRefreshDiagram] = useState()
    const {addOpenItems} = useContext(OpenItemsContext);
    const modelRef = useRef(null)
    const history = useHistory();
    const workspaceID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const experiments = await itemsAPI.get(`/all-experiments/${workspaceID}`);
                const workspace = await itemsAPI.get(`/${workspaceID}?type=workspace`);

                if (workspace.data.data.creator === currentUser.id) {
                    addOpenItems(workspace.data.data._id, workspace.data.data.title, workspace.data.data.type)
                }

                experiments.data.data.experiments.map((experiment) => {
                    setExperiments(state => [...state, experiment.title]);
                })

                fetch(`http://127.0.0.1:5000/files/${workspace.data.data.dataset.datafile}.csv`)
                    .then(response => response.text())
                    .then(text => {
                        setModel([{type: "Input", value: text.slice(0, text.indexOf('\n')).split(',').length, activation: ""}])
                        setNoData(false)
                        setLoaded(true);
                        setExist(true)
                    }).catch(() => {
                        setNoData(true)
                        setLoaded(true);
                        setExist(true)
                    });
            } catch (err) {
                setExist(false)
                setLoaded(true)
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'end'
            })
        }
    }, [model, addNode])

    const next = () => {
        if (stage === "setup" && title !== "" && !experiments.includes(title)) {
            setStage("modelling")
        }
        if (stage === "modelling" && model.length > 2 && model[model.length-1].type === "Output" && configuration.epochs !== "" && 
            configuration.trainingSplit !== "" && configuration.validationSplit !== "" && configuration.testSplit !== "" && 
            configuration.maxError !== "" && configuration.batch !== "" && configuration.optimiser !== "" && 
            configuration.model !== "") {
            setStage("training")
        }
        if (stage === "training" && !disableTrain) {
            setStage("evaluation")
        }
    }

    const cancel = () => {
        history.replace(`/${workspaceID}`);
    }

    return (
        <>
            {loaded && exist ?
                <>
                    {noData ?
                        <p className="end-items">Cannot find dataset</p>
                    :   
                        <div className="sidebar-body">
                            <div className="create-sidebar">
                                <h1>Create Experiment</h1> 
                                <div className="create-item-header">
                                    <p className="create-item-title">{title}</p> 
                                </div>
                                <button className={`${"create-sidebar-stage"} ${stage === "setup" ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                        disabled={stage === "setup"}
                                        onClick={() => {setStage("setup")}}>Setup</button>
                                <button className={`${"create-sidebar-stage"} ${stage === "modelling" ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                        disabled={stage === "setup" || stage === "modelling"}
                                        onClick={() => {setStage("modelling")}}>Modelling</button>
                                <button className={`${"create-sidebar-stage"} ${stage === "training" ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                        disabled={stage === "setup" || stage === "modelling" || stage === "training"}
                                        onClick={() => {setStage("training")}}>Training</button>
                                <button className={`${"create-sidebar-stage"} ${stage === "evaluation" ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                        disabled>Evaluation</button>
                            </div>
                            <div className="inner-body">
                                <>
                                    {stage === "setup" ?
                                        <div className="create-item-setup-information">
                                            <div className="create-item-nav">   
                                                <p className="create-item-data-information-label">Experiment Information</p>
                                                <button className="white-button create-item-cancel"
                                                        onClick={() => {cancel()}}>Cancel</button>
                                                <button className="blue-button"
                                                        onClick={() => {next()}}>Next</button>
                                            </div>
                                            <input className="create-item-title"
                                                    placeholder="Title"
                                                    onChange={e => {setTitle(e.target.value)}}
                                                    value={title} />
                                            <div className="create-item-setup">
                                                <label className="create-item-setup-label">Public?</label>
                                                <input type="checkbox" 
                                                        onChange={() => {setVisibility(previous => !previous)}}
                                                        checked={visibility} />
                                            </div>
                                        </div>
                                    : (stage === "modelling") ?
                                        <div className="create-experiment-modelling">
                                            <div className="create-experiment-modelling-top">   
                                                <button className="white-button create-item-cancel"
                                                        onClick={() => {cancel()}}>Cancel</button>
                                                <button className="blue-button"
                                                        onClick={() => {next()}}>Train</button>
                                            </div>
                                            <div className="create-experiment-modelling-body">
                                                <div className="create-experiment-model">
                                                    <div className="create-experiment-model-diagram" key={refreshDiagram}>
                                                        {model.map((node, i) => {
                                                            return (
                                                                <div key={i}>
                                                                    <div className={"create-experiment-model-diagram-node"}>
                                                                        <div onClick={() => {setSelectedNode(i)}}>
                                                                            <ModelNode setSelectedNode={setSelectedNode} type={node.type} value={node.value} selected={i === selectedNode} last={i === model.length-1} />
                                                                        </div>
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
                                                                                                setRefreshDiagram(new Date().getTime())}}>
                                                                                <ClearIcon className="create-experiment-model-diagram-remove" />
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    {i === model.length-1 && node.type !== "Output" &&
                                                                        <>
                                                                            {addNode ?
                                                                                <div className="create-experiment-model-diagram-add">
                                                                                    <div onClick={() => {setAddNode(false)}}>
                                                                                        <RemoveIcon className="create-experiment-model-diagram-add-icon" />
                                                                                    </div>
                                                                                    <div className="create-experiment-model-diagram-add-options">
                                                                                        <button onClick={() => {setModel(state => [...state, {
                                                                                            type: "Dense",
                                                                                            value: 0,
                                                                                            activation: ""
                                                                                        }])
                                                                                        setSelectedNode(model.length)
                                                                                        setAddNode(false)
                                                                                        }}>Dense</button>
                                                                                        {model.length > 1 &&
                                                                                            <button onClick={() => {setModel(state => [...state, {
                                                                                                type: "Output",
                                                                                                value: 0,
                                                                                                activation: ""
                                                                                            }])
                                                                                            setSelectedNode(model.length)
                                                                                            setAddNode(false)
                                                                                            }}>Output</button>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            :
                                                                                <div onClick={() => {setAddNode(true)}}>
                                                                                    <AddIcon className="create-experiment-model-diagram-add-icon" />
                                                                                </div>
                                                                            }
                                                                        </>
                                                                    }
                                                                </div>
                                                            )
                                                        })}
                                                        <div ref={modelRef} />
                                                    </div>
                                                    <div className="create-experiment-model-selected">
                                                        <p>{model[selectedNode].type}</p>
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
                                                                                setRefreshDiagram(new Date().getTime())}} />
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
                                                                                        setRefreshDiagram(new Date().getTime())}}>
                                                                        <option disabled defaultValue value=""></option>
                                                                        <option value="Relu">Relu</option>
                                                                        <option value="Sigmoid">Sigmoid</option>
                                                                </select>
                                                            </>
                                                        }  
                                                    </div>
                                                </div>
                                                <div className="create-experiment-model-configuration">
                                                    <div className="create-experiment-model-configuration-option">
                                                        <div>
                                                            <label>Epochs</label>
                                                            <input value={configuration.epochs} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    epochs: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Training Split</label>
                                                            <input value={configuration.trainingSplit} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    trainingSplit: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Validation Split</label>
                                                            <input value={configuration.validationSplit} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    validationSplit: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Test Split</label>
                                                            <input value={configuration.testSplit} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    testSplit: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Maximum Error</label>
                                                            <input value={configuration.maxError} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    maxError: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Batch Size</label>
                                                            <input value={configuration.batch} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    batch: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Optimiser</label>
                                                            <select value={configuration.optimiser} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    optimiser: e.target.value
                                                                                                                }))}}>
                                                                <option disabled defaultValue value=""></option>
                                                                <option value="Sigmoid">Sigmoid</option>
                                                                <option value="Relu">Relu</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label>Model Type</label>
                                                            <select value={configuration.model} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    model: e.target.value
                                                                                                                }))}}>
                                                                <option disabled defaultValue value=""></option>
                                                                <option value="Regression">Regression</option>
                                                                <option value="Classification">Classification</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    : (stage === "training") ?
                                        <>
                                        </>
                                    :
                                        <>
                                        </>
                                    }
                                </>
                            </div>
                        </div>
                    }
                </>
            : loaded && !exist &&
                <div className="width-body">  
                    <p className="item-exist">Cannot find workspace</p>
                </div>
            }    
        </>
    )
}

export default CreateExperiment
