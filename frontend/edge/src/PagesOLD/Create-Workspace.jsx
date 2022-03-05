import React, {useState, useEffect, useRef} from 'react'
import {useHistory} from "react-router-dom"
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import imageAPI from '../API/images'
import DataTable from '../Components/Data-Table'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const CreateWorkspace = ({currentUser}) => {
    const [setupStage, setSetupStage] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [dataTable, setDataTable] = useState();
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(30)
    const [maxRows, setMaxRows] = useState()
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [dataID, setDataID] = useState("")
    const [uploadedDataset, setUploadedDataset] = useState()
    const [workspaces, setWorkspaces] = useState([]);
    const [images, setImages] = useState([])
    const [assignedLabels, setAssignedLabels] = useState([])
    const [refreshData, setRefreshData] = useState()
    const [loaded, setLoaded] = useState(false);
    const [disableCreate, setDisabledCreate] = useState(false)
    const [displayPublic, setDisplayPublic] = useState(false)
    const [displayExist, setDisplayExist] = useState(false)
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

    const next = () => {
        if (setupStage && (title !== "" || description !== "") && !workspaces.includes(title)) {
            setSetupStage(false)
        }
    }

    const cancel = () => {
        history.goBack();
    }

    const remove = () => {
        setDataID("")
        setDataTable()
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

    const existingWorkspace = async () => {
        try {
            const checkPublic = await itemsAPI.get(`/check-public-dataset?datafile=${dataID}`)
    
            if (checkPublic.data.success && checkPublic.data.data.visibility) {
                if (checkPublic.data.data.dataType === "value") {
                    fetch(`http://127.0.0.1:5000/files/${dataID}.csv`)
                        .then(response => response.text())
                        .then(text => {
                            setDataTable(text)
                            setMaxRows(text.slice(text.indexOf('\n')+1).split('\n').length)
                            setUploadedDataset(checkPublic.data.data)
                        })
                } else {
                    fetch(`http://127.0.0.1:5000/files/${dataID}/labels.json`)
                        .then(response => response.json())
                        .then(images => {
                            images.map(image => {
                                setImages(state => [...state, image.filename])
                                setAssignedLabels(state => [...state, image.label])
                            })
                            setUploadedDataset(checkPublic.data.data)
                        })
                }
            } else if (checkPublic.data.success && !checkPublic.data.data.visibility) {
                displayPublicInterval()
            } else {
                displayExistInterval()
            }
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
        if ((uploadedDataset.dataType === "value" && page*30 < maxRows && maxRows > 30) ||
            (uploadedDataset.dataType === "image" && page*30 < images.length && images.length > 30)) {
            setPage(state => state+1)
            setStart((page)*30)
            setEnd((page+1)*30)
            setRefreshData(new Date().getTime())
        }
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
                experiments: [],
                picture: imageName,
                upvotes: [],
                comments: [],
                bookmarks: [],
                updated: new Date().toISOString(),
                visibility: visibility,
                type: "workspace"
            });

            history.push(`/workspace/${workspaceResponse.data.data}`)
        } catch (err) {}
    }
    
    return (
        <>
            {loaded &&
                <div className="sidebar-body">
                    <div className="create-sidebar">
                        <h1>Create Workspace</h1> 
                        <div className="create-item-header">
                            <p className="create-item-title">{title}</p> 
                        </div>
                        <button className={`${"create-sidebar-stage"} ${setupStage ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                disabled={setupStage}
                                onClick={() => {setSetupStage(true)}}>Setup</button>
                        <button className={`${"create-sidebar-stage"} ${!setupStage ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                disabled>Select Dataset</button>
                    </div>
                    <div className="inner-body">
                        <>
                            {setupStage &&
                                <div className="create-item-setup-information">
                                    <div className="create-item-nav">   
                                        <p className="create-item-data-information-label">Workspace Information</p>
                                        <button className="white-button create-item-cancel"
                                                onClick={() => {cancel()}}>Cancel</button>
                                        <button className="blue-button"
                                                onClick={() => {next()}}>Next</button>
                                    </div>
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
                                        <input type="file" 
                                                name="image" 
                                                onChange={e => {setImage(e.target.files[0])}} />
                                    </div>
                                    <div className="create-item-setup">
                                        <label className="create-item-setup-label">Public?</label>
                                        <input type="checkbox" 
                                                onChange={() => {setVisibility(previous => !previous)}}
                                                checked={visibility} />
                                    </div>
                                </div>
                            }
                            {!setupStage &&
                                <div className="create-item-import">
                                    <div className="create-item-import-top">
                                        <input className="create-workspace-import-existing"
                                                placeholder="Dataset ID"
                                                onChange={e => {setDataID(e.target.value)}}
                                                value={dataID} />
                                        <button className="blue-button"
                                                disabled={dataID === ""}
                                                onClick={() => {
                                                    existingWorkspace()
                                                    setRefreshData(new Date().getTime())
                                                }}>Import</button>
                                        <span />
                                        <button className="white-button create-item-cancel"
                                                onClick={() => {cancel()}}>Cancel</button>
                                        <button className="blue-button"
                                                disabled={disableCreate}
                                                onClick={() => {uploadImage()}}>Create</button>
                                    </div>
                                    {dataID !== "" && uploadedDataset !== undefined &&
                                        <div className="create-item-data">
                                            <div className="create-item-data-information">
                                                <p className="create-item-data-information-label">Data: {uploadedDataset.datafile}</p> 
                                                <button className="grey-button create-item-remove"
                                                        onClick={() => {remove()}}>Remove</button>
                                                <span />
                                                <div className="create-item-data-pagination">
                                                    <ArrowBackIosNewIcon className="create-item-data-pagination-icon" onClick={() => {previousPage()}} />
                                                    {uploadData.dataType ==="value" ?
                                                        <p>Page {page} / {Math.ceil(maxRows/30)}</p>
                                                    :
                                                        <p>Page {page} / {Math.ceil(images.length/30)}</p>
                                                    }
                                                    <ArrowForwardIosIcon className="create-item-data-pagination-icon" onClick={() => {nextPage()}} />
                                                </div>
                                            </div>
                                            {uploadedDataset.dataType === "value" ?
                                                <div className="create-item-data-table">
                                                    <DataTable dataTable={dataTable} start={start} end={end} key={refreshData} />
                                                </div>
                                            :
                                                <div className="create-item-data-images" key={refreshData}>
                                                    {images.map((image, i) => {
                                                        if (i >= start && i < end) {
                                                            return (
                                                                <div className="create-item-data-images-list" key={i}>
                                                                    <div>
                                                                        <img src={`http://127.0.0.1:5000/files/${uploadedDataset.datafile}/${image}.jpg`} />
                                                                        <p>{assignedLabels[i]}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    })}
                                                </div>
                                            }
                                        </div>
                                    }
                                    {displayPublic && <p className="create-item-data-public">Dataset not public</p>}
                                    {displayExist && <p className="create-item-data-public">Dataset does not exist</p>}
                                </div>
                            }
                        </>
                    </div>
                </div>
            }   
        </>
    )
}

export default CreateWorkspace
