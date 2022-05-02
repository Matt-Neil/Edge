import React, {useState, useEffect, useRef, useContext} from 'react'
import {useHistory, useParams} from "react-router-dom"
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import globalAPI from '../API/global'
import imageAPI from '../API/images'
import fileAPI from '../API/files'
import { OpenItemsContext } from '../Contexts/openItemsContext';
import { MessageContext } from '../Contexts/messageContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import Shortcut from '../Components/Shortcut'
import MessageCard from '../Components/MessageCard'

const Dataset = ({currentUser, type}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [rgb, setRgb] = useState(false)
    const [bookmarked, setBookmarked] = useState()
    const [upvoted, setUpvoted] = useState()
    const [upvotes, setUpvotes] = useState()
    const [updated, setUpdated] = useState()
    const [appendMode, setAppendMode] = useState()
    const [picture, setPicture] = useState()
    const [width, setWidth] = useState()
    const [height, setHeight] = useState()
    const [date, setDate] = useState("")
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(30)
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [dataset, setDataset] = useState([]);
    const [labels, setLabels] = useState([])
    const [newLabels, setNewLabels] = useState([])
    const [copyData, setCopyData] = useState(true)
    const [changedSettings, setChangedSettings] = useState(false)
    const [changedData, setChangedData] = useState(false)
    const [uploadedImages, setUploadedImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const [imageFiles, setImageFiles] = useState([])
    const [assignedLabels, setAssignedLabels] = useState([])
    const [refreshData, setRefreshData] = useState()
    const [refreshLabels, setRefreshLabels] = useState()
    const [loaded, setLoaded] = useState(false);
    const [exist, setExist] = useState()
    const [addLabel, setAddLabel] = useState("")
    const [disabledCreate, setDisabledCreate] = useState(false)
    const [message, setMessage] = useState("")
    const {addOpenItems, removeOpenItems} = useContext(OpenItemsContext);
    const {displayMessage, displayMessageInterval} = useContext(MessageContext);
    const colours = ["label-blue1", "label-red", "label-green1", "label-orange1", "label-pink", 
        "label-orange2", "label-blue2", "label-yellow1", "label-green2", "label-yellow2"]
    const datasetID = useParams().id;
    const copyInterval = useRef(0)
    const firstRender = useRef(true);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Checks if the dataset is being created
                if (type === "create") {
                    // Gets all the signed-in user's created datasets
                    const dataset = await usersAPI.get("/created?type=dataset");
    
                    // Creates an array to store all created dataset's title
                    dataset.data.data.map((dataset) => {
                        setDataset(previous => [...previous, dataset.title]);
                    })

                    setExist(true)
                    setLoaded(true)
                } else {
                    // Gets the current dataset information from the database
                    const dataset = await itemsAPI.get(`/${datasetID}?type=dataset`);

                    // Adds dataset to open items in context provider
                    if (dataset.data.data.self) {
                        addOpenItems(dataset.data.data._id, dataset.data.data.title, dataset.data.data.type)
                    }

                    setDataset(dataset.data.data);
                    setUpdated(dataset.data.data.updated);
                    setBookmarked(dataset.data.data.bookmarked)
                    setUpvoted(dataset.data.data.upvoted)
                    setPicture(dataset.data.data.picture)
                    setUpvotes(dataset.data.data.upvotes)
                    setVisibility(dataset.data.data.visibility)
                    setTitle(dataset.data.data.title)
                    setDescription(dataset.data.data.description)
                    setLabels(dataset.data.data.labels)
                    setRgb(dataset.data.data.rgb)
                    setHeight(dataset.data.data.height)
                    setWidth(dataset.data.data.width)
                    
                    // Fetch the dataset's label.json file
                    fetch(`http://127.0.0.1:5000/datasets/${dataset.data.data.imageDir}/labels.json`)
                        // Convert file content to JSON
                        .then(response => response.json())
                        .then(images => {
                            // Loops through each object and sets the local state to store both image filenames and
                            // assigned labels in their respective arrays
                            images.map(image => {
                                setUploadedImages(state => [...state, image.filename])
                                setAssignedLabels(state => [...state, image.label])
                            })
                            setExist(true)
                            setLoaded(true)
                        }).catch(() => {
                            setExist(true)
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

    // Converts created dataset's last updated date to a more user readable format
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

    // Checks if the component has been rendered already when viewing a created dataset
    useEffect(() => {
        if (!firstRender.current && loaded && type !== "create") {
            updateDataset()
        } else {
            firstRender.current = false
        }
    }, [labels])

    // Creates a timer to display message after copying dataset ID
    const copiedInterval = () => {
        clearInterval(copyInterval.current)
        navigator.clipboard.writeText(dataset.datafile);
        setCopyData(false);
        copyInterval.current = setInterval(() => {
            setCopyData(true);
        }, 800)
        return ()=> {clearInterval(copyInterval.current)};
    }

    // Creates a new label
    const addLabelKey = async (e) => {
        if (e.key === "Enter" && addLabel !== "" && !labels.includes(addLabel)) {
            // Adds new label to array in the local state
            setLabels(state => [...state, addLabel])
            setChangedSettings(true)
            setAddLabel("")
            
            // If dataset is already created the new label is sent to Flask server to be added
            if (type !== "create") {
                const formData = new FormData();
    
                formData.append('id', dataset.imageDir)
                formData.append('datasetID', datasetID)
                formData.append('label', addLabel)
    
                await fileAPI.post("/add-label", formData)
            }
        }
    }

    // Deletes a label
    const deleteLabel = async (index) => {
        try {
            // Updates elements in array containing assigned labels to represent no label if currently assigned to the 
            // deleted label
            assignedLabels.map((assignedLabel, j) => {
                if (assignedLabel === labels[index]) {
                    setAssignedLabels(state => {
                        const stateCopy = [...state]
                    
                        stateCopy[j] = "No label"
                    
                        return stateCopy
                    })
                }
            })

            // If dataset is already created the deleted label is sent to Flask server to be removed
            if (type !== "create") {
                const formData = new FormData();

                formData.append('id', dataset.imageDir)
                formData.append('datasetID', datasetID)
                formData.append('label', labels[index])
    
                await fileAPI.post("/delete-label", formData).then(() => {
                    // Dataset is updated in mongoDB
                    updateDataset()
                });
            }

            // Removes label from array in local state
            labels.splice(index, 1)

            setRefreshLabels(new Date().getTime())
            setRefreshData(new Date().getTime())
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Updating image's assigned label
    const updateLabel = async (e, index) => {
        // Image's assigned label is updated in the local state
        setAssignedLabels(state => {
            const stateCopy = [...state]
        
            stateCopy[index] = e.target.value
        
            return stateCopy
        })

        // If dataset is already created the image's updated assigned label is sent to Flask server to be updated
        if (type !== "create") {
            try {
                const formData = new FormData();
    
                formData.append('id', dataset.imageDir)
                formData.append('datasetID', datasetID)
                formData.append('filename', uploadedImages[index])
                formData.append('oldLabel', assignedLabels[index])
                formData.append('newLabel', e.target.value)
                formData.append('index', index)
    
                await fileAPI.post("/update-image", formData);
    
                setChangedData(true)
                setRefreshLabels(new Date().getTime())
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
        }
    }

    // Updates whether the currently signed-in user has upvoted the dataset
    const updateUpvote = async () => {
        try {
            // Creates an PUT request to the associated API endpoint with the state of the upvote as a query parameter
            await globalAPI.put(`/upvote/${datasetID}?state=${upvoted}`);

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

    // Updates whether the currently signed-in user has bookmarked the dataset
    const updateBookmark = async () => {
        try {
            // Creates a PUT request to the associated API endpoint with the bookmark state as a query parameter
            await globalAPI.put(`/bookmark/${datasetID}?state=${bookmarked}`);
            
            // Updates the local state variable containing the bookmark state
            setBookmarked(state => !state)
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Updates whether the dataset is public or not
    const updateVisibility = async () => {
        try {
            // Creates a PUT request to he associated API endpoint to update the workspace or dataset visibility
            await globalAPI.put(`/visibility/${datasetID}`);

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
            setStart((page-2)*30)
            setEnd((page-1)*30)
            setPage(state => state-1)
            setRefreshData(new Date().getTime())
        }
    }
    
    // Displays the next page of images if applicable
    const nextPage = () => {
        if (page*30 < uploadedImages.length && uploadedImages.length > 30) {
            setPage(state => state+1)
            setStart((page)*30)
            setEnd((page+1)*30)
            setRefreshData(new Date().getTime())
        }
    }

    // Deletes uploaded image
    const deleteImage = async (filename, index, label) => {
        // Image and its assigned label are removed from local state
        uploadedImages.splice(index, 1)
        assignedLabels.splice(index, 1)

        // If dataset is already created the image is also deleted from the Flask server
        if (type === "view") {
            const formData = new FormData();

            formData.append('id', dataset.imageDir)
            formData.append('datasetID', datasetID)
            formData.append('index', index)
            formData.append('label', label)
            formData.append('filename', filename)

            // Dataset is updated in mongoDB
            updateDataset()

            try {
                await fileAPI.post("/delete-image", formData);

                setMessage("Image deleted")
                displayMessageInterval()
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
        }

        setRefreshData(new Date().getTime())
    }

    // Adds more images to the existing dataset
    const addImages = async () => {
        // Adds the new images to the local state
        for (let i = 0; i < imageFiles.length; i++) {
            setUploadedImages(state => [...state, imageFiles[i]])
        }

        // Adds "No label" assigned label for each new image
        setAssignedLabels(Array(imageFiles.length).fill("No label"))
        setPage(1)
        setRefreshData(new Date().getTime())
        setImageFiles([])
    }

    // Replacing all existing images in dataset
    const replaceImages = () => {
        if (type === "create") {
            // Sets current local state containing images to empty array
            setUploadedImages([])

            // Adds new images to local state
            for (let i = 0; i < imageFiles.length; i++) {
                setUploadedImages(state => [...state, imageFiles[i]])
            }
        } else {
            // Adds new images to a temporary variable in local state to be assigned a label
            for (let i = 0; i < imageFiles.length; i++) {
                setNewImages(state => [...state, imageFiles[i]])
            }
    
            setImageFiles([])
        }

        // Adds "No label" assigned label for each new image
        setNewLabels(Array(imageFiles.length).fill("No label"))
    }

    // Assign a label to each new image and upload to Flask server
    const uploadReplaced = async () => {
        setUploadedImages([])
        setAssignedLabels([])

        const formData = new FormData();

        formData.append('id', dataset.imageDir)
        formData.append('datasetID', datasetID)

        for (let i = 0; i < newImages.length; i++) {
            formData.append('data[]', newImages[i]);
            formData.append('labels[]', newLabels[i]);
        }

        // Updates dataset in MongoDB
        updateDataset()

        try {
            await fileAPI.post("/replace-image", formData);

            // Updates images and their assigned label to the local state
            for (let i = 0; i < newImages.length; i++) {
                setUploadedImages(state => [...state, i])
                setAssignedLabels(state => [...state, newLabels[i]])
            }

            setMessage("Images replaced")
            displayMessageInterval()
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
        
        setNewImages([])
        setNewLabels([])
        setPage(1)
        setRefreshData(new Date().getTime())
    }
    

    const appendImages = () => {
        if (type === "create") {
            // Adds new images to beginning of array in the local state
            for (let i = 0; i < imageFiles.length; i++) {
                setUploadedImages(state => [imageFiles[i], ...state])
            }

            // Adds "No label" assigned label for each new image to beginning of array in lcoal state
            setAssignedLabels(state => [...Array(imageFiles.length).fill("No label"), ...state])
        } else {
            // Adds new images to a temporary variable in local state to be assigned a label
            for (let i = 0; i < imageFiles.length; i++) {
                setNewImages(state => [...state, imageFiles[i]])
            }
    
            // Adds "No label" assigned label for each new image
            setNewLabels(Array(imageFiles.length).fill("No label"))
            setImageFiles([])
        }
    }

    const deleteNewImages = (index) => {
        // Delete images and their labels in the temporary local state variable
        newImages.splice(index, 1)
        newLabels.splice(index, 1)
    }

    // Assign a label to each new image and upload to Flask server
    const uploadAppended = async () => {
        let filenames = []

        const formData = new FormData();

        formData.append('id', dataset.imageDir)
        formData.append('datasetID', datasetID)
        formData.append('last', uploadedImages.length-1)

        for (let i = 0; i < newImages.length; i++) {
            formData.append('data[]', newImages[i]);
            formData.append('labels[]', newLabels[i]);
            formData.append('filenames[]', parseInt(uploadedImages[uploadedImages.length-1])+i+1);
            filenames.push((parseInt(uploadedImages[uploadedImages.length-1])+i+1).toString())
        }

        setUploadedImages(state => [...state, ...filenames])
        setAssignedLabels(state => [...state, ...newLabels])
        updateDataset()

        try {
            await fileAPI.post("/append-image", formData)

            setMessage("Images appended")
            displayMessageInterval()
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }

        setNewImages([])
        setNewLabels([])
        setRefreshData(new Date().getTime())
    }

    // Upload images and their assigned label to the Flask server on creation
    const uploadImage = async () => {
        setDisabledCreate(true)

        if (uploadedImages.length !== 0 && !assignedLabels.includes("No label") && title !== "" && description !== "") {
            const formData = new FormData();
            const id = new Date().toISOString();

            formData.append('id', id)
            formData.append('datasetID', datasetID)

            for (let i = 0; i < uploadedImages.length; i++) {
                formData.append('data[]', uploadedImages[i]);
                formData.append('labels[]', assignedLabels[i]);
            }

            try {
                await fileAPI.post("/upload", formData);
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }

            if (image) {
                const formImage = new FormData();
                formImage.append('image', image);
                
                try {
                    const imageResponse = await imageAPI.post("/upload-image", formImage);
    
                    uploadDataset(imageResponse.data.data, id)
                } catch (err) {
                    setMessage("Error occurred")
                    displayMessageInterval()
                }
            } else {
                uploadDataset("default.png", id)
            }
        } else {
            setDisabledCreate(false)
        }
    }

    // Upload dataset information to MongoDB
    const uploadDataset = async (imageName, id) => {
        try {
            const datasetResponse = await itemsAPI.post("/", {
                title: title,
                imageDir: id,
                creator: currentUser.id,
                description: description,
                picture: imageName,
                upvotes: [],
                bookmarks: [],
                labels: labels,
                rgb: rgb,
                width: width,
                height: height,
                updated: new Date().toISOString(),
                visibility: visibility,
                type: "dataset"
            });

            setMessage("Dataset created")
            displayMessageInterval()
            // Redirects to page to view created dataset
            history.push(`/dataset/${datasetResponse.data.data}`)
        } catch (err) {
            setMessage("Error occurred")
            displayMessageInterval()
        }
    }

    // Updates dataset in MongoDB
    const updateDataset = async () => {
        if (image) {
            try {
                // Updates thumbnail image for dataset in ExpressJS server
                const formImage = new FormData();
                formImage.append('image', image);
    
                const tempPicture = picture
                const imageResponse = await imageAPI.post("/upload", formImage);

                // Creates a PUT request to update dataset in MongoDB
                await itemsAPI.put(`/${datasetID}?type=dataset`, {
                    title: title,
                    description: description,
                    picture: imageResponse.data.data,
                    labels: labels,
                    rgb: rgb,
                    width: width,
                    height: height,
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
                await itemsAPI.put(`/${datasetID}?type=dataset`, {
                    title: title,
                    description: description,
                    picture: picture,
                    labels: labels,
                    rgb: rgb,
                    width: width,
                    height: height,
                    updated: new Date().toISOString()
                })
            } catch (err) {
                setMessage("Error occurred")
                displayMessageInterval()
            }
        }

        setUpdated(new Date().toISOString())
        setChangedData(false)
        setChangedSettings(false)
    }

    // Deletes dataset from both MongoDB and Flask server
    const deleteDataset = async () => {
        try {
            const formData = new formData()
            formData.append('id', dataset.imageDir)

            await itemsAPI.delete(`/${datasetID}`)
            await fileAPI.post("/remove-dataset", formData);

            removeOpenItems(datasetID)
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
                            <img src="http://localhost:3000/dataset.png"
                                    className={!(type === "view" && !dataset.self) ? "create-item-edit-image" : undefined} />
                            <input className={`create-item-title ${!(type === "view" && !dataset.self) && "create-item-edit-input"}`}
                                    placeholder="Title"
                                    onChange={e => {
                                        setTitle(e.target.value)
                                        setChangedSettings(true)
                                    }}
                                    disabled={!(dataset.self || type === "create")}
                                    value={title} />
                        </div>
                        <textarea className={`create-item-description ${!(type === "view" && !dataset.self) && "create-item-edit-textarea"}`}
                                    placeholder="Description"
                                    onChange={e => {
                                        setDescription(e.target.value)
                                        setChangedSettings(true)
                                    }}
                                    disabled={!(dataset.self || type === "create")}
                                    value={description} />
                        {/* Checks if creator is viewing dataset */}
                        {(dataset.self || type === "create") &&
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
                                {/* Edit the visibility of the dataset */}
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Public?</label>
                                    <input type="checkbox" 
                                            onChange={() => {
                                                setVisibility(previous => !previous)
                                                setChangedSettings(true)
                                            }}
                                            checked={visibility} />
                                </div>
                                {/* Set the colour mode of the images */}
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">RGB Images?</label>
                                    <input type="checkbox" 
                                            onChange={() => {
                                                setRgb(previous => !previous)
                                                setChangedSettings(true)
                                            }}
                                            checked={rgb} />
                                </div>
                                {/* Set the image height */}
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Image Height</label>
                                    <input className="create-item-setup-dimension"
                                            placeholder="Pixels"
                                            disabled={!(dataset.self || type === "create")}
                                            value={height}
                                            onChange={e => {
                                                setHeight(e.target.value)
                                                setChangedSettings(true)
                                            }} />
                                </div>
                                {/* Set the image width */}
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Image Width</label>
                                    <input className="create-item-setup-dimension"
                                            placeholder="Pixels"
                                            disabled={!(dataset.self || type === "create")}
                                            value={width}
                                            onChange={e => {
                                                setWidth(e.target.value)
                                                setChangedSettings(true)
                                            }} />
                                </div>
                            </>
                        }
                        {!dataset.self && type !== "create" && <p className="item-creator">{dataset.creatorName.name}</p>}
                        <div className="item-information">
                            {type !== "create" && <p className="item-date">{date}</p>}
                            <span />
                            {type !== "create" &&
                                <>
                                    <ThumbUpIcon className={`item-icon ${upvoted ? "blue2" : "white"}`} onClick={() => {updateUpvote()}} />
                                    <p className={upvoted ? "blue2" : "white"}>{upvotes}</p>
                                </>
                            }
                            {!dataset.self && type !== "create" && <BookmarkIcon className={`item-icon ${bookmarked ? "blue2" : "white"}`} onClick={() => {updateBookmark()}} />}
                            {/* Set the visibility of the dataset */}
                            {(dataset.self || type !== "create") && 
                                <>
                                    {visibility ? 
                                        <VisibilityIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                    :
                                        <VisibilityOffIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                    }
                                </>
                            }
                        </div>
                        {!dataset.self && type !== "create" &&
                            <>
                                <div className="sidebar-divided" />
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Image Height</label>
                                    <p className="dataset-dimension">{height}</p>
                                </div>
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Image Width</label>
                                    <p className="dataset-dimension">{width}</p>
                                </div>
                            </>
                        }
                        {/* Download dataset zip file */}
                        {type === "view" && !dataset.self &&
                            <>
                                <div className="sidebar-divided" />
                                <div className="sidebar-dataset-copy">
                                    <div>
                                        <p>{copyData ? "Dataset ID" : "Copied"}</p>
                                        <button disabled={!copyData} onClick={() => {copiedInterval()}}>
                                            <ContentCopyIcon className="dataset-copy-icon" />
                                        </button>
                                    </div>
                                    <a href={`http://127.0.0.1:5000/datasets/${dataset.imageDir}/${datasetID}-dataset.zip`} download>
                                        <DownloadIcon className="dataset-download-icon" />
                                    </a>
                                </div>
                            </>
                        }
                        {type === "view" && !dataset.self &&
                            <>
                                <div className="sidebar-divided" />
                                <Shortcut type={"related"} datasetID={datasetID} />
                            </>
                        }
                        {type === "view" && dataset.self &&
                            <>
                                <div className="sidebar-divided" />
                                <button className="blue-button item-save"
                                        disabled={!changedSettings && !changedData}
                                        onClick={() => {
                                            updateDataset()
                                            setMessage("Dataset saved")
                                            displayMessageInterval()
                                        }}>Save Dataset</button>
                                <button className="text-button item-delete"
                                        onClick={() => {deleteDataset()}}>Delete</button>
                            </>
                        }
                    </div>
                    <div className="inner">
                        <div className="workspace-body">
                            <div className="workspace-inner">
                                {(type === "create" || dataset.self) ?
                                    <>
                                        <div className="view-items-top">
                                            <h1>{type === "create" ? "Create Dataset" : "Dataset"}</h1>
                                            {type === "create" &&
                                                <div>
                                                    <span />
                                                    <button className="blue-button"
                                                            disabled={disabledCreate}
                                                            onClick={() => {uploadImage()}}>Create</button>
                                                </div>
                                            }
                                            <div className="create-dataset-upload">
                                                {/* Input for uploading images */}
                                                <input type="file" 
                                                        name="data"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={e => {setImageFiles(e.target.files)}} />
                                                {type === "create" && uploadedImages.length === 0 && 
                                                    <button className="white-button"
                                                            disabled={imageFiles.length === 0}
                                                            onClick={() => {
                                                                addImages()
                                                                setChangedData(true)
                                                            }}>Add</button>
                                                }
                                                {uploadedImages.length !== 0 && 
                                                    <>
                                                        <button className="white-button"
                                                                disabled={imageFiles.length === 0}
                                                                onClick={() => {
                                                                    if (newImages.length !== 0) {
                                                                        setNewImages([])
                                                                        setNewLabels([])
                                                                    }
                                                                    setAppendMode(false)
                                                                    replaceImages()
                                                                    setChangedData(true)
                                                                }}>Replace</button>
                                                        <button className="white-button"
                                                                disabled={imageFiles.length === 0}
                                                                onClick={() => {
                                                                    if (newImages.length !== 0) {
                                                                        setNewImages([])
                                                                        setNewLabels([])
                                                                    }
                                                                    setAppendMode(true)
                                                                    appendImages()
                                                                    setChangedData(true)
                                                                }}>Add</button>
                                                        <div className="create-dataset-pagination">
                                                            <ArrowBackIosNewIcon className="create-dataset-pagination-icon" onClick={() => {previousPage()}} />
                                                            <p>Page {page} / {Math.ceil(uploadedImages.length/30)}</p>
                                                            <ArrowForwardIosIcon className="create-dataset-pagination-icon" onClick={() => {nextPage()}} />
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                        </div>
                                        {/* JSX to display temporary images */}
                                        {(type === "create" || dataset.self) && newImages.length !== 0 && 
                                            <div className="create-dataset-appended">
                                                <div className="create-dataset-appended-header">
                                                    <p>Uploaded Images</p>
                                                    <button className="text-button"
                                                            onClick={() => {
                                                        setNewImages([])
                                                        setNewLabels([])
                                                    }}>Discard</button>
                                                </div>
                                                <div className="create-dataset-appended-list">
                                                    {newImages.map((image, i) => {
                                                        return (
                                                            <div className="create-dataset-image" key={i}>
                                                                <img src={URL.createObjectURL(image)} />
                                                                <div>
                                                                    <select value={newLabels[i]}
                                                                            onChange={e => {setNewLabels(state => {
                                                                                        const stateCopy = [...state]
                                                                                    
                                                                                        stateCopy[i] = e.target.value
                                                                                    
                                                                                        return stateCopy
                                                                                    })}}>
                                                                        <option value="No label">No label</option>
                                                                        {labels.map((label, j) => 
                                                                            <option value={label} key={j}>{label}</option>
                                                                        )}
                                                                    </select>
                                                                    <div onClick={() => {deleteNewImages(i)}}>
                                                                        <DeleteIcon className="create-dataset-image-delete" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="create-dataset-appended-footer">
                                                    <button className="blue-button" 
                                                            disabled={newLabels.includes("No label")}
                                                            onClick={() => {
                                                                if (appendMode) {
                                                                    uploadAppended()
                                                                } else {
                                                                    uploadReplaced()
                                                                }
                                                            }}>Upload</button>
                                                </div>
                                            </div>
                                        }
                                        <div className="create-dataset-images-list" key={refreshData}>
                                            {/* Displays all uploaded images and their assigned label to dataset */}
                                            {uploadedImages.map((image, i) => {
                                                if (i >= start && i < end) {
                                                    return (
                                                        <div className="create-dataset-image" key={i}>
                                                            <img src={type === "create" ? 
                                                                            URL.createObjectURL(image) 
                                                                        : assignedLabels[i] === "No label" ?
                                                                            `http://127.0.0.1:5000/datasets/${dataset.imageDir}/no-label/${image}.jpg`
                                                                        : assignedLabels[i] !== "No label" ?
                                                                            `http://127.0.0.1:5000/datasets/${dataset.imageDir}/images/${assignedLabels[i]}/${image}.jpg`
                                                                        :
                                                                            URL.createObjectURL(image) 
                                                                        } 
                                                            />
                                                            <div>
                                                                {/* Change the assigned label */}
                                                                <select value={assignedLabels[i]}
                                                                        onChange={e => {updateLabel(e, i)}}>
                                                                    <option value="No label">No label</option>
                                                                    {/* Map labels as select tag options */}
                                                                    {labels.map((label, j) => 
                                                                        <option value={label} key={j}>{label}</option>
                                                                    )}
                                                                </select>
                                                                <div onClick={() => {deleteImage(image, i, assignedLabels[i])}}>
                                                                    <DeleteIcon className="create-dataset-image-delete" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    </>
                                :   
                                    <>
                                        <div className="view-items-top">
                                            <h1>Dataset</h1>
                                        </div>
                                        <div className="create-dataset-images-list" key={refreshData}>
                                            {/* Displays images and their assigned label */}
                                            {uploadedImages.map((image, i) => {
                                                if (i >= start && i < end) {
                                                    return (
                                                        <div className="create-dataset-image" key={i}>
                                                            <img src={`http://127.0.0.1:5000/datasets/${dataset.imageDir}/images/${assignedLabels[i]}/${image}.jpg`} />
                                                            <div>
                                                                <p>{assignedLabels[i]}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    </>
                                }
                                {displayMessage && <MessageCard message={message} />}
                            </div>
                            <div className="create-workspace-data">
                                <p className="create-workspace-data-header">Labels:</p>
                                <div className="sidebar-divided" />
                                {/* Add new label input */}
                                {(type === "create" || dataset.self) &&
                                    <input className="create-dataset-label-input"
                                            placeholder="Add Label"
                                            onChange={e => {setAddLabel(e.target.value)}}
                                            onKeyPress={addLabelKey}
                                            value={addLabel} />
                                }
                                {/* Display created labels */}
                                <div className="create-dataset-labels-list" key={refreshLabels}>
                                    {labels.map((label, i) => {
                                        return (
                                            <div className={`create-dataset-label ${colours[i % colours.length]}`} key={i}>
                                                <p>{label}</p>
                                                {/* Delete label */}
                                                {(type === "create" || dataset.self) &&
                                                    <div onClick={() => {deleteLabel(i)}}>
                                                        <CloseIcon className="create-dataset-label-icon" /> 
                                                    </div>
                                                }
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            : loaded && !exist &&
                <div className="inner-body">  
                    <p className="item-exist">Cannot find dataset</p>
                </div>
            }
        </>
    )
}

export default Dataset