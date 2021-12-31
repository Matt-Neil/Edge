import React, {useState, useEffect} from 'react'
import {Link, useHistory} from "react-router-dom"
import projectsAPI from '../API/projects'
import fileAPI from '../API/files'

const NewProject = () => {
    const [setupStage, setSetupStage] = useState(true);
    const [dataStage, setDataStage] = useState(false);
    const [codeStage, setCodeStage] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState(false);
    const [data, setData] = useState();
    const [importMethod, setImportMethod] = useState("")
    const [picture, setPicture] = useState();
    const [projectID, setProjectID] = useState("")
    const [code, setCode] = useState();
    const [experiment, setExperiment] = useState();
    const [trainingSplit, setTrainingSplit] = useState(80);
    const [validationSplit, setValidationSplit] = useState(20);
    const [projects, setProjects] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projects = await projectsAPI.get("/");

                projects.data.data.map((project) => {
                    setProjects(previous => [...previous, project.title]);
                })
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const next = () => {
        if (setupStage) {
            if ((title !== "" || description !== "") && !projects.includes(title)) {
                setSetupStage(false)
                setDataStage(true)
            }
        } else if (dataStage) {
            setDataStage(false)
            setCodeStage(true)
        } else {
            history.replace(`/project/`)
        }
    }

    const changeStageSetup = () => {
        setSetupStage(true)
        setDataStage(false)
        setCodeStage(false)
    }

    const changeStageData = () => {
        setSetupStage(false)
        setDataStage(true)
        setCodeStage(false)
    }

    const cancel = () => {
        history.goBack();
    }

    const create = () => {
        
    }

    return (
        <>
            {loaded &&
                <div className="new-project">
                    <div className="sidebar">
                        <h1>New Project</h1> 
                        <div className="new-project-header">
                            <p className="new-project-title">{title}</p> 
                        </div>
                        <button className={`${"sidebar-stage"} ${setupStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled={setupStage}
                                onClick={() => {changeStageSetup()}}>Setup</button>
                        <button className={`${"sidebar-stage"} ${dataStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled={dataStage || setupStage}
                                onClick={() => {changeStageData()}}>Data</button>
                        <button className={`${"sidebar-stage"} ${codeStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled={codeStage || setupStage || dataStage}>Code</button>
                    </div>
                    { setupStage &&
                        <div className="new-project-setup">
                            <div className="new-project-setup-information">
                                <input className="new-project-title"
                                        placeholder="Title"
                                        onChange={e => {setTitle(e.target.value)}}
                                        value={title} />
                                <textarea className="new-project-description"
                                            placeholder="Description"
                                            onChange={e => {setDescription(e.target.value)}}
                                            value={description} />
                                <div className="new-project-setup-visibility">
                                    <label className="new-project-setup-visibility-label">Public?</label>
                                    <input type="checkbox" 
                                            onClick={() => {setVisibility(previous => !previous)}}
                                            value={visibility} />
                                </div>
                                <div className="new-project-setup-visibility">
                                    <label className="new-project-setup-visibility-label">Picture</label>
                                    <input type="file" 
                                            name="picture" 
                                            onChange={e => {setPicture(e.target.files[0])}} />
                                </div>
                            </div>
                            <div className="new-project-nav">   
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-project-next"
                                        onClick={() => {next()}}>Next</button>
                            </div>
                        </div>
                    }
                    { dataStage &&
                        <>
                            <div className="new-project-import">
                                <div className="new-project-import-options">
                                    <p>Import Data</p>
                                    <button onClick={() => {setImportMethod("existing")}}>Existing Project</button>
                                    <button onClick={() => {setImportMethod("file")}}>Upload File</button>
                                </div>
                                {importMethod !== "" &&
                                    <>
                                        {importMethod === "file" ?
                                            <input type="file" 
                                                    name="data" 
                                                    onChange={e => {setData(e.target.files[0])}} />
                                        :
                                            <input className="new-project-import-projectid"
                                                    placeholder="Project ID"
                                                    onChange={e => {setProjectID(e.target.value)}}
                                                    value={projectID} />
                                        }
                                    </>
                                }
                            </div>
                            <div className="new-project-nav">  
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-project-next"
                                        onClick={() => {next()}}>Next</button>
                            </div>
                        </>
                    }
                    { codeStage &&
                        <div className="new-project-import">
                            <div className="new-project-import-options">
                                <p>Upload Code</p>
                                <input type="file" 
                                        name="code" 
                                        onChange={e => {setCode(e.target.files[0])}} />
                            </div>
                            <div className="new-project-nav">  
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-project-next"
                                        onClick={() => {create()}}>Create</button>
                            </div>
                        </div>
                    }
                </div>
            }   
        </>
    )
}

export default NewProject
