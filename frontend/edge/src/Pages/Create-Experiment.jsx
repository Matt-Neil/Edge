import React, {useState, useEffect, useContext, useRef} from 'react'
import {useHistory, useParams} from "react-router-dom"
import itemsAPI from '../API/items'
import trainAPI from '../API/train'
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
    const [dataset, setDataset] = useState()
    const [selectedNode, setSelectedNode] = useState(0)
    const [configuration, setConfiguration] = useState({epochs: "", training_split: "", validation_split: "", test_split: "", improvement: "",
                                                        patience: "", batch: "", lr_scheduler: false, optimiser: "", loss: ""})
    const [experiments, setExperiments] = useState([]);
    const [addNode, setAddNode] = useState(false)
    const [disableTrain, setDisabledTrain] = useState(true)
    const [results, setResults] = useState()
    const [experimentID, setExperimentID] = useState()
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
                
                if (workspace.data.data.dataset.dataType === "image") {
                    setModel([{type: "Input", value: 1, activation: ""}])
                    setDataset(workspace.data.data.dataset)
                } else {
                    fetch(`http://127.0.0.1:5000/files/${workspace.data.data.dataset.datafile}.csv`)
                        .then(response => response.text())
                        .then(text => {
                            setModel([{type: "Input", value: text.slice(0, text.indexOf('\n')).split(',').length, activation: ""}])
                            setDataset(workspace.data.data.dataset)
                            setNoData(false)
                            setLoaded(true);
                            setExist(true)
                        }).catch(() => {
                            setNoData(true)
                            setLoaded(true);
                            setExist(true)
                        });
                }
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
            configuration.training_split !== "" && configuration.validation_split !== "" && configuration.test_split !== "" && 
            configuration.patience !== "" && configuration.batch !== "" && configuration.optimiser !== "" && 
            configuration.model !== "") {
            setStage("training")
        }
    }

    const train = async () => {
        try {
            // setDisabledTrain(true)
            setStage("training")
            setExperimentID(new Date().toISOString())
    
            const formData = new FormData();
        
            formData.append('epochs', configuration.epochs)
            formData.append('training_split', configuration.training_split)
            formData.append('validation_split', configuration.validation_split)
            formData.append('test_split', configuration.test_split)
            formData.append('improvement', configuration.improvement)
            formData.append('patience', configuration.patience)
            formData.append('batch', configuration.batch)
            formData.append('lr_scheduler', configuration.lr_scheduler)
            formData.append('optimiser', configuration.optimiser)
            formData.append('loss', configuration.loss)
            formData.append('datafile', dataset.datafile)
            formData.append('dataType', dataset.dataType)
            formData.append('id', experimentID)

            if (dataset.dataType === "value") {
                formData.append('target', dataset.target)
            }

            dataset.labels.map(label => {
                formData.append('labels[]', label)
            })
            model.map(node => {
                formData.append('activations[]', node.activation)
                formData.append('units[]', node.value)
            })

            const response = await trainAPI.post("", formData);

            if (response) {
                setResults(response)
                setStage("evaluation")
                console.log(results)
            } else {
                setDisabledTrain(false)
                setStage("modelling")
            }
        } catch (err) {}
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
                                        disabled={stage === "setup" || disableTrain}
                                        onClick={() => {setStage("setup")}}>Setup</button>
                                <button className={`${"create-sidebar-stage"} ${stage === "modelling" ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                        // disabled={stage === "setup" || stage === "modelling" || disableTrain}
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
                                                        onClick={() => {train()}}>Train</button>
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
                                                                                            <button onClick={() => {
                                                                                                {dataset.labels.length == 2 ?
                                                                                                    setModel(state => [...state, {
                                                                                                        type: "Output",
                                                                                                        value: 1,
                                                                                                        activation: ""
                                                                                                    }])
                                                                                                :
                                                                                                    setModel(state => [...state, {
                                                                                                        type: "Output",
                                                                                                        value: dataset.labels.length,
                                                                                                        activation: ""
                                                                                                    }])
                                                                                                }
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
                                                                disabled={model[selectedNode].type === "Input" || model[selectedNode].type === "Output"}
                                                                onChange={e => {setModel(state => {
                                                                                    const stateCopy = [...state]
                                                                                
                                                                                    stateCopy[selectedNode] = {
                                                                                        ...stateCopy[selectedNode],
                                                                                        value: Number(e.target.value)
                                                                                    }
                                                                                
                                                                                    return stateCopy
                                                                                })
                                                                                setRefreshDiagram(new Date().getTime())}} />
                                                        {model[selectedNode].type !== "Input" &&
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
                                                                        <option value="sigmoid">Sigmoid</option>
                                                                        <option value="softmax">Softmax</option>
                                                                        <option value="softplus">Softplus</option>
                                                                        <option value="softsign">Softsign</option>
                                                                        <option value="swish">Swish</option>
                                                                        <option value="selu">Selu</option>
                                                                        <option value="tanh">Tanh</option>
                                                                        <option value="elu">Elu</option>
                                                                        <option value="exponential">Exponential</option>
                                                                        <option value="gelu">Gelu</option>
                                                                        <option value="hard_sigmoid">Hard Sigmoid</option>
                                                                        <option value="linear">Linear</option>
                                                                        <option value="relu">Relu</option>
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
                                                            <input value={configuration.training_split} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    training_split: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Validation Split</label>
                                                            <input value={configuration.validation_split} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    validation_split: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Test Split</label>
                                                            <input value={configuration.test_split} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    test_split: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Minimum Improvement</label>
                                                            <input value={configuration.improvement} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    improvement: e.target.value
                                                                                                                }))}} />
                                                        </div>
                                                        <div>
                                                            <label>Patience</label>
                                                            <input value={configuration.patience} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    patience: e.target.value
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
                                                            <label>Learning Rate Scheduler</label>
                                                            <input className="create-experiment-model-configuration-option-checkbox"
                                                                    type="checkbox" 
                                                                    onChange={e => {setConfiguration(state => ({
                                                                        ...state,
                                                                        lr_scheduler: !configuration.lr_scheduler
                                                                    }))}}
                                                                    checked={configuration.lr_scheduler} />
                                                        </div>
                                                        <div>
                                                            <label>Optimiser</label>
                                                            <select value={configuration.optimiser} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    optimiser: e.target.value
                                                                                                                }))}}>
                                                                <option disabled defaultValue value=""></option>
                                                                <option value="Adadelta">Adadelta</option>
                                                                <option value="Adagrad">Adagrad</option>
                                                                <option value="Adam">Adam</option>
                                                                <option value="Adamax">Adamax</option>
                                                                <option value="Ftrl">Ftrl</option>
                                                                <option value="Nadam">Nadam</option>
                                                                <option value="RMSprop">RMSprop</option>
                                                                <option value="SGD">SGD</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label>Loss</label>
                                                            <select value={configuration.loss} onChange={e => {setConfiguration(state => ({
                                                                                                                    ...state,
                                                                                                                    loss: e.target.value
                                                                                                                }))}}>
                                                                <option disabled defaultValue value=""></option>
                                                                {dataset.labels.length === 2 &&
                                                                    <>
                                                                        <option value="binary_crossentropy">Binary Crossentropy</option>
                                                                        <option value="hinge">Hinge</option>
                                                                        <option value="squared_hinge">Squared Hinge</option>
                                                                    </>
                                                                }
                                                                {dataset.labels.length > 2 &&
                                                                    <>
                                                                        <option value="categorical_crossentropy">Categorical Crossentropy</option>
                                                                        <option value="sparse_categorical_crossentropy">Sparse Categorical Crossentropy</option>
                                                                        <option value="kl_divergence">Kullback Leibler Divergence</option>
                                                                    </>
                                                                }
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
