import React, {useState, useEffect} from 'react'
import {useHistory} from "react-router-dom"
import datasetsAPI from '../API/datasets'
import usersAPI from '../API/users'
import fileAPI from '../API/files'
import imageAPI from '../API/images'
import ViewData from '../Components/View-Data'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const NewDataset = ({currentUser}) => {
    const [setupStage, setSetupStage] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [dataFile, setDataFile] = useState();
    const [dataTable, setDataTable] = useState();
    const [maxRows, setMaxRows] = useState()
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(30)
    const [page, setPage] = useState(1)
    const [image, setImage] = useState();
    const [datasets, setDatasets] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [disableCreate, setDisabledCreate] = useState(false)
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const datasets = await usersAPI.get("/created-datasets");

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
            const file = dataFile;
            const reader = new FileReader();

            reader.onload = function(e) {
                setDataTable(e.target.result);
                setMaxRows(e.target.result.slice(e.target.result.indexOf('\n')+1).split('\n').length)
            }

            reader.readAsText(file)
        }
    }, [dataFile])

    const next = () => {
        if ((title !== "" || description !== "") && !datasets.includes(title)) {
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
    }

    const uploadImage = async () => {
        setDisabledCreate(true)

        if (dataFile !== undefined) {
            const formData = new FormData();
            const id = new Date().toISOString();

            formData.append('data', dataFile);
            formData.append('id', id)

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

    const uploadDataset = async (imageName, id) => {
        try {
            const datasetResponse = await datasetsAPI.post("/", {
                title: title,
                data: id,
                creator: currentUser.id,
                description: description,
                comments: [],
                picture: imageName,
                upvotes: [],
                bookmarks: [],
                updated: new Date().toISOString(),
                visibility: visibility
            });

            history.push(`/dataset/${datasetResponse.data.data}`)
        } catch (err) {}
    }

    return (
        <>
            {loaded &&
                <div className="sidebar-body">
                    <div className="new-sidebar">
                        <h1>New Dataset</h1> 
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
                                            <p className="new-item-filename">Dataset Information</p>
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
                                            <input type="file" 
                                                    name="data"
                                                    onChange={e => {setDataFile(e.target.files[0])}} />
                                            <span />
                                            <button className="white-button new-item-cancel"
                                                    onClick={() => {cancel()}}>Cancel</button>
                                            <button className="blue-button"
                                                    disabled={disableCreate}
                                                    onClick={() => {uploadImage()}}>Create</button>
                                        </div>
                                        {dataFile !== undefined && dataTable !== undefined &&
                                            <div className="new-item-data">
                                                <div className="new-item-data-information">
                                                    <p className="new-item-filename">File: {dataFile.name}</p>
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

export default NewDataset
