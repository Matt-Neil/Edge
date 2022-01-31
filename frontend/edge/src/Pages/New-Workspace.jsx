import React, {useState, useEffect, useRef} from 'react'
import {useHistory} from "react-router-dom"
import workspaceAPI from '../API/workspaces'
import usersAPI from '../API/users'
import datasetsAPI from '../API/datasets'
import imageAPI from '../API/images'
import ViewData from '../Components/View-Data'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const NewWorkspace = ({currentUser}) => {
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
    const [uploadedDataset, setUploadedDataset] = useState({data: ""})
    const [workspaces, setWorkspaces] = useState([]);
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
                const workspaces = await usersAPI.get("/created-workspaces");

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
            const checkPublic = await datasetsAPI.get(`/check-public?data=${dataID}`)
    
            if (checkPublic.data.success && checkPublic.data.data.visibility) {
                fetch(`http://127.0.0.1:5000/files/${dataID}.csv`)
                    .then(response => response.text())
                    .then(text => {
                        setDataTable(text)
                        setMaxRows(text.slice(text.indexOf('\n')+1).split('\n').length)
                        setUploadedDataset(checkPublic.data.data)
                    })
            } else if (checkPublic.data.success && !checkPublic.data.data.visibility) {
                displayPublicInterval()
            } else {
                displayExistInterval()
            }
        } catch (err) {}
    }

    const previousPage = () => {
        if (page > 1) {
            setPage(state => state-1)
        }
        setStart((page-1)*30)
        setEnd(page*30)
    }

    const nextPage = () => {
        if (page*30 < maxRows && maxRows > 30) {
            setPage(state => state+1)
            setStart((page)*30)
            setEnd((page+1)*30)
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
            const workspaceResponse = await workspaceAPI.post("/", {
                title: title,
                data: uploadedDataset._id,
                creator: currentUser.id,
                description: description,
                experiments: [],
                picture: imageName,
                upvotes: [],
                comments: [],
                bookmarks: [],
                updated: new Date().toISOString(),
                visibility: visibility
            });

            history.push(`/workspace/${workspaceResponse.data.data}`)
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <div className="sidebar-body">
                    <div className="new-sidebar">
                        <h1>New Workspace</h1> 
                        <div className="new-item-header">
                            <p className="new-item-title">{title}</p> 
                        </div>
                        <button className={`${"new-sidebar-stage"} ${setupStage ? "new-sidebar-stage-selected" : "new-sidebar-stage-unselected"}`}
                                disabled={setupStage}
                                onClick={() => {setSetupStage(true)}}>Setup</button>
                        <button className={`${"new-sidebar-stage"} ${!setupStage ? "new-sidebar-stage-selected" : "new-sidebar-stage-unselected"}`}
                                disabled>Import Data</button>
                    </div>
                    <div className="inner-body">
                        <>
                            {setupStage &&
                                <>
                                    <div className="new-item-setup-information">
                                        <div className="new-item-nav">   
                                            <p className="new-item-filename">Workspace Information</p>
                                            <button className="white-button new-item-cancel"
                                                    onClick={() => {cancel()}}>Cancel</button>
                                            <button className="blue-button"
                                                    onClick={() => {next()}}>Next</button>
                                        </div>
                                        <input className="new-item-title"
                                                placeholder="Title"
                                                onChange={e => {setTitle(e.target.value)}}
                                                value={title} />
                                        <textarea className="new-item-description"
                                                    placeholder="Description"
                                                    onChange={e => {setDescription(e.target.value)}}
                                                    value={description} />
                                        <div className="new-item-setup-visibility">
                                            <label className="new-item-setup-visibility-label">Public?</label>
                                            <input type="checkbox" 
                                                    onChange={() => {setVisibility(previous => !previous)}}
                                                    checked={visibility} />
                                        </div>
                                        <div className="new-item-setup-visibility">
                                            <label className="new-item-setup-visibility-label">Picture</label>
                                            <input type="file" 
                                                    name="image" 
                                                    onChange={e => {setImage(e.target.files[0])}} />
                                        </div>
                                    </div>
                                </>
                            }
                            {!setupStage &&
                                <>
                                    <div className="new-item-import">
                                        <div className="new-item-import-top">
                                            <input className="new-workspace-import-existing"
                                                    placeholder="Data ID"
                                                    onChange={e => {setDataID(e.target.value)}}
                                                    value={dataID} />
                                            <button className="blue-button"
                                                    disabled={dataID === ""}
                                                    onClick={() => {existingWorkspace()}}>Import</button>
                                            <span />
                                            <button className="white-button new-item-cancel"
                                                    onClick={() => {cancel()}}>Cancel</button>
                                            <button className="blue-button"
                                                    disabled={disableCreate}
                                                    onClick={() => {uploadImage()}}>Create</button>
                                        </div>
                                        {dataID !== "" && dataTable !== undefined &&
                                            <div className="new-item-data">
                                                <div className="new-item-data-information">
                                                    <p className="new-item-filename">Data: {uploadedDataset.data}</p> 
                                                    <button className="grey-button new-item-remove"
                                                            onClick={() => {remove()}}>Remove</button>
                                                    <span />
                                                    <div className="new-item-data-table-pagination">
                                                        <ArrowBackIosNewIcon className="new-item-data-table-pagination-icon" onClick={() => {previousPage()}} />
                                                        <p>Page {page} / {Math.ceil(maxRows/30)}</p>
                                                        <ArrowForwardIosIcon className="new-item-data-table-pagination-icon" onClick={() => {nextPage()}} />
                                                    </div>
                                                </div>
                                                <div className="new-item-data-table">
                                                    <ViewData dataTable={dataTable} start={start} end={end} key={new Date().getTime()} />
                                                </div>
                                            </div>
                                        }
                                        {displayPublic && <p className="new-item-data-public">Dataset not public</p>}
                                        {displayExist && <p className="new-item-data-public">Dataset does not exist</p>}
                                    </div>
                                </>
                            }
                        </>
                    </div>
                </div>
            }   
        </>
    )
}

export default NewWorkspace
