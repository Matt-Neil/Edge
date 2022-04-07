import React, {useState, useEffect, useRef, useContext} from 'react'
import {useHistory, useParams, Link} from "react-router-dom"
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import globalAPI from '../API/global'
import imageAPI from '../API/images'
import filesAPI from '../API/files'
import trainAPI from '../API/train'
import predictAPI from '../API/predict'
import ModelNode from '../Components/Model-Node';
import Chart from '../Components/Chart'
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';

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
    const [trainTime, setTrainTime] = useState(0)
    const [end, setEnd] = useState(20)
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [datasetID, setDatasetID] = useState("")
    const [uploadedDataset, setUploadedDataset] = useState()
    const [workspace, setWorkspace] = useState([]);
    const [images, setImages] = useState([])
    const [predictionFile, setPredictionFile] = useState()
    const [prediction, setPrediction] = useState()
    const [assignedLabels, setAssignedLabels] = useState([])
    const [refreshData, setRefreshData] = useState()
    const [refreshDiagram, setRefreshDiagram] = useState()
    const [changedSettings, setChangedSettings] = useState(false)
    const [model, setModel] = useState([{type: "Input"}])
    const [evaluation, setEvaluation] = useState()
    const [selectedNode, setSelectedNode] = useState(0)
    const [configuration, setConfiguration] = useState({epochs: 0, training_split: 0, validation_split: 0, improvement: 0, early_stopping: false, decay_rate: 0,
                                                        decay_steps: 1, patience: 0, batch: 32, lr_scheduler: false, initial_lr: 0.01, optimiser: "", loss: ""})
    const [addNode, setAddNode] = useState(false)
    const [loaded, setLoaded] = useState(false);
    const [exist, setExist] = useState()
    const [noData, setNoData] = useState()
    const [disabledCreate, setDisabledCreate] = useState(false)
    const [disabledTrain, setDisabledTrain] = useState(false)
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
                    setEvaluation({
                        testAcc: workspace.data.data.evaluation.testAcc,
                        testLoss: workspace.data.data.evaluation.testLoss,
                        trainAcc: workspace.data.data.evaluation.trainAcc,
                        trainLoss: workspace.data.data.evaluation.trainLoss,
                        validationAcc: workspace.data.data.evaluation.validationAcc,
                        validationLoss: workspace.data.data.evaluation.validationLoss,
                        trainEpochs: Array.from(Array(workspace.data.data.evaluation.trainEpochs), (e, i) => (i + 1).toString())
                    })
                    setTrainTime(workspace.data.data.evaluation.trainTime)

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
        const timerID = stage === "train" && setInterval(() => {
            setTrainTime(previous => previous + 1);
        }, 1000);
        return () => {
            clearInterval(timerID)
        }
    }, [trainTime, stage])

    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'end'
            })
        }
    }, [model.length, addNode])

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

        if (uploadedDataset && title !== "" && description !== "" && image) {
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
            const updatedEvaluation = {
                testAcc: evaluation.testAcc,
                testLoss: evaluation.testLoss,
                trainAcc: evaluation.trainAcc,
                trainLoss: evaluation.trainLoss,
                validationAcc: evaluation.validationAcc,
                validationLoss: evaluation.validationLoss,
                trainEpochs: evaluation.trainEpochs[evaluation.trainEpochs.length-1],
                trainTime: trainTime
            }
    
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
                evaluation: updatedEvaluation,
                type: "workspace"
            });

            history.push(`/workspace/${workspaceResponse.data.data}`)
        } catch (err) {}
    }

    const train = async () => {
        try {
            setTrainTime(0)
            setDisabledTrain(true)
            setStage("train")
    
            const formData = new FormData();
        
            formData.append('epochs', configuration.epochs)
            formData.append('training_split', configuration.training_split)
            formData.append('validation_split', configuration.validation_split)
            formData.append('improvement', configuration.improvement)
            formData.append('patience', configuration.patience)
            formData.append('batch', configuration.batch)
            formData.append('decay_rate', configuration.decay_rate)
            formData.append('decay_steps', configuration.decay_steps)
            formData.append('early_stopping', configuration.early_stopping ? "true" : "false")
            formData.append('lr_scheduler', configuration.lr_scheduler ? "true" : "false")
            formData.append('initial_lr', configuration.initial_lr)
            formData.append('optimiser', configuration.optimiser)
            formData.append('loss', configuration.loss)
            formData.append('rgb', uploadedDataset.rgb)
            formData.append('imageFile', uploadedDataset.imageFile)
            formData.append('height', uploadedDataset.height)
            formData.append('width', uploadedDataset.width)
            formData.append('label', uploadedDataset.labels.length)
            formData.append('id', workspaceID)

            model.map(node => {
                formData.append('model[]', JSON.stringify(node))
            })

            const response = await trainAPI.post("", formData);

            setDisabledTrain(false)

            if (response) {
                updateWorkspace()

                setEvaluation({
                    testAcc: response.data.test_acc,
                    testLoss: response.data.test_loss,
                    trainAcc: response.data.training.accuracy,
                    trainLoss: response.data.training.loss,
                    validationAcc: response.data.training.val_accuracy,
                    validationLoss: response.data.training.val_loss,
                    trainEpochs: Array.from(Array(response.data.epochs), (e, i) => (i + 1).toString())
                })
                setStage("evaluation")
                setChangedSettings(true)
            }
        } catch (err) {
            setStage("model")
            setDisabledTrain(false)
        }
    }

    const predictModel = async () => {
        try {
            setPrediction("")

            const formData = new FormData();

            formData.append('id', workspaceID)
            formData.append('rgb', uploadedDataset.rgb)
            formData.append('height', uploadedDataset.height)
            formData.append('width', uploadedDataset.width)
            formData.append('image', predictionFile)

            uploadedDataset.labels.map(label => {
                formData.append('labels[]', label)
            })

            const response = await predictAPI.post("", formData);
            
            setPrediction(response.data)
        } catch (err) {console.log(err)}
    }

    const updateWorkspace = async () => {
        const updatedEvaluation = {
            testAcc: evaluation.testAcc,
            testLoss: evaluation.testLoss,
            trainAcc: evaluation.trainAcc,
            trainLoss: evaluation.trainLoss,
            validationAcc: evaluation.validationAcc,
            validationLoss: evaluation.validationLoss,
            trainEpochs: evaluation.trainEpochs[evaluation.trainEpochs.length-1],
            trainTime: trainTime
        }

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
                    evaluation: updatedEvaluation,
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
                    evaluation: updatedEvaluation,
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
            const formData = new FormData();
            formData.append('id', workspace._id);

            await itemsAPI.delete(`/${workspaceID}`)
            await filesAPI.post(`/remove-workspace`, formData)

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
                                {type === "create" &&
                                    <div className="create-item-setup">
                                        <label className="create-item-setup-label">Public?</label>
                                        <input type="checkbox" 
                                                onChange={() => {
                                                    setVisibility(previous => !previous)
                                                    setChangedSettings(true)
                                                }}
                                                checked={visibility} />
                                    </div>
                                }
                            </>
                        }
                        {!workspace.self && type !== "create" && <p className="item-creator">{workspace.creatorName.name}</p>}
                        <div className="item-information">
                            {type !== "create" && <p className="item-date">{date}</p>}
                            <span />
                            {type !== "create" &&
                                <>
                                    <ThumbUpIcon className={`item-icon ${upvoted ? "blue2" : "white"}`} onClick={() => {updateUpvote()}} />
                                    <p className={upvoted ? "blue2" : "white"}>{upvotes}</p>
                                </>
                            }
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
                        </div>
                        <div className="sidebar-divided" />
                        <div className="create-workspace-uploaded-dataset">
                            {(type === "create" || workspace.self) ?
                                <>
                                    <input className={`create-workspace-import-existing ${!(type === "view" && !workspace.self) && "create-item-edit-input"}`}
                                            placeholder="Dataset ID"
                                            onChange={e => {setDatasetID(e.target.value)}}
                                            onKeyPress={searchFunctionKey}
                                            value={datasetID} />
                                    {type === "view" && 
                                        <Link className="create-item-view-dataset" to={`/dataset/${datasetID}`}>
                                            <OpenInNewIcon className="create-item-view-dataset-icon" />
                                        </Link>
                                    }
                                    <a href={`http://127.0.0.1:5000/models/${workspaceID}`} download>
                                        <DownloadIcon className="dataset-download-icon" />
                                    </a>
                                </>
                            :
                                <div>
                                    <p className="create-workspace-uploaded-dataset-header">Selected Dataset:</p>
                                    <Link to={`/dataset/${datasetID}`} className="create-workspace-uploaded-dataset-link">
                                        <img src={`http://localhost:4000/images/${uploadedDataset.picture}`} />
                                        <p>{uploadedDataset.title}</p>
                                    </Link>
                                </div>
                            }
                        </div>
                        
                        {type === "view" &&
                            <>
                                {workspace.self &&
                                    <>
                                        <div className="sidebar-divided" />
                                        <button className="blue-button item-save"
                                                disabled={!changedSettings}
                                                onClick={() => {updateWorkspace()}}>Save Workspace</button>
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
                                    <h1>{type === "create" ? "Create Workspace" : "Workspace"}</h1>
                                    <div>
                                        <button className={`text-button ${stage === "model" ? "item-header-button-selected" : "item-header-button-unselected"}`}
                                                onClick={() => {setStage("model")}}>Model</button>
                                        <button className={`text-button ${stage === "evaluation" ? "item-header-button-selected" : "item-header-button-unselected"}`}
                                                onClick={() => {setStage("evaluation")}}>Evaluation</button>
                                        <button className={`text-button ${stage === "prediction" ? "item-header-button-selected" : "item-header-button-unselected"}`}
                                                onClick={() => {setStage("prediction")}}>Prediction</button>
                                        <span />
                                        {(workspace.self || type === "create") &&
                                            <button className="blue-button"
                                                    disabled={disabledTrain || model[model.length-1].type !== "Output" || model.length === 0}
                                                    onClick={() => {train()}}>Train</button>
                                        }
                                        {type === "create" &&
                                            <button className="workspace-create blue-button"
                                                    disabled={!evaluation || title === "" || description === "" || model[model.length-1].type !== "Output"}
                                                    onClick={() => {uploadImage()}}>Create</button>
                                        }
                                    </div>
                                </div>
                                {stage === "model" ?
                                    <>
                                        {uploadedDataset ?
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
                                                                    {i === model.length-1 && model[selectedNode].type !== "Output" &&
                                                                        <>
                                                                            {addNode && (workspace.self || type === "create") ?
                                                                                <div className="create-model-diagram-add">
                                                                                    <div onClick={() => {setAddNode(false)}}>
                                                                                        <RemoveIcon className="create-model-diagram-add-icon" />
                                                                                    </div>
                                                                                    <div className="create-model-diagram-add-options">
                                                                                        {(model[selectedNode].type === "Input" || model[selectedNode].type === "Conv2D" || model[selectedNode].type === "MaxPooling2D" ||
                                                                                            model[selectedNode].type === "Dropout" || model[selectedNode].type === "BatchNormalisation") &&
                                                                                            <>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy.splice(selectedNode+1, 0, {
                                                                                                            type: "Conv2D",
                                                                                                            filters: 0,
                                                                                                            kernel: 3,
                                                                                                            strides: 2,
                                                                                                            padding: "same",
                                                                                                            activation: ""
                                                                                                        })
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })

                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>Conv2D</button>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy.splice(selectedNode+1, 0, {
                                                                                                            type: "MaxPooling2D",
                                                                                                            pool: 3,
                                                                                                            strides: 2,
                                                                                                            padding: "same"
                                                                                                        })
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    
                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>MaxPooling2D</button>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy.splice(selectedNode+1, 0, {
                                                                                                            type: "AvgPooling2D",
                                                                                                            pool: 3,
                                                                                                            strides: 2,
                                                                                                            padding: "same"
                                                                                                        })
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    
                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>AvgPooling2D</button>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy.splice(selectedNode+1, 0, {
                                                                                                            type: "BatchNormalisation",
                                                                                                            momentum: 0
                                                                                                        })
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })

                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>Batch Normalisation</button>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy.splice(selectedNode+1, 0, {
                                                                                                            type: "Dropout",
                                                                                                            rate: 0
                                                                                                        })
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })

                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>Dropout</button>
                                                                                                {selectedNode === model.length-1 &&
                                                                                                    <button onClick={() => {setModel(state => [...state, {
                                                                                                            type: "Flatten"
                                                                                                        }])
                                                                                                        setSelectedNode(state => state + 1)
                                                                                                        setAddNode(false)
                                                                                                        setChangedSettings(true)
                                                                                                    }}>Flatten</button>
                                                                                                }
                                                                                            </>
                                                                                        }
                                                                                        {(model[selectedNode].type === "Flatten" || model[selectedNode].type === "Dense") &&
                                                                                            <button onClick={() => {
                                                                                                setModel(state => {
                                                                                                    const stateCopy = [...state]
                                                                                                
                                                                                                    stateCopy.splice(selectedNode+1, 0, {
                                                                                                        type: "Dense",
                                                                                                        units: 0,
                                                                                                        activation: ""
                                                                                                    })
                                                                                                
                                                                                                    return stateCopy
                                                                                                })
                                                                                                
                                                                                                setSelectedNode(state => state + 1)
                                                                                                setAddNode(false)
                                                                                                setChangedSettings(true)
                                                                                            }}>Dense</button>
                                                                                        }
                                                                                        {model[selectedNode].type === "Dense" &&
                                                                                            <>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy.splice(selectedNode+1, 0, {
                                                                                                            type: "Dropout",
                                                                                                            rate: 0
                                                                                                        })
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })

                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>Dropout</button>
                                                                                                {selectedNode === model.length-1 &&
                                                                                                    <button onClick={() => {
                                                                                                            {uploadedDataset.labels.length === 2 ?
                                                                                                                setModel(state => [...state, {
                                                                                                                    type: "Output",
                                                                                                                    units: 1,
                                                                                                                    activation: ""
                                                                                                                }])
                                                                                                            :
                                                                                                                setModel(state => [...state, {
                                                                                                                    type: "Output",
                                                                                                                    units: uploadedDataset.labels.length,
                                                                                                                    activation: ""
                                                                                                                }])
                                                                                                            }
                                                                                                        setSelectedNode(state => state + 1)
                                                                                                        setAddNode(false)
                                                                                                        setChangedSettings(true)
                                                                                                    }}>Output</button>
                                                                                                }
                                                                                            </>
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
                                                            {model[selectedNode].type !== "Flatten" &&
                                                                <>
                                                                    {model[selectedNode].type === "Dense" &&
                                                                        <div>
                                                                            <label>Units</label>
                                                                            <input value={model[selectedNode].units} 
                                                                                    disabled={!(workspace.self || type === "create")}
                                                                                    onChange={e => {setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy[selectedNode] = {
                                                                                                            ...stateCopy[selectedNode],
                                                                                                            units: Number(e.target.value)
                                                                                                        }
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    setChangedSettings(true)
                                                                                                    setRefreshDiagram(new Date().getTime())}} />
                                                                        </div>
                                                                    }
                                                                    {(model[selectedNode].type === "Dense" || model[selectedNode].type === "Conv2D" || model[selectedNode].type === "Output") &&
                                                                        <div>
                                                                            <label>Activation</label>
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
                                                                        </div>
                                                                    }
                                                                    {(model[selectedNode].type === "Conv2D" || model[selectedNode].type === "MaxPooling2D") &&
                                                                        <>
                                                                            <div>
                                                                                <label>Padding</label>
                                                                                <select value={model[selectedNode].padding} 
                                                                                    disabled={!(workspace.self || type === "create")}
                                                                                    onChange={e => {setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy[selectedNode] = {
                                                                                                            ...stateCopy[selectedNode],
                                                                                                            padding: e.target.value
                                                                                                        }
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    setChangedSettings(true)
                                                                                                    setRefreshDiagram(new Date().getTime())}}>
                                                                                    <option disabled defaultValue value=""></option>
                                                                                    <option value="same">Same</option>
                                                                                    <option value="valid">Valid</option>
                                                                                </select>
                                                                            </div>
                                                                            <div>
                                                                                <label>Strides</label>
                                                                                <input value={model[selectedNode].strides} 
                                                                                    disabled={!(workspace.self || type === "create")}
                                                                                    onChange={e => {setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy[selectedNode] = {
                                                                                                            ...stateCopy[selectedNode],
                                                                                                            strides: Number(e.target.value)
                                                                                                        }
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    setChangedSettings(true)
                                                                                                    setRefreshDiagram(new Date().getTime())}} />
                                                                            </div>
                                                                        </>
                                                                    }
                                                                    {model[selectedNode].type === "Conv2D" &&
                                                                        <>
                                                                            <div>
                                                                                <label>Filters</label>
                                                                                <input value={model[selectedNode].filters} 
                                                                                    disabled={!(workspace.self || type === "create")}
                                                                                    onChange={e => {setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy[selectedNode] = {
                                                                                                            ...stateCopy[selectedNode],
                                                                                                            filters: Number(e.target.value)
                                                                                                        }
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    setChangedSettings(true)
                                                                                                    setRefreshDiagram(new Date().getTime())}} />
                                                                            </div>
                                                                            <div>
                                                                                <label>Kernel Size</label>
                                                                                <input value={model[selectedNode].kernel} 
                                                                                    disabled={!(workspace.self || type === "create")}
                                                                                    onChange={e => {setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        stateCopy[selectedNode] = {
                                                                                                            ...stateCopy[selectedNode],
                                                                                                            kernel: Number(e.target.value)
                                                                                                        }
                                                                                                    
                                                                                                        return stateCopy
                                                                                                    })
                                                                                                    setChangedSettings(true)
                                                                                                    setRefreshDiagram(new Date().getTime())}} />
                                                                            </div>
                                                                        </>
                                                                    }
                                                                    {model[selectedNode].type === "MaxPooling2D" &&
                                                                        <div>
                                                                            <label>Pooling Size</label>
                                                                            <input value={model[selectedNode].pool} 
                                                                                disabled={!(workspace.self || type === "create")}
                                                                                onChange={e => {setModel(state => {
                                                                                                    const stateCopy = [...state]
                                                                                                
                                                                                                    stateCopy[selectedNode] = {
                                                                                                        ...stateCopy[selectedNode],
                                                                                                        pool: Number(e.target.value)
                                                                                                    }
                                                                                                
                                                                                                    return stateCopy
                                                                                                })
                                                                                                setChangedSettings(true)
                                                                                                setRefreshDiagram(new Date().getTime())}} />
                                                                        </div>
                                                                    }
                                                                    {model[selectedNode].type === "Dropout" &&
                                                                        <div>
                                                                            <label>Rate</label>
                                                                            <input value={model[selectedNode].rate} 
                                                                                disabled={!(workspace.self || type === "create")}
                                                                                onChange={e => {setModel(state => {
                                                                                                    const stateCopy = [...state]
                                                                                                
                                                                                                    stateCopy[selectedNode] = {
                                                                                                        ...stateCopy[selectedNode],
                                                                                                        rate: Number(e.target.value)
                                                                                                    }
                                                                                                
                                                                                                    return stateCopy
                                                                                                })
                                                                                                setChangedSettings(true)
                                                                                                setRefreshDiagram(new Date().getTime())}} />
                                                                        </div>
                                                                    }
                                                                    {model[selectedNode].type === "BatchNormalisation" &&
                                                                        <div>
                                                                            <label>Momentum</label>
                                                                            <input value={model[selectedNode].momentum} 
                                                                                disabled={!(workspace.self || type === "create")}
                                                                                onChange={e => {setModel(state => {
                                                                                                    const stateCopy = [...state]
                                                                                                
                                                                                                    stateCopy[selectedNode] = {
                                                                                                        ...stateCopy[selectedNode],
                                                                                                        momentum: Number(e.target.value)
                                                                                                    }
                                                                                                
                                                                                                    return stateCopy
                                                                                                })
                                                                                                setChangedSettings(true)
                                                                                                setRefreshDiagram(new Date().getTime())}} />
                                                                        </div>
                                                                    }
                                                                    {model[selectedNode].type === "Input" &&
                                                                        <>
                                                                            <div>
                                                                                <label>Image Height</label>
                                                                                <p>{uploadedDataset.height}</p>
                                                                            </div>
                                                                            <div>
                                                                                <label>Image Width</label>
                                                                                <p>{uploadedDataset.width}</p>
                                                                            </div>
                                                                        </>
                                                                    }
                                                                </>
                                                            }
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
                                                                <label>Initial Learning Rate</label>
                                                                <input value={configuration.initial_lr} 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={e => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                initial_lr: e.target.value
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }} />
                                                            </div>
                                                            <div>
                                                                <label>Learning Rate Scheduler</label>
                                                                <input className="create-model-configuration-option-checkbox"
                                                                        type="checkbox" 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={() => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                lr_scheduler: !configuration.lr_scheduler
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }}
                                                                        checked={configuration.lr_scheduler} />
                                                            </div>
                                                            {configuration.lr_scheduler &&
                                                                <>
                                                                    <div>
                                                                        <label>Decay Rate</label>
                                                                        <input value={configuration.decay_rate} 
                                                                                disabled={!(workspace.self || type === "create")}
                                                                                onChange={e => {
                                                                                    setConfiguration(state => ({
                                                                                        ...state,
                                                                                        decay_rate: e.target.value
                                                                                    }))
                                                                                    setChangedSettings(true)
                                                                                }} />
                                                                    </div>
                                                                    <div>
                                                                        <label>Decay Steps</label>
                                                                        <input value={configuration.decay_steps} 
                                                                                disabled={!(workspace.self || type === "create")}
                                                                                onChange={e => {
                                                                                    setConfiguration(state => ({
                                                                                        ...state,
                                                                                        decay_steps: e.target.value
                                                                                    }))
                                                                                    setChangedSettings(true)
                                                                                }} />
                                                                    </div>
                                                                </>
                                                            }
                                                            <div>
                                                                <label>Early Stopping</label>
                                                                <input className="create-model-configuration-option-checkbox"
                                                                        type="checkbox" 
                                                                        disabled={!(workspace.self || type === "create")}
                                                                        onChange={() => {
                                                                            setConfiguration(state => ({
                                                                                ...state,
                                                                                early_stopping: !configuration.early_stopping
                                                                            }))
                                                                            setChangedSettings(true)
                                                                        }}
                                                                        checked={configuration.early_stopping} />
                                                            </div>
                                                            {configuration.early_stopping &&
                                                                <>
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
                                                                </>
                                                            }
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
                                    <div className='create-evaluation-body'>
                                        {!evaluation ?
                                            <p className='create-evaluation-header'>Model must be trained first...</p>
                                        :
                                            <>
                                                <div className="create-evaluation-test">
                                                    <div>
                                                        <p>Training Time:</p>
                                                        <p>{trainTime} seconds</p>
                                                    </div>
                                                    <div>
                                                        <p>Test Accuracy:</p>
                                                        <p>{evaluation.testAcc.toFixed(3)}</p>
                                                    </div>
                                                    <div>
                                                        <p>Test Loss:</p>
                                                        <p>{evaluation.testLoss.toFixed(3)}</p>
                                                    </div>
                                                </div>
                                                <Chart x={evaluation.trainEpochs} y1={evaluation.trainAcc} y2={evaluation.validationAcc} type={"Accuracy"} />
                                                <Chart x={evaluation.trainEpochs} y1={evaluation.trainLoss} y2={evaluation.validationLoss} type={"Loss"} />
                                            </>
                                        }
                                    </div>
                                : (stage === "train") ?
                                    <div className='create-training-body'>
                                        <p>Training Model...</p>
                                        <p>Elapsed Time: {trainTime} seconds</p>
                                    </div>
                                :
                                    <div className='create-prediction-body'>
                                        {!evaluation ?
                                            <p className='create-prediction-header'>Model must be trained first...</p>
                                        :
                                            <>
                                                <div className="create-prediction-top">
                                                    <input type="file" 
                                                            name="data"
                                                            accept="image/*"
                                                            onChange={e => {
                                                                setPrediction("")
                                                                setPredictionFile(e.target.files[0])}} 
                                                            />
                                                    <button className="white-button"
                                                            onClick={() => {predictModel()}}>Predict</button>
                                                </div>
                                                {predictionFile && 
                                                    <div className="create-prediction-card">
                                                        <img src={URL.createObjectURL(predictionFile)} />
                                                        <p>{prediction ? "Predicted label:" : "Predict label..."}</p>
                                                        <p className="create-prediction-card-prediction">{prediction}</p>
                                                    </div>
                                                }
                                            </>
                                        }
                                    </div>
                                }
                            </div>
                            {uploadedDataset && 
                                <>
                                    {noData ?
                                        <p className="end-items">Cannot find dataset</p>
                                    :
                                        <div className="create-workspace-data">
                                            <p className="create-workspace-data-header">Selected Dataset:</p>
                                            <p className="create-workspace-data-header-dataset">{uploadedDataset.title}</p>
                                            <div className="sidebar-divided" />
                                            <div className="create-workspace-data-images-list" key={refreshData}>
                                                {images.map((image, i) => {
                                                    if (i >= start && i < end && assignedLabels[i] !== "No label") {
                                                        return (
                                                            <div className="create-workspace-data-image" key={i}>
                                                                <img src={`http://127.0.0.1:5000/files/${uploadedDataset.imageFile}/images/${assignedLabels[i]}/${image}.jpg`}  />
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
                    <p className="item-exist">Cannot find workspace</p>
                </div>
            }
        </>
    )
}

export default Workspace