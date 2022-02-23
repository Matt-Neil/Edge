import React, {useState, useEffect} from 'react'
import {useHistory} from "react-router-dom"
import itemsAPI from '../API/items'
import usersAPI from '../API/users'
import fileAPI from '../API/files'
import imageAPI from '../API/images'
import DataTable from '../Components/Data-Table'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';

const CreateDataset = ({currentUser}) => {
    const [setupStage, setSetupStage] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [dataFile, setDataFile] = useState();
    const [dataTable, setDataTable] = useState();
    const [dataAttributes, setDataAttributes] = useState([])
    const [targetAttribute, setTargetAttribute] = useState("")
    const [dataType, setDataType] = useState("")
    const [maxRows, setMaxRows] = useState()
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(30)
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [datasets, setDatasets] = useState([]);
    const [labels, setLabels] = useState([])
    const [assignedLabels, setAssignedLabels] = useState()
    const [addLabel, setAddLabel] = useState("")
    const [loaded, setLoaded] = useState(false);
    const [refreshData, setRefreshData] = useState()
    const [refreshLabels, setRefreshLabels] = useState()
    const [disableCreate, setDisabledCreate] = useState(false)
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const datasets = await usersAPI.get("/created?type=dataset");

                datasets.data.data.map((dataset) => {
                    setDatasets(state => [...state, dataset.title]);
                })
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (dataFile !== undefined) {
            if (dataType !== "image") {
                const file = dataFile;
                const reader = new FileReader();
    
                reader.onload = function(e) {
                    setDataTable(e.target.result);
                    setMaxRows(e.target.result.slice(e.target.result.indexOf('\n')+1).split('\n').length)
                    setDataAttributes(e.target.result.slice(0, e.target.result.indexOf('\n')).split(','))
                }
    
                reader.readAsText(file)
            }
        }
    }, [dataFile])

    const next = () => {
        if (title !== "" && description !== "" && dataType !== "" && !datasets.includes(title)) {
            setSetupStage(false)
        }
    }

    const cancel = () => {
        history.goBack();
    }

    const remove = () => {
        setDataFile()
        setDataTable()
        setPage(1)
        setStart(0)
        setEnd(30)
        setRefreshData(new Date().getTime())
    }

    const uploadImage = async () => {
        setDisabledCreate(true)

        if (dataFile !== undefined && ((dataType === "image" && !assignedLabels.includes("No label")) 
            || (dataType === "value" && targetAttribute !== ""))) {
            const formData = new FormData();
            const id = new Date().toISOString();

            formData.append('type', dataType)
            formData.append('id', id)

            if (dataType === "image") {
                for (let i = 0; i < dataFile.length; i++) {
                    formData.append('data[]', dataFile[i]);
                    formData.append('labels[]', assignedLabels[i]);
                }
            } else {
                formData.append('data', dataFile);
            }

            try {
                await fileAPI.post("/upload", formData);
            } catch (err) {}

            if (image) {
                const formImage = new FormData();
                formImage.append('image', image);
                
                try {
                    const imageResponse = await imageAPI.post("/upload", formImage);
    
                    uploadDataset(imageResponse.data.data, id)
                } catch (err) {}
            } else {
                uploadDataset("default.png", id)
            }
        } else {
            setDisabledCreate(false)
        }
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
        if ((dataType === "value" && page*30 < maxRows && maxRows > 30) ||
            (dataType === "image" && page*30 < dataFile.length && dataFile.length > 30)) {
            setPage(state => state+1)
            setStart((page)*30)
            setEnd((page+1)*30)
            setRefreshData(new Date().getTime())
        }
    }

    const uploadDataset = async (imageName, id) => {
        try {
            let newDataset = {
                title: title,
                datafile: id,
                dataType: dataType,
                creator: currentUser.id,
                description: description,
                comments: [],
                picture: imageName,
                upvotes: [],
                bookmarks: [],
                updated: new Date().toISOString(),
                visibility: visibility,
                type: "dataset"
            }

            if (dataType === "value") {
                newDataset.target = targetAttribute
            } else {
                newDataset.labels = labels
            }

            const datasetResponse = await itemsAPI.post("/", newDataset);

            history.push(`/dataset/${datasetResponse.data.data}`)
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <div className="sidebar-body">
                    <div className="create-sidebar">
                        <h1>Create Dataset</h1> 
                        <div className="create-item-header">
                            <p className="create-item-title">{title}</p> 
                        </div>
                        <button className={`${"create-sidebar-stage"} ${setupStage ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                disabled={setupStage}
                                onClick={() => {
                                    setSetupStage(true)
                                    setStart(0)
                                    setEnd(30)
                                }}>Setup</button>
                        <button className={`${"create-sidebar-stage"} ${!setupStage ? "create-sidebar-stage-selected" : "create-sidebar-stage-unselected"}`}
                                disabled>Upload Data</button>
                    </div>
                    <div className="inner-body">
                        <>
                            {setupStage &&
                                <div className="create-item-setup-information">
                                    <div className="create-item-nav">   
                                        <p className="create-item-filename">Dataset Information</p>
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
                                    <div className="create-item-setup">
                                        <label className="create-item-setup-label">Select data type</label>
                                        <select value={dataType} onChange={e => {
                                            setDataType(e.target.value)
                                            setDataFile()
                                        }}>
                                            <option disabled defaultValue value=""></option>
                                            <option value="value">Value Data</option>
                                            <option value="image">Image Data</option>
                                        </select>
                                    </div>
                                </div>
                            }
                            {!setupStage &&
                                <div className="create-item-import">
                                    <div className="create-item-import-top">
                                        {dataType === "image" ?
                                            <input type="file" 
                                                    name="data"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={e => {
                                                        setDataFile(e.target.files)
                                                        setAssignedLabels(Array(e.target.files.length).fill("No label"))
                                                        setPage(1)
                                                        setRefreshData(new Date().getTime())
                                                    }} />
                                        :
                                            <input type="file" 
                                                    name="data"
                                                    accept=".txt, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                    onChange={e => {
                                                        setDataFile(e.target.files[0])
                                                        setPage(1)
                                                        setRefreshData(new Date().getTime())
                                                    }} />
                                        }
                                        <span />
                                        <button className="white-button create-item-cancel"
                                                onClick={() => {cancel()}}>Cancel</button>
                                        <button className="blue-button"
                                                disabled={disableCreate}
                                                onClick={() => {uploadImage()}}>Create</button>
                                    </div>
                                    {dataType === "image" ?
                                        <div className="create-item-data">
                                            {dataFile !== undefined &&
                                                <>
                                                    <div className="create-dataset-labels-row">
                                                        <input className="create-dataset-label-input"
                                                                placeholder="Label name"
                                                                onChange={e => {setAddLabel(e.target.value)}}
                                                                value={addLabel} />
                                                        <button className="blue-button"
                                                                onClick={() => {
                                                                    addLabel !== "" && !labels.includes(addLabel) && setLabels(state => [...state, addLabel])
                                                                    setAddLabel("")
                                                                }}>Add</button>
                                                        <div className="create-dataset-labels-list" key={refreshLabels}>
                                                            {labels.length === 0 ?
                                                                <p>No labels created</p>
                                                            :
                                                                <>
                                                                    {labels.map((label, i) => {
                                                                        return (
                                                                            <div className="create-dataset-created-label" key={i}>
                                                                                <p>{label}</p>
                                                                                <div onClick={() => {
                                                                                    assignedLabels.map((assignedLabel, j) => {
                                                                                        if (assignedLabel === labels[i]) {
                                                                                            setAssignedLabels(state => {
                                                                                                const stateCopy = [...state]
                                                                                            
                                                                                                stateCopy[j] = "No label"
                                                                                            
                                                                                                return stateCopy
                                                                                            })
                                                                                        }
                                                                                    })
                                                                                    labels.splice(i, 1)
                                                                                    setRefreshLabels(new Date().getTime())
                                                                                }}>
                                                                                    <CloseIcon className="create-dataset-created-label-close" /> 
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="create-item-data-pagination">
                                                        <ArrowBackIosNewIcon className="create-item-data-pagination-icon" onClick={() => {previousPage()}} />
                                                        <p>Page {page} / {Math.ceil(dataFile.length/30)}</p>
                                                        <ArrowForwardIosIcon className="create-item-data-pagination-icon" onClick={() => {nextPage()}} />
                                                    </div>
                                                    <div className="create-item-data-images" key={refreshData}>
                                                        {[...dataFile].map((image, i) => {
                                                            if (i >= start && i < end) {
                                                                return (
                                                                    <div className="create-item-data-images-list" key={i}>
                                                                        <div>
                                                                            <img src={URL.createObjectURL(image)} />
                                                                            <select value={assignedLabels[i]}
                                                                                    onChange={e => {setAssignedLabels(state => {
                                                                                                const stateCopy = [...state]
                                                                                            
                                                                                                stateCopy[i] = e.target.value
                                                                                            
                                                                                                return stateCopy
                                                                                            })
                                                                                            setRefreshLabels(new Date().getTime())}}>
                                                                                <option value="No label">No label</option>
                                                                                {labels.map((label, j) => 
                                                                                    <option value={label} key={j}>{label}</option>
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                        })}
                                                    </div>
                                                </>
                                            }
                                        </div>
                                    :
                                        <>
                                            {dataFile !== undefined && dataTable !== undefined &&
                                                <div className="create-item-data">
                                                    <div className="create-item-data-information">
                                                        <p className="create-item-data-information-label">File: {dataFile.name}</p>
                                                        <button className="grey-button create-item-remove"
                                                                onClick={() => {remove()}}>Remove</button>
                                                        <p className="create-item-data-information-label">Target Attribute</p>
                                                        <select value={targetAttribute}
                                                                onChange={e => {setTargetAttribute(e.target.value)}}>
                                                            <option defaultValue value=""></option>
                                                            {dataAttributes.map((attribute, j) => 
                                                                <option value={attribute} key={j}>{attribute}</option>
                                                            )}
                                                        </select>
                                                        <span />
                                                        <div className="create-item-data-pagination">
                                                            <ArrowBackIosNewIcon className="create-item-data-pagination-icon" onClick={() => {previousPage()}} />
                                                            <p>Page {page} / {Math.ceil(maxRows/30)}</p>
                                                            <ArrowForwardIosIcon className="create-item-data-pagination-icon" onClick={() => {nextPage()}} />
                                                        </div>
                                                    </div>
                                                    <div className="create-item-data-table">
                                                        <DataTable dataTable={dataTable} start={start} end={end} key={refreshData} />
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    }
                                </div>
                            }
                        </>
                    </div>
                </div>
            }   
        </>
    )
}

export default CreateDataset
