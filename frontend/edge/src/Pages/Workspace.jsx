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
import { MessageContext } from '../Contexts/messageContext';
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
import MessageCard from '../Components/MessageCard'

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
    const [configuration, setConfiguration] = useState({epochs: 1, training_split: 0.8, validation_split: 0.2, improvement: 0.1, early_stopping: false, decay_rate: 0.01,
                                                        decay_steps: 1, patience: 1, batch: 32, lr_scheduler: false, initial_lr: 0.01, optimiser: "", loss: ""})
    const [addNode, setAddNode] = useState(false)
    const [loaded, setLoaded] = useState(false);
    const [exist, setExist] = useState()
    const [noData, setNoData] = useState()
    const [disabledCreate, setDisabledCreate] = useState(false)
    const [disabledTrain, setDisabledTrain] = useState(false)
    const [message, setMessage] = useState("")
    const {addOpenItems, removeOpenItems} = useContext(OpenItemsContext);
    const {displayMessage, displayMessageInterval} = useContext(MessageContext);
    const modelRef = useRef(null)
    const workspaceID = useParams().id;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (type === "create") {
                    // Fetches signed-in user's created workspaces
                    const workspace = await usersAPI.get("/created?type=workspace");
    
                    // Workspaces titles are stored in a local state array
                    workspace.data.data.map((workspace) => {
                        setWorkspace(previous => [...previous, workspace.title]);
                    })

                    setExist(true)
                    setLoaded(true)
                } else {
                    const workspace = await itemsAPI.get(`/${workspaceID}?type=workspace`);

                    // Adds workspace to header context provider if creator
                    if (workspace.data.data.self) {
                        addOpenItems(workspace.data.data._id, workspace.data.data.title, workspace.data.data.type)
                    }

                    // Sets all workspace information to local state variables
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
                        testPrecision: workspace.data.data.evaluation.testPrecision,
                        testRecall: workspace.data.data.evaluation.testRecall,
                        trainAcc: workspace.data.data.evaluation.trainAcc,
                        trainLoss: workspace.data.data.evaluation.trainLoss,
                        validationAcc: workspace.data.data.evaluation.validationAcc,
                        validationLoss: workspace.data.data.evaluation.validationLoss,
                        trainPrecision: workspace.data.data.evaluation.trainPrecision,
                        trainRecall: workspace.data.data.evaluation.trainRecall,
                        validationPrecision: workspace.data.data.evaluation.validationPrecision,
                        validationRecall: workspace.data.data.evaluation.validationRecall,
                        trainEpochs: Array.from(Array(workspace.data.data.evaluation.trainEpochs), (e, i) => (i + 1).toString())
                    })
                    setTrainTime(workspace.data.data.evaluation.trainTime)

                    // Fetches the labels.json file for the selected dataset
                    fetch(`http://127.0.0.1:5000/datasets/${workspace.data.data.dataset.imageDir}/labels.json`)
                        .then(response => response.json())
                        .then(images => {
                            images.map(image => {
                                // Sets the images and their assigned label to their respective arrays in the local state
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

    // Creates timer for training the model
    useEffect(() => {
        const timerID = stage === "train" && setInterval(() => {
            setTrainTime(previous => previous + 1);
        }, 1000);
        return () => {
            clearInterval(timerID)
        }
    }, [trainTime, stage])

    // Scroll div containing model to bottom when new node is added
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'end'
            })
        }
    }, [model.length, addNode])

    // Converts the ISO date the workspace was last updated into a better format for user readability
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

    // Search for selected dataset to be used in workspace
    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && datasetID !== "") {
            existingDataset()
        }
    }

    // Updates whether the currently signed-in user has upvoted the workspace
    const updateUpvote = async () => {
        try {
            // Creates an PUT request to the associated API endpoint with the state of the upvote as a query parameter
            await globalAPI.put(`/upvote/${workspaceID}?state=${upvoted}`);

            // Updates the local state variable containing the number of upvotes
            if (upvoted) {
                setUpvotes(state => state-1)
            } else {
                setUpvotes(state => state+1)
            }

            // Updates the local state variable containing the upvote state
            setUpvoted(state => !state)
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Updates whether the currently signed-in user has bookmarked the workspace
    const updateBookmark = async () => {
        try {
            // Creates a PUT request to the associated API endpoint with the bookmark state as a query parameter
            await globalAPI.put(`/bookmark/${workspaceID}?state=${bookmarked}`);
            
            // Updates the local state variable containing the bookmark state
            setBookmarked(state => !state)
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Updates whether the workspace is public or not
    const updateVisibility = async () => {
        try {
            // Creates a PUT request to he associated API endpoint to update the workspace or dataset visibility
            await globalAPI.put(`/visibility/${workspaceID}`);

            // Updates the local state variable containing the visibility state
            setVisibility(state => !state)
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Displays the previous page of images if applicable
    const previousPage = () => {
        if (page > 1) {
            setStart((page-2)*20)
            setEnd((page-1)*20)
            setPage(state => state-1)
            setRefreshData(new Date().getTime())
        }
    }
    
    // Displays the next page of images if applicable
    const nextPage = () => {
        if (page*20 < images.length && images.length > 20) {
            setPage(state => state+1)
            setStart((page)*20)
            setEnd((page+1)*20)
            setRefreshData(new Date().getTime())
        }
    }

    // Checks if entered dataset exists
    const existingDataset = async () => {
        try {
            // Creates a GET request to check if dataset exists
            const checkPublic = await itemsAPI.get(`/check-public-dataset?id=${datasetID}`)

            // Checks if dataset exists and is public or the signed-in user is the creator of the dataset
            if (checkPublic.data.success && (checkPublic.data.data.visibility || 
                    checkPublic.data.data.creator === currentUser.id)) {
                // Fetches the labels.json file for the selected dataset
                fetch(`http://127.0.0.1:5000/datasets/${workspace.data.data.dataset.imageDir}/labels.json`)
                .then(response => response.json())
                .then(images => {
                    images.map(image => {
                        // Sets the images and their assigned label to their respective arrays in the local state
                        setImages(state => [...state, image.filename])
                        setAssignedLabels(state => [...state, image.label])
                    })
                    setUploadedDataset(checkPublic.data.data)
                    setRefreshData(new Date().getTime())
                    setChangedSettings(true)
                })
            } else if (checkPublic.data.success && !checkPublic.data.data.visibility && 
                            checkPublic.data.data.creator !== currentUser.id) {
                setMessage("Dataset is private")
                displayMessageInterval()
            } else {
                setMessage("Dataset not found")
                displayMessageInterval()
            }
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Upload thumbnail image to ExpressJS server
    const uploadImage = async () => {
        setDisabledCreate(true)
        
        if (uploadedDataset && evaluation && title !== "" && description !== "") {
            if (image) {
                const formImage = new FormData();
                formImage.append('image', image);

                try {
                    const imageResponse = await imageAPI.post("/upload", formImage);

                    uploadData(imageResponse.data.data)
                } catch (err) {
                    setMessage("Error occurred")
                    displayMessageInterval()
                }
            } else {
                uploadData("default.png")
            }
        } else {
            let error = ""

            if (!uploadedDataset) {
                error = "Missing dataset"
            }

            if (!evaluation) {
                if (error === "") {
                    error = error + "Model not trained"
                } else {
                    error = error + " | Model not trained"
                }
            }

            if (title === "") {
                if (error === "") {
                    error = error + "Title is blank"
                } else {
                    error = error + " | Title is blank"
                }
            }

            if (description === "") {
                if (error === "") {
                    error = error + "Title is blank"
                } else {
                    error = error + " | Description is blank"
                }
            }

            setMessage(error)
            displayMessageInterval()
            setDisabledCreate(false)
        }
    }

    // Uploads workspace information to MongoDB on creation
    const uploadData = async (imageName) => {
        try {
            const updatedEvaluation = {
                testAcc: evaluation.testAcc,
                testLoss: evaluation.testLoss,
                testPrecision: evaluation.testPrecision,
                testRecall: evaluation.testRecall,
                trainAcc: evaluation.trainAcc,
                trainLoss: evaluation.trainLoss,
                validationAcc: evaluation.validationAcc,
                validationLoss: evaluation.validationLoss,
                trainPrecision: evaluation.trainPrecision,
                trainRecall: evaluation.trainRecall,
                validationPrecision: evaluation.validationPrecision,
                validationRecall: evaluation.validationRecall,
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

            setMessage("Workspace created")
            displayMessageInterval()
            history.push(`/workspace/${workspaceResponse.data.data}`)
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }
    
    // Training model
    const train = async () => {
        // Validation for model parameters
        if (parseInt(configuration.epochs) >= 1 && parseInt(configuration.epochs) <= 50 &&
            parseFloat(configuration.training_split) > 0 && parseFloat(configuration.training_split) < 1 &&
            parseFloat(configuration.validation_split) > 0 && parseFloat(configuration.validation_split) < 1 &&
            parseFloat(configuration.validation_split) + parseFloat(configuration.training_split) === 1 && 
            parseInt(configuration.batch) >= 1 && parseFloat(configuration.improvement) >= 0 && 
            parseInt(configuration.patience) >= 1 && parseFloat(configuration.decay_rate) >= 0 && 
            parseFloat(configuration.decay_rate) <= 1 && parseInt(configuration.decay_steps) >= 1 && 
            parseFloat(configuration.initial_lr) > 0 && parseFloat(configuration.initial_lr) < 1)

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
                formData.append('imageDir', uploadedDataset.imageDir)
                formData.append('height', uploadedDataset.height)
                formData.append('width', uploadedDataset.width)
                formData.append('label', uploadedDataset.labels.length)
                formData.append('id', workspaceID)

                model.map(node => {
                    formData.append('model[]', JSON.stringify(node))
                })

                // Creates POST request to Flask server to train model with all parameters in the request body
                const response = await trainAPI.post("", formData);

                setDisabledTrain(false)

                // Checks if model successfully trained
                if (response) {
                    if (type === "view") {
                        updateWorkspace()
                    }

                    // Sets all evaluation results to object in local state
                    setEvaluation({
                        testLoss: response.data.test[0],
                        testAcc: response.data.test[1],
                        testPrecision: response.data.test[2],
                        testRecall: response.data.test[3],
                        trainAcc: response.data.training.accuracy,
                        trainLoss: response.data.training.loss,
                        validationAcc: response.data.training.val_accuracy,
                        validationLoss: response.data.training.val_loss,
                        trainPrecision: response.data.training.precision,
                        trainRecall: response.data.training.recall,
                        validationPrecision: response.data.training.val_precision,
                        validationRecall: response.data.training.val_recall,
                        trainEpochs: Array.from(Array(response.data.epochs), (e, i) => (i + 1).toString())
                    })
                    setStage("evaluation")
                    setChangedSettings(true)
                }
            } catch (err) {
                setStage("model")
                setDisabledTrain(false)
                setMessage("Error occurred")
                displayMessageInterval()
            }
        else {
            let error = ""

            if (!(parseInt(configuration.epochs) >= 1 && parseInt(configuration.epochs) <= 50)) {
                error = "Epochs must be 1-50"
            }

            if (!(parseFloat(configuration.training_split) > 0 && parseFloat(configuration.training_split) < 1)) {
                if (error === "") {
                    error = error + "Training split must be 0-1"
                } else {
                    error = error + " | Training split must be 0-1"
                }
            }

            if (!(parseFloat(configuration.validation_split) > 0 && parseFloat(configuration.validation_split) < 1)) {
                if (error === "") {
                    error = error + "Validation split must be 0-1"
                } else {
                    error = error + " | Validation split must be 0-1"
                }
            }

            if (!(parseFloat(configuration.validation_split) + parseFloat(configuration.training_split) === 1)) {
                if (error === "") {
                    error = error + "Training and validation split must sum to 1"
                } else {
                    error = error + " | Training and validation split must equal 1"
                }
            }

            if (!(parseInt(configuration.batch) >= 1)) {
                if (error === "") {
                    error = error + "Batch size must be at least 1"
                } else {
                    error = error + " | Batch size must be at least 1"
                }
            }

            if (!(parseFloat(configuration.improvement) >= 0)) {
                if (error === "") {
                    error = error + "Improvement must be at least 0"
                } else {
                    error = error + " | Improvement must be at least 0"
                }
            }
            
            if (!(parseInt(configuration.patience) >= 1)) {
                if (error === "") {
                    error = error + "Patience must be at least 1"
                } else {
                    error = error + " | Patience must be at least 1"
                }
            }
            
            if (!(parseFloat(configuration.decay_rate) >= 0 && parseFloat(configuration.decay_rate) <= 1)) {
                if (error === "") {
                    error = error + "Decay rate must be 0-1"
                } else {
                    error = error + " | Decay rate must be 0-1"
                }
            }
            
            if (!(parseInt(configuration.decay_steps) >= 1)) {
                if (error === "") {
                    error = error + "Decay steps must be at least 1"
                } else {
                    error = error + " | Decay steps must be at least 1"
                }
            }

            if (!(parseFloat(configuration.initial_lr) > 0 && parseFloat(configuration.initial_lr) < 1)) {
                if (error === "") {
                    error = error + " | Initial learning rate must be 0-1"
                } else {
                    error = error + " | Initial learning rate must be 0-1"
                }
            }

            setMessage(error)
            displayMessageInterval()
            setDisabledCreate(false)
        }
    }

    // Predicts label for uploaded image
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

            // Creates POST request to Flask server containing the uploaded image in the request body
            const response = await predictAPI.post("", formData);
            
            // Sets predicted label to local state variable
            setPrediction(response.data)
        } catch (err) {}
    }

    // Updates workspace in MongoDB
    const updateWorkspace = async () => {
        const updatedEvaluation = {
            testAcc: evaluation.testAcc,
            testLoss: evaluation.testLoss,
            testPrecision: evaluation.testPrecision,
            testRecall: evaluation.testRecall,
            trainAcc: evaluation.trainAcc,
            trainLoss: evaluation.trainLoss,
            validationAcc: evaluation.validationAcc,
            validationLoss: evaluation.validationLoss,
            trainPrecision: evaluation.trainPrecision,
            trainRecall: evaluation.trainRecall,
            validationPrecision: evaluation.validationPrecision,
            validationRecall: evaluation.validationRecall,
            trainEpochs: evaluation.trainEpochs[evaluation.trainEpochs.length-1],
            trainTime: trainTime
        }

        if (image) {
            // Uploads new thumbnail image for workspace
            const formImage = new FormData();
            formImage.append('image', image);
            
            try {
                const tempPicture = picture
                const imageResponse = await imageAPI.post("/upload", formImage);

                // Creates PUT request to ExpressJS server to update document in MongoDB
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
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
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
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
        }

        setUpdated(new Date().toISOString())
        setChangedSettings(false)
    }

    // Deletes workspace in both MongoDB and the Flask server
    const deleteWorkspace = async () => {
        try {
            const formData = new FormData();
            formData.append('id', workspace._id);

            await itemsAPI.delete(`/${workspaceID}`)
            await filesAPI.post(`/remove-workspace`, formData)

            removeOpenItems(workspaceID)
            history.replace("/home")
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
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
                        {/* Checks if creator is viewing workspace */}
                        {(workspace.self || type === "create") &&
                            <>
                                {/* Set the thumbnail picture */}
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
                                {/* Edit the visibility of the workspace */}
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
                            {type !== "create" &&
                                <>
                                    <ThumbUpIcon className={`item-icon ${upvoted ? "blue2" : "white"}`} onClick={() => {updateUpvote()}} />
                                    <p className={upvoted ? "blue2" : "white"}>{upvotes}</p>
                                </>
                            }
                            {!workspace.self && type !== "create" && <BookmarkIcon className={`item-icon ${bookmarked ? "blue2" : "white"}`} onClick={() => {updateBookmark()}} />}
                            {/* Set the visibility of the workspace */}
                            {(workspace.self || type !== "create") && 
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
                            {(type === "create" || workspace.self) &&
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
                                </>
                            }
                            {/* Download the trained model */}
                            {type === "view" &&
                                <a href={`http://127.0.0.1:5000/models/${workspaceID}/${workspaceID}-model.zip`} download>
                                    <DownloadIcon className="workspace-download-icon" />
                                </a>
                            }
                        </div>
                        <div className="create-workspace-uploaded-dataset">
                            {!(type === "create" || workspace.self) &&
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
                                                onClick={() => {
                                                    updateWorkspace()
                                                    setMessage("Workspace saved")
                                                    displayMessageInterval()
                                                }}>Save Workspace</button>
                                        <button className="text-button item-delete"
                                                onClick={() => {deleteWorkspace()}}>Delete</button>
                                    </>
                                }
                            </>
                        }
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
                                                    disabled={disabledCreate}
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
                                                                    {/* Lists all layers than can be added to the model */}
                                                                    {i === model.length-1 && model[selectedNode].type !== "Output" &&
                                                                        <>
                                                                            {addNode && (workspace.self || type === "create") ?
                                                                                <div className="create-model-diagram-add">
                                                                                    <div onClick={() => {setAddNode(false)}}>
                                                                                        <RemoveIcon className="create-model-diagram-add-icon" />
                                                                                    </div>
                                                                                    <div className="create-model-diagram-add-options">
                                                                                        {(model[selectedNode].type === "Input" || model[selectedNode].type === "Conv2D" || model[selectedNode].type === "MaxPooling2D" ||
                                                                                            model[selectedNode].type === "AvgPooling2D" || model[selectedNode].type === "Dropout" || model[selectedNode].type === "BatchNormalisation") &&
                                                                                            <>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        // Copies current local state
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        // Adds 2D convolutional layer to model array in local state after currently selected node
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

                                                                                                    // Sets newly added layer to selected node
                                                                                                    setSelectedNode(state => state + 1)
                                                                                                    setAddNode(false)
                                                                                                    setChangedSettings(true)
                                                                                                }}>Conv2D</button>
                                                                                                <button onClick={() => {
                                                                                                    setModel(state => {
                                                                                                        const stateCopy = [...state]
                                                                                                    
                                                                                                        // Adds 2D max pooling layer to model array in local state after currently selected node
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
                                                                                                    
                                                                                                        // Adds 2D average pooling layer to model array in local state after currently selected node
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
                                                                                                    
                                                                                                        // Adds batch normalisation layer to model array in local state after currently selected node
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
                                                                                                    
                                                                                                        // Adds dropout layer to model array in local state after currently selected node
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
                                                                                                        setModel(state => {
                                                                                                            const stateCopy = [...state]
                                                                                                        
                                                                                                            // Adds flatten layer to model array in local state after currently selected node
                                                                                                            stateCopy.splice(selectedNode+1, 0, {
                                                                                                                type: "Flatten"
                                                                                                            })
                                                                                                        
                                                                                                            return stateCopy
                                                                                                        })

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
                                                                                                
                                                                                                    // Adds dense layer to model array in local state after currently selected node
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
                                                    {/* View properties of selected layer in model to be modified */}
                                                    <div className="create-model-selected">
                                                        <p>{model[selectedNode].type}</p>
                                                        <div className="create-model-selected-input">
                                                            {model[selectedNode].type !== "Flatten" &&
                                                                <>
                                                                    {model[selectedNode].type === "Dense" &&
                                                                        <div>
                                                                            <label>Units</label>
                                                                            <input value={model[selectedNode].units} 
                                                                                    // Disables the select tag only if a non-creator is viewing the workspce or if the workspace isn't being created
                                                                                    disabled={!(workspace.self || type === "create")}
                                                                                    // Detects a change of option selection
                                                                                    onChange={e => {setModel(state => {
                                                                                        // Stores the previous model array state
                                                                                                        const stateCopy = [...state]

                                                                                                        // Retrieves the object layer from the array and updates only the units attribute
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
                                                                                // Disables the select tag only if a non-creator is viewing the workspce or if the workspace isn't being created
                                                                                disabled={!(workspace.self || type === "create")}
                                                                                // Detects a change of option selection
                                                                                onChange={e => {setModel(state => {
                                                                                                    // Stores the previous model array state
                                                                                                    const stateCopy = [...state]
                                                                                                    
                                                                                                    // Retrieves the object layer from the array and updates only the activation attribute
                                                                                                    stateCopy[selectedNode] = {
                                                                                                        ...stateCopy[selectedNode],
                                                                                                        activation: e.target.value
                                                                                                    }
                                                                                                
                                                                                                    return stateCopy
                                                                                                })
                                                                                                // Undisables the save button to save the workspace in the MongoDB database
                                                                                                setChangedSettings(true)
                                                                                                // Updates model diagram
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
                                                                    {(model[selectedNode].type === "Conv2D" || model[selectedNode].type === "MaxPooling2D" || model[selectedNode].type === "AvgPooling2D") &&
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
                                                                    {(model[selectedNode].type === "MaxPooling2D" || model[selectedNode].type === "AvgPooling2D") &&
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
                                                    {/* Modify the training parameters of the model */}
                                                    <div className="create-model-configuration">
                                                        <div className="create-model-configuration-option">
                                                            <div>
                                                                <label>Epochs</label>
                                                                <input value={configuration.epochs}
                                                                        disabled={!(workspace.self || type === "create")} 
                                                                        // Updates the epoch attribute within the training parameters of the model within the local state
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
                                                            {/* Displays learning rate scheduler properties if selected */}
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
                                                            {/* Displays early stopping properties if selected */}
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
                                                {/* Display training time and test performance metrics */}
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
                                                    <div>
                                                        <p>Test Precision:</p>
                                                        <p>{evaluation.testPrecision.toFixed(3)}</p>
                                                    </div>
                                                    <div>
                                                        <p>Test Recall:</p>
                                                        <p>{evaluation.testRecall.toFixed(3)}</p>
                                                    </div>
                                                </div>
                                                {/* Display each performance metric with training and validation data in the charts component */}
                                                <Chart x={evaluation.trainEpochs} y1={evaluation.trainAcc} y2={evaluation.validationAcc} type={"Accuracy"} />
                                                <Chart x={evaluation.trainEpochs} y1={evaluation.trainLoss} y2={evaluation.validationLoss} type={"Loss"} />
                                                <Chart x={evaluation.trainEpochs} y1={evaluation.trainPrecision} y2={evaluation.validationPrecision} type={"Precision"} />
                                                <Chart x={evaluation.trainEpochs} y1={evaluation.trainRecall} y2={evaluation.validationRecall} type={"Recall"} />
                                            </>
                                        }
                                    </div>
                                : (stage === "train") ?
                                    // Display the time model has been training for
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
                                                {/* Upload image for prediction in input */}
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
                                                {/* Display prediction image and it's predicted label received from the Flask server */}
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
                                {displayMessage && <MessageCard message={message} />}
                            </div>
                            {uploadedDataset && 
                                <>
                                    {noData ?
                                        <p className="end-items">Cannot find dataset</p>
                                    :
                                        // Display images from the selected dataset
                                        <div className="create-workspace-data">
                                            <p className="create-workspace-data-header">Selected Dataset:</p>
                                            <p className="create-workspace-data-header-dataset">{uploadedDataset.title}</p>
                                            <div className="sidebar-divided" />
                                            <div className="create-workspace-data-images-list" key={refreshData}>
                                                {images.map((image, i) => {
                                                    if (i >= start && i < end && assignedLabels[i] !== "No label") {
                                                        return (
                                                            <div className="create-workspace-data-image" key={i}>
                                                                <img src={`http://127.0.0.1:5000/datasets/${uploadedDataset.imageDir}/images/${assignedLabels[i]}/${image}.jpg`}  />
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