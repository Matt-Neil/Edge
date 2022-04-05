import React, {useState, useEffect, useRef, useContext} from 'react'
import {useHistory, useParams} from "react-router-dom"
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import globalAPI from '../API/global'
import imageAPI from '../API/images'
import fileAPI from '../API/files'
import { OpenItemsContext } from '../Contexts/openItemsContext';
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

const Dataset = ({currentUser, type}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [rgb, setRgb] = useState(false)
    const [bookmarked, setBookmarked] = useState()
    const [upvoted, setUpvoted] = useState()
    const [upvotes, setUpvotes] = useState()
    const [updated, setUpdated] = useState()
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
    const [appendedLabels, setAppendedLabels] = useState([])
    const [copyData, setCopyData] = useState(true)
    const [changedSettings, setChangedSettings] = useState(false)
    const [changedData, setChangedData] = useState(false)
    const [uploadedImages, setUploadedImages] = useState([])
    const [appendedImages, setAppendedImages] = useState([])
    const [imageFiles, setImageFiles] = useState([])
    const [assignedLabels, setAssignedLabels] = useState([])
    const [refreshData, setRefreshData] = useState()
    const [refreshLabels, setRefreshLabels] = useState()
    const [loaded, setLoaded] = useState(false);
    const [exist, setExist] = useState()
    const [addLabel, setAddLabel] = useState("")
    const [disableCreate, setDisabledCreate] = useState(false)
    const {addOpenItems, removeOpenItems} = useContext(OpenItemsContext);
    const colours = ["label-blue1", "label-red", "label-green1", "label-orange1", "label-pink", 
        "label-orange2", "label-blue2", "label-yellow1", "label-green2", "label-yellow2"]
    const datasetID = useParams().id;
    const copyInterval = useRef(0)
    const firstRender = useRef(true);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (type === "create") {
                    const dataset = await usersAPI.get("/created?type=dataset");
    
                    dataset.data.data.map((dataset) => {
                        setDataset(previous => [...previous, dataset.title]);
                    })

                    setExist(true)
                    setLoaded(true)
                } else {
                    const dataset = await itemsAPI.get(`/${datasetID}?type=dataset`);

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

                    fetch(`http://127.0.0.1:5000/files/${dataset.data.data.imageFile}/labels.json`)
                        .then(response => response.json())
                        .then(images => {
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

    useEffect(() => {
        if (!firstRender.current && loaded) {
            updateDataset()
        } else {
            firstRender.current = false
        }
    }, [labels])

    const copiedInterval = () => {
        clearInterval(copyInterval.current)
        navigator.clipboard.writeText(dataset.datafile);
        setCopyData(false);
        copyInterval.current = setInterval(() => {
            setCopyData(true);
        }, 800)
        return ()=> {clearInterval(copyInterval.current)};
    }

    const addFunctionKey = async (e) => {
        if (e.key === "Enter" && addLabel !== "" && !labels.includes(addLabel)) {
            setLabels(state => [...state, addLabel])
            setChangedSettings(true)
            setAddLabel("")
            
            const formData = new FormData();

            formData.append('id', dataset.imageFile)
            formData.append('label', addLabel)

            await fileAPI.post("/add-label", formData)
        }
    }

    const deleteLabel = async (index) => {
        try {
            assignedLabels.map((assignedLabel, j) => {
                if (assignedLabel === labels[index]) {
                    setAssignedLabels(state => {
                        const stateCopy = [...state]
                    
                        stateCopy[j] = "No label"
                    
                        return stateCopy
                    })
                }
            })

            const formData = new FormData();

            formData.append('id', dataset.imageFile)
            formData.append('label', labels[index])

            labels.splice(index, 1)

            await fileAPI.post("/delete-label", formData).then(() => {
                updateDataset()
            });

            setRefreshLabels(new Date().getTime())
            setRefreshData(new Date().getTime())
        } catch (err) {}
    }

    const updateLabel = async (e, index) => {
        try {
            const formData = new FormData();

            formData.append('id', dataset.imageFile)
            formData.append('filename', uploadedImages[index])
            formData.append('oldLabel', assignedLabels[index])
            formData.append('newLabel', e.target.value)
            formData.append('index', index)

            setAssignedLabels(state => {
                const stateCopy = [...state]
            
                stateCopy[index] = e.target.value
            
                return stateCopy
            })

            await fileAPI.post("/update-image", formData);

            setChangedData(true)
            setRefreshLabels(new Date().getTime())
        } catch (err) {}
    }

    const updateUpvote = async () => {
        try {
            await globalAPI.put(`/upvote/${datasetID}?state=${upvoted}`);

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
            await globalAPI.put(`/bookmark/${datasetID}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    const updateVisibility = async () => {
        try {
            await globalAPI.put(`/visibility/${datasetID}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    const previousPage = () => {
        if (page > 1) {
            setStart((page-2)*30)
            setEnd((page-1)*30)
            setPage(state => state-1)
            setRefreshData(new Date().getTime())
        }
    }
    
    const nextPage = () => {
        if (page*30 < uploadedImages.length && uploadedImages.length > 30) {
            setPage(state => state+1)
            setStart((page)*30)
            setEnd((page+1)*30)
            setRefreshData(new Date().getTime())
        }
    }

    const deleteImage = async (filename, index, label) => {
        uploadedImages.splice(index, 1)
        assignedLabels.splice(index, 1)

        if (type === "view") {
            const formData = new FormData();

            formData.append('id', dataset.imageFile)
            formData.append('index', index)
            formData.append('label', label)
            formData.append('filename', filename)

            updateDataset()

            try {
                await fileAPI.post("/delete-image", formData);
            } catch (err) {}
        }

        setRefreshData(new Date().getTime())
    }

    const addImages = async () => {
        for (let i = 0; i < imageFiles.length; i++) {
            setUploadedImages(state => [...state, imageFiles[i]])
        }

        setAssignedLabels(Array(imageFiles).fill("No label"))
        setPage(1)
        setRefreshData(new Date().getTime())
        setImageFiles([])
    }

    const replaceImages = async () => {
        if (type === "create") {
            for (let i = 0; i < imageFiles.length; i++) {
                setUploadedImages(state => [...state, imageFiles[i]])
            }
        } else {
            const formData = new FormData();

            formData.append('id', dataset.imageFile)

            for (let i = 0; i < imageFiles.length; i++) {
                formData.append('data[]', imageFiles[i]);
                formData.append('labels[]', assignedLabels[i]);
            }

            updateDataset()

            try {
                await fileAPI.post("/replace-image", formData);

                for (let i = 0; i < imageFiles.length; i++) {
                    setUploadedImages(state => [...state, i])
                }
            } catch (err) {}
        }
        setAssignedLabels(Array(imageFiles).fill("No label"))
        setPage(1)
        setRefreshData(new Date().getTime())
        setImageFiles([])
    }
    
    const appendImages = () => {
        for (let i = 0; i < imageFiles.length; i++) {
            setAppendedImages(state => [...state, imageFiles[i]])
        }

        setAppendedLabels(Array(imageFiles).fill("No label"))
        setImageFiles([])
    }

    const deleteAppended = (index) => {
        appendedImages.splice(index, 1)
        appendedLabels.splice(index, 1)
    }

    const uploadAppended = async () => {
        if (type === "create") {
            for (let i = 0; i < appendedImages.length; i++) {
                setUploadedImages(state => [...state, appendedImages[i]])
            }

            setAssignedLabels(state => [...state, ...appendedLabels])
        } else {
            let filenames = []

            const formData = new FormData();

            formData.append('id', dataset.imageFile)
            formData.append('last', uploadedImages.length-1)

            for (let i = 0; i < appendedImages.length; i++) {
                formData.append('data[]', appendedImages[i]);
                formData.append('labels[]', appendedLabels[i]);
                formData.append('filenames[]', parseInt(uploadedImages[uploadedImages.length-1])+i+1);
                filenames.push((parseInt(uploadedImages[uploadedImages.length-1])+i+1).toString())
            }

            setUploadedImages(state => [...state, ...filenames])
            setAssignedLabels(state => [...state, ...appendedLabels])
            updateDataset()

            try {
                await fileAPI.post("/append-image", formData)
            } catch (err) {}
        }

        setAppendedImages([])
        setAppendedLabels([])
        setRefreshData(new Date().getTime())
    }

    const uploadImage = async () => {
        setDisabledCreate(true)

        if (uploadedImages.length !== 0 && !assignedLabels.includes("No label") && title !== "" && description !== "") {
            const formData = new FormData();
            const id = new Date().toISOString();

            formData.append('id', id)

            for (let i = 0; i < uploadedImages.length; i++) {
                formData.append('data[]', uploadedImages[i]);
                formData.append('labels[]', assignedLabels[i]);
            }

            try {
                await fileAPI.post("/upload", formData);
            } catch (err) {}

            if (image) {
                const formImage = new FormData();
                formImage.append('image', image);
                
                try {
                    const imageResponse = await imageAPI.post("/upload-image", formImage);
    
                    uploadDataset(imageResponse.data.data, id)
                } catch (err) {}
            } else {
                uploadDataset("default.png", id)
            }
        } else {
            setDisabledCreate(false)
        }
    }

    const uploadDataset = async (imageName, id) => {
        try {
            const datasetResponse = await itemsAPI.post("/", {
                title: title,
                imageFile: id,
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

            history.push(`/dataset/${datasetResponse.data.data}`)
        } catch (err) {}
    }

    const updateDataset = async () => {
        if (image) {
            try {
                const formImage = new FormData();
                formImage.append('image', image);
    
                const tempPicture = picture
                const imageResponse = await imageAPI.post("/upload", formImage);

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
            } catch (err) {}
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
            } catch (err) {}
        }

        setUpdated(new Date().toISOString())
        setChangedData(false)
        setChangedSettings(false)
    }

    const deleteDataset = async () => {
        try {
            const formData = new formData()
            formData.append('id', dataset.imageFile)

            await itemsAPI.delete(`/${datasetID}`)
            await fileAPI.post("/remove-dataset", formData);

            removeOpenItems(datasetID)
            history.replace("/home")
        } catch (err) {}
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
                        {(dataset.self || type === "create") &&
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
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">RGB Images?</label>
                                    <input type="checkbox" 
                                            onChange={() => {
                                                setRgb(previous => !previous)
                                                setChangedSettings(true)
                                            }}
                                            checked={rgb} />
                                </div>
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Image Height</label>
                                    <input className="create-item-setup-dimension"
                                            disabled={!(dataset.self || type === "create")}
                                            value={height}
                                            onChange={e => {
                                                setHeight(e.target.value)
                                                setChangedSettings(true)
                                            }} />
                                </div>
                                <div className="create-item-setup">
                                    <label className="create-item-setup-label">Image Width</label>
                                    <input className="create-item-setup-dimension"
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
                            {dataset.self && type !== "create" && 
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
                        {type === "view" && !dataset.self &&
                            <>
                                <div className="sidebar-divided" />
                                <div className="sidebar-dataset-copy">
                                    <div>
                                        {copyData ? <p>Data ID</p> : <p>Copied</p>}
                                        <button disabled={!copyData} onClick={() => {copiedInterval()}}>
                                            <ContentCopyIcon className="dataset-copy-icon" />
                                        </button>
                                    </div>
                                    <a href={`http://127.0.0.1:5000/files/${dataset.imageFile}`} download>
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
                        {type === "view" &&
                            <>
                                {dataset.self &&
                                    <>
                                        <div className="sidebar-divided" />
                                        <button className="blue-button item-save"
                                                disabled={!changedSettings && !changedData}
                                                onClick={() => {updateDataset()}}>Save Dataset</button>
                                        <button className="text-button item-delete"
                                                onClick={() => {deleteDataset()}}>Delete</button>
                                    </>
                                }
                            </>
                        }
                    </div>
                    <div className="inner">
                        <div className="workspace-body">
                            <div className="workspace-inner">
                                {(type === "create" || dataset.self) ?
                                    <>
                                        <div className="view-items-top">
                                            {type === "create" ?
                                                <>
                                                    <h1>Create Dataset</h1>
                                                    <button className="blue-button"
                                                            disabled={disableCreate}
                                                            onClick={() => {uploadImage()}}>Create</button>
                                                </>
                                            :
                                                <>
                                                    <h1>Dataset</h1>
                                                    <div className="create-dataset-upload">
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
                                                        {(dataset.self || type === "create") && uploadedImages.length !== 0 && 
                                                            <>
                                                                <button className="white-button"
                                                                        disabled={imageFiles.length === 0}
                                                                        onClick={() => {
                                                                            setUploadedImages([])
                                                                            replaceImages()
                                                                            setChangedData(true)
                                                                        }}>Replace</button>
                                                                <button className="white-button"
                                                                        disabled={imageFiles.length === 0}
                                                                        onClick={() => {
                                                                            if (appendedImages.length !== 0) {
                                                                                setAppendedImages([])
                                                                                setAppendedLabels([])
                                                                            }
                                                                            appendImages()
                                                                            setChangedData(true)
                                                                        }}>Add</button>
                                                            </>
                                                        }
                                                        {uploadedImages.length !== 0 &&
                                                            <div className="create-dataset-pagination">
                                                                <ArrowBackIosNewIcon className="create-dataset-pagination-icon" onClick={() => {previousPage()}} />
                                                                <p>Page {page} / {Math.ceil(uploadedImages.length/30)}</p>
                                                                <ArrowForwardIosIcon className="create-dataset-pagination-icon" onClick={() => {nextPage()}} />
                                                            </div>
                                                        }
                                                    </div>
                                                </>
                                            }
                                        </div>
                                        {(type === "create" || dataset.self) && appendedImages.length !== 0 && 
                                            <div className="create-dataset-appended">
                                                <div className="create-dataset-appended-header">
                                                    <p>Uploaded Images</p>
                                                    <button className="text-button"
                                                            onClick={() => {
                                                        setAppendedImages([])
                                                        setAppendedLabels([])
                                                    }}>Discard</button>
                                                </div>
                                                <div className="create-dataset-appended-list">
                                                    {appendedImages.map((image, i) => {
                                                        return (
                                                            <div className="create-dataset-image" key={i}>
                                                                <img src={URL.createObjectURL(image)} />
                                                                <div>
                                                                    <select value={appendedLabels[i]}
                                                                            onChange={e => {setAppendedLabels(state => {
                                                                                        const stateCopy = [...state]
                                                                                    
                                                                                        stateCopy[i] = e.target.value
                                                                                    
                                                                                        return stateCopy
                                                                                    })}}>
                                                                        <option value="No label">No label</option>
                                                                        {labels.map((label, j) => 
                                                                            <option value={label} key={j}>{label}</option>
                                                                        )}
                                                                    </select>
                                                                    <div onClick={() => {deleteAppended(i)}}>
                                                                        <DeleteIcon className="create-dataset-image-delete" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="create-dataset-appended-footer">
                                                    <button className="blue-button" 
                                                            disabled={appendedLabels.includes("No label")}
                                                            onClick={() => {uploadAppended()}}>Upload</button>
                                                </div>
                                            </div>
                                        }
                                        <div className="create-dataset-images-list" key={refreshData}>
                                            {uploadedImages.map((image, i) => {
                                                if (i >= start && i < end) {
                                                    return (
                                                        <div className="create-dataset-image" key={i}>
                                                            <img src={type === "create" ? 
                                                                            URL.createObjectURL(image) 
                                                                        : assignedLabels[i] === "No label" ?
                                                                            `http://127.0.0.1:5000/files/${dataset.imageFile}/no-label/${image}.jpg`
                                                                        : assignedLabels[i] !== "No label" ?
                                                                            `http://127.0.0.1:5000/files/${dataset.imageFile}/images/${assignedLabels[i]}/${image}.jpg`
                                                                        :
                                                                            URL.createObjectURL(image) 
                                                                        } 
                                                            />
                                                            <div>
                                                                <select value={assignedLabels[i]}
                                                                        onChange={e => {updateLabel(e, i)}}>
                                                                    <option value="No label">No label</option>
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
                                            <p>Dataset</p>
                                        </div>
                                        <div className="create-dataset-images-list" key={refreshData}>
                                            {uploadedImages.map((image, i) => {
                                                if (i >= start && i < end) {
                                                    return (
                                                        <div className="create-dataset-image" key={i}>
                                                            <img src={`http://127.0.0.1:5000/files/${dataset.imageFile}/images/${assignedLabels[i]}/${image}.jpg`} />
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
                            </div>
                            <div className="create-workspace-data">
                                <p className="create-workspace-data-header">Labels:</p>
                                <div className="sidebar-divided" />
                                {(type === "create" || dataset.self) &&
                                    <input className="create-dataset-label-input"
                                            placeholder="Add Label"
                                            onChange={e => {setAddLabel(e.target.value)}}
                                            onKeyPress={addFunctionKey}
                                            value={addLabel} />
                                }
                                <div className="create-dataset-labels-list" key={refreshLabels}>
                                    {labels.map((label, i) => {
                                        return (
                                            <div className={`create-dataset-label ${colours[i % colours.length]}`} key={i}>
                                                <p>{label}</p>
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