import React, {useState, useEffect} from 'react'
import {Link, useHistory} from "react-router-dom"
import ViewTable from "../Components/View-Data"
import EditTable from "../Components/Edit-Data"
import projectsAPI from '../API/projects'

const NewProject = () => {
    const [setupStage, setSetupStage] = useState(true);
    const [dataStage, setDataStage] = useState(false);
    const [importStage, setImportStage] = useState(true);
    const [processingStage, setProcessingStage] = useState(false);
    const [modelStage, setModelStage] = useState(false);
    const [evaluationStage, setEvaluationStage] = useState(false);
    const [deployStage, setDeployStage] = useState(false);
    const [title, setTitle] = useState("");
    const [normalised, setNormalised] = useState(false);
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
            if (title !== "" && !projects.includes(title)) {
                setSetupStage(false)
                setDataStage(true)
            }
        } else if (dataStage && processingStage) {
            setDataStage(false)
            setModelStage(true)
        } else if (modelStage) {
            setModelStage(false)
            setEvaluationStage(true)
        } else if (evaluationStage) {
            setEvaluationStage(false)
            setDeployStage(true)
        } else {
            history.replace(`/project/`)
        }
    }

    const changeStageSetup = () => {
        setSetupStage(true)
        setDataStage(false)
        setModelStage(false)
        setEvaluationStage(false)
        setDeployStage(false)
    }

    const changeStageData = () => {
        setSetupStage(false)
        setDataStage(true)
        setModelStage(false)
        setEvaluationStage(false)
        setDeployStage(false)
    }

    const changeStageModel = () => {
        setSetupStage(false)
        setDataStage(false)
        setModelStage(true)
        setEvaluationStage(false)
        setDeployStage(false)
    }

    const changeStageEvaluation = () => {
        setSetupStage(false)
        setDataStage(false)
        setModelStage(false)
        setEvaluationStage(true)
        setDeployStage(false)
    }

    const changeSubstageImport = () => {
        setImportStage(true)
        setProcessingStage(false)
    }

    const changeSubstageProcessing = () => {
        setImportStage(false)
        setProcessingStage(true)
    }

    const cancel = () => {
        
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
                        {dataStage && 
                            <p className={`${"sidebar-substage"} ${importStage && "sidebar-substage-selected"}`}
                                disabled={importStage}
                                onClick={() => {changeSubstageImport()}}>Import</p>
                        }
                        {/* DISABLE STAGE IF DATA NOT UPLOADED */}
                        {dataStage && 
                            <p className={`${"sidebar-substage"} ${processingStage && "sidebar-substage-selected"}`}
                                disabled={processingStage || importStage}
                                onClick={() => {changeSubstageProcessing()}}>Preprocessing</p>
                        }
                        <button className={`${"sidebar-stage"} ${modelStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled={modelStage || setupStage || dataStage}
                                onClick={() => {changeStageModel()}}>Modelling</button>
                        <button className={`${"sidebar-stage"} ${evaluationStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled={evaluationStage || setupStage || dataStage || modelStage}
                                onClick={() => {changeStageEvaluation()}}>Evaluation</button>
                        <button className={`${"sidebar-stage"} ${deployStage ? "sidebar-stage-selected" : "sidebar-stage-unselected"}`}
                                disabled>Deployment</button>
                    </div>
                    { setupStage &&
                        <div className="new-project-setup">
                            <input placeholder="Title"
                                    onChange={e => {setTitle(e.target.value)}}
                                    value={title} />
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
                            { importStage &&
                                <div className="new-project-import">
                                    <p>Import Data...</p>
                                    <div className="new-project-import-options">
                                        <button>Other Project</button>
                                        <button>Upload File</button>
                                        <button>API</button>
                                    </div>
                                </div>
                            }
                            { processingStage &&
                                <div className="new-project-processing">
                                    <div className="new-project-processing-top">
                                        <div className="new-project-processing-split">
                                            <p>Training (%)</p>
                                            <input value={trainingSplit}
                                                    onChange={e => {setTrainingSplit(e.target.value)}} />
                                        </div>
                                        <div className="new-project-processing-split">
                                            <p>Validation (%)</p>
                                            <input value={validationSplit}
                                                    onChange={e => {setValidationSplit(e.target.value)}} />
                                        </div>
                                        <button onClick={() => {setNormalised(value => !value)}}>
                                            {normalised ? "Denormalise" : "Normalise"} Data
                                        </button>
                                    </div>
                                    <div className="new-project-processing-table">
                                        <ViewTable />
                                    </div>
                                </div>
                            }
                            <div className="new-project-nav">  
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                { processingStage &&
                                    <button className="new-project-next"
                                            onClick={() => {next()}}>Next</button>
                                }
                            </div>
                        </>
                    }
                    { modelStage &&
                        <div className="new-project-data">
                            <p>Import Data...</p>
                            <div className="new-project-data-options">
                                <button>Other Project</button>
                                <button>Upload File</button>
                                <button>API</button>
                            </div>
                            <div className="new-project-nav">  
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-project-next"
                                        onClick={() => {next()}}>Next</button>
                            </div>
                        </div>
                    }
                    { evaluationStage &&
                        <div className="new-project-data">
                            <p>Import Data...</p>
                            <div className="new-project-data-options">
                                <button>Other Project</button>
                                <button>Upload File</button>
                                <button>API</button>
                            </div>
                            <div className="new-project-nav">  
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-project-next"
                                        onClick={() => {next()}}>Next</button>
                            </div>
                        </div>
                    }
                    { deployStage &&
                        <div className="new-project-data">
                            <p>Import Data...</p>
                            <div className="new-project-data-options">
                                <button>Other Project</button>
                                <button>Upload File</button>
                                <button>API</button>
                            </div>
                            <div className="new-project-nav">  
                                <button className="new-project-cancel"
                                        onClick={() => {cancel()}}>Cancel</button>
                                <button className="new-project-next"
                                        onClick={() => {next()}}>Next</button>
                            </div>
                        </div>
                    }
                </div>
            }   
        </>
    )
}

export default NewProject
