import React, {useState, useEffect, useRef, useContext} from 'react'
import {useHistory, useParams, Link} from "react-router-dom"
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import globalAPI from '../API/global'
import imageAPI from '../API/images'
import trainAPI from '../API/train'
import ModelNode from '../Components/Model-Node';
import { OpenItemsContext } from '../Contexts/openItemsContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Workspace = ({currentUser, type}) => {
    const [stage, setStage] = useState("model");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [bookmarked, setBookmarked] = useState()
    const [upvoted, setUpvoted] = useState()
    const [upvotes, setUpvotes] = useState()
    const [updated, setUpdated] = useState()
    const [picture, setPicture] = useState()
    const [date, setDate] = useState("")
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(20)
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [datasetID, setDatasetID] = useState("")
    const [uploadedDataset, setUploadedDataset] = useState()
    const [workspace, setWorkspace] = useState([]);
    const [images, setImages] = useState([])
    const [assignedLabels, setAssignedLabels] = useState([])
    const [viewDataset, setViewDataset] = useState(false)
    const [refreshData, setRefreshData] = useState()
    const [refreshDiagram, setRefreshDiagram] = useState()
    const [changedSettings, setChangedSettings] = useState(false)
    const [model, setModel] = useState([])
    const [selectedNode, setSelectedNode] = useState(0)
    const [configuration, setConfiguration] = useState({epochs: "", training_split: "", validation_split: "", test_split: "", improvement: "",
                                                        patience: "", batch: "", lr_scheduler: false, optimiser: "", loss: ""})
    const [addNode, setAddNode] = useState(false)
    const [results, setResults] = useState()
    const [loaded, setLoaded] = useState(false);
    const [exist, setExist] = useState()
    const [noData, setNoData] = useState()
    const [disableCreate, setDisabledCreate] = useState(false)
    const [disableTrain, setDisabledTrain] = useState(true)
    const [displayPublic, setDisplayPublic] = useState(false)
    const [displayExist, setDisplayExist] = useState(false)
    const {addOpenItems, removeOpenItems} = useContext(OpenItemsContext);
    const modelRef = useRef(null)
    const workspaceID = useParams().id;
    const publicInterval = useRef(0)
    const existInterval = useRef(0)
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (type === "create") {
                    const workspace = await usersAPI.get("/created?type=workspace");
    
                    workspace.data.data.map((workspace) => {
                        setWorkspace(previous => [...previous, workspace.title]);
                    })

                    setExist(true)
                    setLoaded(true)
                } else {
                    const workspace = await itemsAPI.get(`/${workspaceID}?type=workspace`);

                    if (workspace.data.data.self) {
                        addOpenItems(workspace.data.data._id, workspace.data.data.title, workspace.data.data.type)
                    }

                    setWorkspace(workspace.data.data);
                    setUpdated(workspace.data.data.updated);
                    setBookmarked(workspace.data.data.bookmarked)
                    setUpvoted(workspace.data.data.upvoted)
                    setPicture(workspace.data.data.picture)
                    setUpvotes(workspace.data.data.upvotes)
                    setDatasetID(workspace.data.data.dataset._id)
                    setVisibility(workspace.data.data.visibility)
                    setTitle(workspace.data.data.title)
                    setDescription(workspace.data.data.description)
                    setModel(workspace.data.data.model)
                    setConfiguration(workspace.data.data.configuration)
                    setUploadedDataset(workspace.data.data.dataset)

                    fetch(`http://127.0.0.1:5000/files/${workspace.data.data.dataset.imageFile}/labels.json`)
                        .then(response => response.json())
                        .then(images => {
                            images.map(image => {
                                setImages(state => [...state, image.filename])
                                setAssignedLabels(state => [...state, image.label])
                            })
                            setExist(true)
                            setNoData(false)
                            setLoaded(true)
                        }).catch(() => {
                            setExist(true)
                            setNoData(true)
                            setLoaded(true)
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

    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && datasetID !== "") {
            existingDataset()
        }
    }

    const updateUpvote = async () => {
        try {
            await globalAPI.put(`/upvote/${workspaceID}?state=${upvoted}`);

            if (upvoted) {
                setUpvotes(state => state-1)
            } else {
                setUpvotes(state => state+1)
            }

            setUpvoted(state => !state)
        } catch (err) {}
    }

    const updateBookmark = async () => {
        try {
            await globalAPI.put(`/bookmark/${workspaceID}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    const updateVisibility = async () => {
        try {
            await globalAPI.put(`/visibility/${workspaceID}`);

            setVisibility(state => !state)
        } catch (err) {}
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
                            setChangedSettings(true)
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
                model: model,
                configuration: configuration,
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

    const updateWorkspace = async () => {
        if (image) {
            const formImage = new FormData();
            formImage.append('image', image);
            
            try {
                const tempPicture = picture
                const imageResponse = await imageAPI.post("/upload", formImage);

                await itemsAPI.put(`/${workspaceID}?type=workspace`, {
                    title: title,
                    description: description,
                    picture: imageResponse.data.data,
                    dataset: uploadedDataset._id,
                    model: model,
                    configuration: configuration,
                    updated: new Date().toISOString()
                })

                setImage(undefined)
                setPicture(imageResponse.data.data)

                if (tempPicture !== "default.png") {
                    await imageAPI.put('/remove', {picture: tempPicture});
                }
            } catch (err) {}
        } else {
            try {
                await itemsAPI.put(`/${workspaceID}?type=workspace`, {
                    title: title,
                    description: description,
                    picture: picture,
                    dataset: uploadedDataset._id,
                    model: model,
                    configuration: configuration,
                    updated: new Date().toISOString()
                })
            } catch (err) {}
        }

        setUpdated(new Date().toISOString())
        setChangedSettings(false)
    }

    const deleteWorkspace = async () => {
        try {
            await itemsAPI.delete(`/${workspaceID}`)

            removeOpenItems(workspaceID)
            history.replace("/home")
        } catch (err) {}
    }

    return (
        <>
            {loaded && exist ?
                <div className="main-body">
                    <div className="sidebar">
                        <div className="sidebar-header">
                            <img src="http://localhost:3000/workspace.png"
                                    className={!(type === "view" && !workspace.self) ? "create-item-edit-image" : undefined} />
                            <input className={`create-item-title ${!(type === "view" && !workspace.self) && "create-item-edit-input"}`}
                                    placeholder="Title"
                                    onChange={e => {
                                        setTitle(e.target.value)
                                        setChangedSettings(true)
                                    }}
                                    disabled={!(workspace.self || type === "create")}
                                    value={title} />
                        </div>
                        <textarea className={`create-item-description ${!(type === "view" && !workspace.self) && "create-item-edit-textarea"}`}
                                    placeholder="Description"
                                    onChange={e => {
                                        setDescription(e.target.value)
                                        setChangedSettings(true)
                                    }}
                                    disabled={!(workspace.self || type === "create")}
                                    value={description} />
                        {(workspace.self || type === "create") &&
                            <>
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Picture</label>
                                    <input className="create-item-setup-input"
                                            type="file" 
                                            name="image" 
                                            onChange={e => {
                                                setImage(e.target.files[0])
                                                setChangedSettings(true)
                                            }} />
                                </div>
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Public?</label>
                                    <input type="checkbox" 
                                            onChange={() => {
                                                setVisibility(previous => !previous)
                                                setChangedSettings(true)
                                            }}
                                            checked={visibility} />
                                </div>
                            </>
                        }
                        {!workspace.self && type !== "create" && <p className="item-creator">{workspace.creatorName.name}</p>}
                        <div className="item-information">
                            {type !== "create" && <p className="item-date">{date}</p>}
                            <span />
                            {!workspace.self && type !== "create" && <BookmarkIcon className={`item-icon ${bookmarked ? "blue2" : "white"}`} onClick={() => {updateBookmark()}} />}
                            {workspace.self && type !== "create" && 
                                <>
                                    {visibility ? 
                                        <VisibilityIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                    :
                                        <VisibilityOffIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                    }
                                </>
                            }
                            {type !== "create" &&
                                <>
                                    <ThumbUpIcon className={`item-icon ${upvoted ? "blue2" : "white"}`} onClick={() => {updateUpvote()}} />
                                    <p className={upvoted ? "blue2" : "white"}>{upvotes}</p>
                                </>
                            }
                        </div>
                        <div className="sidebar-divided" />
                        <input className={`create-workspace-import-existing ${!(type === "view" && !workspace.self) && "create-item-edit-input"}`}
                                placeholder="Dataset ID"
                                onChange={e => {setDatasetID(e.target.value)}}
                                onKeyPress={searchFunctionKey}
                                disabled={!(workspace.self || type === "create")}
                                value={datasetID} />
                        <button className="create-item-view-dataset"
                                onClick={() => {setViewDataset(state => !state)}}>{viewDataset ? "Hide Dataset" : "Show Dataset"}</button>
                        {type === "view" &&
                            <>
                                {workspace.self &&
                                    <>
                                        <div className="sidebar-divided" />
                                        <button className="blue-button item-save"
                                                disabled={!changedSettings}
                                                onClick={() => {updateWorkspace()}}>Save Changes</button>
                                        <button className="text-button item-delete"
                                                onClick={() => {deleteWorkspace()}}>Delete</button>
                                    </>
                                }
                            </>
                        }
                        {displayPublic && <p className="create-item-data-notification">Dataset not public</p>}
                        {displayExist && <p className="create-item-data-notification">Dataset does not exist</p>}
                    </div>
                    <div className="inner">
                        <div className="workspace-body">
                            <div className="workspace-inner">
                                <div className="view-items-top">
                                    {type === "create" &&
                                        <>
                                            <h1>Create Workspace</h1>
                                            <button className="blue-button"
                                                    disabled={disableTrain}
                                                    onClick={() => {uploadImage()}}>Train</button>
                                        </>
                                    }
                                    {type === "view" &&
                                        <>
                                            <button className={`text-button ${stage === "model" ? "item-header-button-selected" : "item-header-button-unselected"}`}
                                                    onClick={() => {setStage("model")}}>Model</button>
                                            <button className={`text-button ${stage === "evaluation" ? "item-header-button-selected" : "item-header-button-unselected"}`}
                                                    onClick={() => {setStage("evaluation")}}>Evaluation</button>
                                        </>
                                    }
                                </div>
                                {stage === "model" ?
                                    <>
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
                                                                        {node.type !== "Input" && (workspace.self || type === "create") &&
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
                                                                                                setChangedSettings(true)
                                                                                                setRefreshDiagram(new Date().getTime())}}>
                                                                                <ClearIcon className="create-model-diagram-remove" />
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    {i === model.length-1 && node.type !== "Output" &&
                                                                        <>
                                                                            {addNode && (workspace.self || type === "create") ?
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
                                                                                            setChangedSettings(true)
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
                                                                                                setChangedSettings(true)
                                                                                            }}>Output</button>
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            :
                                                                                <>  
                                                                                    {(workspace.self || type === "create") &&
                                                                                        <div onClick={() => {setAddNode(true)}}>
                                                                                            <AddIcon className="create-model-diagram-add-icon" />
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
                                                <div>
                                                    <div className="create-model-selected">
                                                        <p>{model[selectedNode].type}</p>
                                                        <div className="create-model-selected-input">
                                                            <div>
                                                                <label>Units</label>
                                                                <input value={model[selectedNode].value} 
                                                                        disabled={(model[selectedNode].type === "Input" || model[selectedNode].type === "Output") && !(workspace.self || type === "create")}
                                                                        onChange={e => {setModel(state => {
                                                                                            const stateCopy = [...state]
                                                                                        
                                                                                            stateCopy[selectedNode] = {
                                                                                                ...stateCopy[selectedNode],
                                                                                                value: Number(e.target.value)
                                                                                            }
                                                                                        
                                                                                            return stateCopy
                                                                                        })
                                                                                        setChangedSettings(true)
                                                                                        setRefreshDiagram(new Date().getTime())}} />
                                                            </div>
                                                            <div>
                                                                <label>Activation</label>
                                                                {model[selectedNode].type !== "Input" ?
                                                                    <select value={model[selectedNode].activation} 
                                                                            disabled={!(workspace.self || type === "create")}
                                                                            onChange={e => {setModel(state => {
                                                                                                const stateCopy = [...state]
                                                                                            
                                                                                                stateCopy[selectedNode] = {
                                                                                                    ...stateCopy[selectedNode],
                                                                                                    activation: e.target.value
                                                                                                }
                                                                                            
                                                                                                return stateCopy
                                                                                            })
                                                                                            setChangedSettings(true)
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
                                                                :
                                                                    <p>None</p>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="create-model-configuration">
                                                        <div className="create-model-configuration-option">
                                                            <div>
                                                                <label>Epochs</label>
                                                                <input value={configuration.epochs}
                                                                        disabled={!(workspace.self || type === "create")} 
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                epochs: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Training Split</label>
                                                                <input value={configuration.training_split} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                training_split: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Validation Split</label>
                                                                <input value={configuration.validation_split} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                validation_split: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Test Split</label>
                                                                <input value={configuration.test_split} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                test_split: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Minimum Improvement</label>
                                                                <input value={configuration.improvement} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                improvement: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Patience</label>
                                                                <input value={configuration.patience} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                patience: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Batch Size</label>
                                                                <input value={configuration.batch} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                batch: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Learning Rate Scheduler</label>
                                                                <input className="create-model-configuration-option-checkbox"
                                                                        type="checkbox" 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                lr_scheduler: !configuration.lr_scheduler
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }}
                                                                        checked={configuration.lr_scheduler} />
                                                            </div>
                                                            <div>
                                                                <label>Optimiser</label>
                                                                <select value={configuration.optimiser} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                optimiser: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }}>
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
                                                                <select value={configuration.loss} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                loss: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }}>
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
                                            </div>
                                        :
                                            <p className="end-items">Select a dataset...</p>
                                        }
                                    </>
                                : (stage === "evaluation") ?
                                    <></>
                                : 
                                    <></>
                                }
                            </div>
                            {viewDataset && uploadedDataset && 
                                <>
                                    {noData ?
                                        <p className="end-items">Cannot find dataset</p>
                                    :
                                        <div className="create-workspace-data">
                                            <p className="create-workspace-data-header">Selected Dataset:</p>
                                            <p className="create-workspace-data-header-dataset">{uploadedDataset._id}</p>
                                            <div className="sidebar-divided" />
                                            <div className="create-workspace-data-images-list" key={refreshData}>
                                                {images.map((image, i) => {
                                                    if (i >= start && i < end) {
                                                        return (
                                                            <div className="create-workspace-data-image" key={i}>
                                                                <img src={`http://127.0.0.1:5000/files/${uploadedDataset.imageFile}/${image}.jpg`} />
                                                                <p>{assignedLabels[i]}</p>
                                                            </div>
                                                        )
                                                    }
                                                })}
                                            </div>
                                            <div className="sidebar-divided" />
                                            <div className="create-workspace-pagination">
                                                <ArrowBackIosNewIcon className="create-workspace-pagination-icon" onClick={() => {previousPage()}} />
                                                <p>Page {page} / {Math.ceil(images.length/20)}</p>
                                                <ArrowForwardIosIcon className="create-workspace-pagination-icon" onClick={() => {nextPage()}} />
                                            </div>
                                        </div>
                                    }   
                                </>
                            }
                        </div>
                    </div>
                </div>
            : loaded && !exist &&
                <div className="inner">  
                    <p className="item-exist">Cannot find dataset</p>
                </div>
            }
        </>
    )
}

export default Workspace