import React, {useState, useEffect} from 'react'
import {useHistory} from "react-router-dom"
import workspaceAPI from '../API/workspaces'
import userAPI from '../API/users'
import fileAPI from '../API/files'
import imageAPI from '../API/images'
import ViewData from '../Components/View-Data'

const NewWorkspace = ({currentUser}) => {
    const [setupStage, setSetupStage] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [data, setData] = useState();
    const [displayData, setDisplayData] = useState();
    const [importMethod, setImportMethod] = useState("")
    const [image, setImage] = useState();
    const [dataID, setDataID] = useState("")
    const [workspaces, setWorkspaces] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [disableCreate, setDisabledCreate] = useState(false)
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspaces = await workspaceAPI.get("/");

                workspaces.data.data.map((workspace) => {
                    setWorkspaces(previous => [...previous, workspace.title]);
                })
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (data !== undefined) {
            setDataID("")

            const file = data;
            const reader = new FileReader();

            reader.onload = function(e) {
                setDisplayData(e.target.result);
            }

            reader.readAsText(file)
        }
    }, [data])

    const next = () => {
        if ((title !== "" || description !== "") && !workspaces.includes(title)) {
            setSetupStage(false)
        }
    }

    const cancel = () => {
        history.goBack();
    }

    const remove = () => {
        setDataID("")
        setData()
        setDisplayData()
    }

    const existingWorkspace = () => {
        setData(undefined)

        fetch(`http://127.0.0.1:5000/files/${dataID}.csv`)
            .then(response => response.text())
            .then(text => {setDisplayData(text)})
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
                data: "none",
                creator: currentUser.id,
                description: description,
                experiments: [],
                picture: imageName,
                upvotes: 0,
                visibility: visibility
            });

            uploadFile(workspaceResponse.data.data)
        } catch (err) {}
    }

    const uploadFile = async (workspaceID) => {
        if (importMethod === "file" && data !== undefined) {
            const formData = new FormData();

            formData.append('data', data);
            formData.append('id', workspaceID)

            try {
                await fileAPI.post("/upload", formData);
            } catch (err) {}
            
            try {
                await workspaceAPI.put(`/${workspaceID}`, {
                    data: `${workspaceID}-data`
                });

                history.push(`/workspace/${workspaceID}`)
            } catch (err) {}
        } else if (importMethod === "existing" && dataID !== "") {
            try {
                await workspaceAPI.put(`/${workspaceID}`, {
                    data: dataID
                });

                history.push(`/workspace/${workspaceID}`)
            } catch (err) {}
        }
    }

    return (
        <>
            {loaded &&
                <div className="new-workspace">
                    <div className="sidebar">
                        <h1>New Workspace</h1> 
                        <div className="new-workspace-header">
                            <p className="new-workspace-title">{title}</p> 
                        </div>
                        <button className={`${"sidebar-stage"} ${setupStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled={setupStage}
                                onClick={() => {setSetupStage(true)}}>Setup</button>
                        <button className={`${"sidebar-stage"} ${!setupStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled>Data</button>
                    </div>
                    { setupStage &&
                        <div className="new-workspace-setup">
                            <div className="new-workspace-setup-information">
                                <input className="new-workspace-title"
                                        placeholder="Title"
                                        onChange={e => {setTitle(e.target.value)}}
                                        value={title} />
                                <textarea className="new-workspace-description"
                                            placeholder="Description"
                                            onChange={e => {setDescription(e.target.value)}}
                                            value={description} />
                                <div className="new-workspace-setup-visibility">
                                    <label className="new-workspace-setup-visibility-label">Public?</label>
                                    <input type="checkbox" 
                                            onClick={() => {setVisibility(previous => !previous)}}
                                            value={visibility} />
                                </div>
                                <div className="new-workspace-setup-visibility">
                                    <label className="new-workspace-setup-visibility-label">Picture</label>
                                    <input type="file" 
                                            name="image" 
                                            onChange={e => {setImage(e.target.files[0])}} />
                                </div>
                            </div>
                            <div className="new-workspace-nav">   
                                <button className="new-workspace-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-workspace-next"
                                        onClick={() => {next()}}>Next</button>
                            </div>
                        </div>
                    }
                    { !setupStage &&
                        <>
                            <div className="new-workspace-import">
                                <div className="new-workspace-import-options">
                                    <p>Import Data</p>
                                    <button onClick={() => {setImportMethod("existing")}}>Existing Data</button>
                                    <button onClick={() => {setImportMethod("file")}}>Upload File</button>
                                </div>
                                <div className="new-workspace-import-method">
                                {importMethod !== "" &&
                                    <>
                                        {importMethod === "file" ?
                                            <input type="file" 
                                                    name="data"
                                                    key={Date.now()}
                                                    onChange={e => {setData(e.target.files[0])}} />
                                        :
                                            <>
                                                <input className="new-workspace-import-workspaceid"
                                                        placeholder="Data ID"
                                                        onChange={e => {setDataID(e.target.value)}}
                                                        value={dataID} />
                                                <button className="new-workspace-next"
                                                        disabled={dataID === ""}
                                                        onClick={() => {existingWorkspace()}}>Fetch</button>
                                            </>
                                        }
                                    </>
                                }
                                </div>
                                {(data !== undefined || dataID !== "") && displayData !== undefined &&
                                    <div className="new-workspace-data">
                                        <div className="new-workspace-data-information">
                                            {data !== undefined ?
                                                <p className="new-workspace-filename">File: {data.name}</p> 
                                                :
                                                <p className="new-workspace-filename">Data: {dataID}</p> 
                                            }
                                            <button className="new-workspace-cancel"
                                                    onClick={() => {remove()}}>Remove</button>
                                        </div>
                                        <div className="new-workspace-data-table">
                                            <ViewData displayData={displayData} />
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="new-workspace-nav">  
                                <button className="new-workspace-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-workspace-next"
                                        disabled={disableCreate}
                                        onClick={() => {uploadImage()}}>Create</button>
                            </div>
                        </>
                    }
                </div>
            }   
        </>
    )
}

export default NewWorkspace
