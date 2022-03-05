import React, {useState, useEffect, useRef} from 'react'
import {useHistory} from "react-router-dom"
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import imageAPI from '../API/images'
import trainAPI from '../API/train'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ModelNode from '../Components/Model-Node';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const Workspace = ({currentUser, type}) => {
    const [stage, setStage] = useState("model");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(20)
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [datasetID, setDatasetID] = useState("")
    const [uploadedDataset, setUploadedDataset] = useState()
    const [workspaces, setWorkspaces] = useState([]);
    const [images, setImages] = useState([])
    const [assignedLabels, setAssignedLabels] = useState([])
    const [viewDataset, setViewDataset] = useState(false)
    const [refreshData, setRefreshData] = useState()
    const [refreshDiagram, setRefreshDiagram] = useState()
    const [model, setModel] = useState([])
    const [selectedNode, setSelectedNode] = useState(0)
    const [configuration, setConfiguration] = useState({epochs: "", training_split: "", validation_split: "", test_split: "", improvement: "",
                                                        patience: "", batch: "", lr_scheduler: false, optimiser: "", loss: ""})
    const [addNode, setAddNode] = useState(false)
    const [results, setResults] = useState()
    const [loaded, setLoaded] = useState(false);
    const [disableCreate, setDisabledCreate] = useState(false)
    const [disableTrain, setDisabledTrain] = useState(true)
    const [displayPublic, setDisplayPublic] = useState(false)
    const [displayExist, setDisplayExist] = useState(false)
    const modelRef = useRef(null)
    const publicInterval = useRef(0)
    const existInterval = useRef(0)
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspaces = await usersAPI.get("/created?type=workspace");

                workspaces.data.data.map((workspace) => {
                    setWorkspaces(previous => [...previous, workspace.title]);
                })
                setLoaded(true);
            } catch (err) {}
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

    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && datasetID !== "") {
            existingDataset()
        }
    }

    const displayPublicInterval = () => {
        clearInterval(publicInterval.current)
        setDisplayPublic(true);
        publicInterval.current = setInterval(() => {
            setDisplayPublic(false);
        }, 1200)
        return ()=> {clearInterval(publicInterval.current)};
    }

    const displayExistInterval = () => {
        clearInterval(existInterval.current)
        setDisplayExist(true);
        existInterval.current = setInterval(() => {
            setDisplayExist(false);
        }, 1200)
        return ()=> {clearInterval(existInterval.current)};
    }

    const previousPage = () => {
        if (page > 1) {
            setStart((page-2)*20)
            setEnd((page-1)*20)
            setPage(state => state-1)
            setRefreshData(new Date().getTime())
        }
    }
    
    const nextPage = () => {
        if (page*20 < images.length && images.length > 20) {
            setPage(state => state+1)
            setStart((page)*20)
            setEnd((page+1)*20)
            setRefreshData(new Date().getTime())
        }
    }

    const existingDataset = async () => {
        try {
            const checkPublic = await itemsAPI.get(`/check-public-dataset?id=${datasetID}`)
    
            if (checkPublic.data.success && checkPublic.data.data.visibility) {
                fetch(`http://127.0.0.1:5000/files/${checkPublic.data.data.imageFile}/labels.json`)
                        .then(response => response.json())
                        .then(images => {
                            images.map(image => {
                                setImages(state => [...state, image.filename])
                                setAssignedLabels(state => [...state, image.label])
                            })
                            setUploadedDataset(checkPublic.data.data)
                            setRefreshData(new Date().getTime())
                            {model.length === 0 &&
                                setModel([{type: "Input", value: 1, activation: ""}])
                            }
                        })
            } else if (checkPublic.data.success && !checkPublic.data.data.visibility) {
                displayPublicInterval()
            } else {
                displayExistInterval()
            }
        } catch (err) {}
    }

    const uploadImage = async () => {
        setDisabledCreate(true)

        if (image) {
            const formImage = new FormData();
            formImage.append('image', image);

            try {
                const imageResponse = await imageAPI.post("/upload", formImage);

                uploadData(imageResponse.data.data)
            } catch (err) {}
        } else {
            uploadData("default.png")
        }
    }

    const uploadData = async (imageName) => {
        try {
            const workspaceResponse = await itemsAPI.post("/", {
                title: title,
                dataset: uploadedDataset._id,
                creator: currentUser.id,
                description: description,
                picture: imageName,
                upvotes: [],
                bookmarks: [],
                updated: new Date().toISOString(),
                visibility: visibility,
                type: "workspace"
            });

            history.push(`/workspace/${workspaceResponse.data.data}`)
        } catch (err) {}
    }

    const train = async () => {
        try {
            // setDisabledTrain(true)
            setStage("train")
    
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
            formData.append('imageFile', uploadedDataset.imageFile)

            uploadedDataset.labels.map(label => {
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
            } else {
                setDisabledTrain(false)
            }
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <div className="main-body">
                    <div className="sidebar">
                        <input className="create-item-title"
                                placeholder="Title"
                                onChange={e => {setTitle(e.target.value)}}
                                value={title} />
                        <textarea className="create-item-description"
                                    placeholder="Description"
                                    onChange={e => {setDescription(e.target.value)}}
                                    value={description} />
                        <div className="create-item-setup">
                            <label className="create-item-setup-label">Picture</label>
                            <input className="create-item-setup-input"
                                    type="file" 
                                    name="image" 
                                    onChange={e => {setImage(e.target.files[0])}} />
                        </div>
                        <div className="create-item-setup">
                            <label className="create-item-setup-label">Public?</label>
                            <input type="checkbox" 
                                    onChange={() => {setVisibility(previous => !previous)}}
                                    checked={visibility} />
                        </div>
                        <div className="sidebar-divided" />
                        <input className="create-workspace-import-existing"
                                placeholder="Dataset ID"
                                onChange={e => {setDatasetID(e.target.value)}}
                                onKeyPress={searchFunctionKey}
                                value={datasetID} />
                        <button className="create-item-view-dataset"
                                onClick={() => {setViewDataset(state => !state)}}>View Dataset</button>
                        {displayPublic && <p className="create-item-data-notification">Dataset not public</p>}
                        {displayExist && <p className="create-item-data-notification">Dataset does not exist</p>}
                    </div>
                    <div className="inner">
                        {type === "create" &&
                            <>
                                <div className="view-items-top">
                                    <h1>Create Workspace</h1>
                                    <span />
                                    <button className="blue-button"
                                            disabled={disableTrain}
                                            onClick={() => {uploadImage()}}>Train</button>
                                </div>
                                {model.length !== 0 ?
                                    <div className="create-modelling-body">
                                        <div className="create-model">
                                            <div className="create-model-diagram" key={refreshDiagram}>
                                                {model.map((node, i) => {
                                                    return (
                                                        <div key={i}>
                                                            <div className={"create-model-diagram-node"}>
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
                                                                        <ClearIcon className="create-model-diagram-remove" />
                                                                    </div>
                                                                }
                                                            </div>
                                                            {i === model.length-1 && node.type !== "Output" &&
                                                                <>
                                                                    {addNode ?
                                                                        <div className="create-model-diagram-add">
                                                                            <div onClick={() => {setAddNode(false)}}>
                                                                                <RemoveIcon className="create-model-diagram-add-icon" />
                                                                            </div>
                                                                            <div className="create-model-diagram-add-options">
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
                                                                                        {uploadedDataset.labels.length === 2 ?
                                                                                            setModel(state => [...state, {
                                                                                                type: "Output",
                                                                                                value: 1,
                                                                                                activation: ""
                                                                                            }])
                                                                                        :
                                                                                            setModel(state => [...state, {
                                                                                                type: "Output",
                                                                                                value: uploadedDataset.labels.length,
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
                                                                            <AddIcon className="create-model-diagram-add-icon" />
                                                                        </div>
                                                                    }
                                                                </>
                                                            }
                                                        </div>
                                                    )
                                                })}
                                                <div ref={modelRef} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="create-model-selected">
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
                                            <div className="create-model-configuration">
                                                <div className="create-model-configuration-option">
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
                                                        <input className="create-model-configuration-option-checkbox"
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
                                                            {uploadedDataset.labels.length === 2 &&
                                                                <>
                                                                    <option value="binary_crossentropy">Binary Crossentropy</option>
                                                                    <option value="hinge">Hinge</option>
                                                                    <option value="squared_hinge">Squared Hinge</option>
                                                                </>
                                                            }
                                                            {uploadedDataset.labels.length > 2 &&
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
                                        {viewDataset && uploadedDataset &&
                                            <div className="create-model-data">
                                                <p className="create-item-data-header-file">Dataset: {uploadedDataset._id}</p>
                                                <div className="create-model-data-images-list" key={refreshData}>
                                                    {images.map((image, i) => {
                                                        if (i >= start && i < end) {
                                                            return (
                                                                <div className="create-model-data-image" key={i}>
                                                                    <div>
                                                                        <img src={`http://127.0.0.1:5000/files/${uploadedDataset.imageFile}/${image}.jpg`} />
                                                                        <p>{assignedLabels[i]}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                                <div className="create-model-data-pagination">
                                                    <ArrowBackIosNewIcon className="create-model-data-pagination-icon" onClick={() => {previousPage()}} />
                                                    <p>Page {page} / {Math.ceil(images.length/20)}</p>
                                                    <ArrowForwardIosIcon className="create-model-data-pagination-icon" onClick={() => {nextPage()}} />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                :
                                    <p className="end-items">Upload a dataset...</p>
                                }
                            </>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default Workspace