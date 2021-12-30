import React, {useState, useEffect} from 'react'
import {Link, useParams} from "react-router-dom"
import projectsAPI from '../API/projects'
import ViewTable from "../Components/View-Data"
import EditTable from "../Components/Edit-Data"
import ViewModel from "../Components/View-Model"
import EditModel from "../Components/Edit-Model"
import ProjectCard from "../Components/Project-Card"
import EditIcon from '@mui/icons-material/Edit'

const Project = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false);
    const [project, setProject] = useState();
    const [displayData, setDisplayData] = useState(true);
    const [displayModel, setDisplayModel] = useState(false);
    const [displayExperiment, setDisplayExperiment] = useState(false);
    const [editData, setEditData] = useState(false);
    const [editModel, setEditModel] = useState(false);
    const [data, setData] = useState("")
    const projectID = useParams().id;

    // useEffect(() => {
    //     fetch('http://127.0.0.1:5000/files/training_data.txt')
    //         .then(response => response.text())
    //         .then(text => {setData(text)})
    // }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const project = await projectsAPI.get(`/${projectID}`);

                setProject(project.data.data)
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const displayDataPage = () => {
        setDisplayData(true)
        setDisplayModel(false)
        setDisplayExperiment(false)
    }

    const displayModelPage = () => {
        setDisplayData(false)
        setDisplayModel(true)
        setDisplayExperiment(false)
    }

    const displayExperimentPage = () => {
        setDisplayData(false)
        setDisplayModel(false)
        setDisplayExperiment(true)
    }

    const edit = () => {
        if (displayData) {
            setEditData(previous => !previous)
        } else {
            setEditModel(previous => !previous)
        }
    }

    return (
        <>
            <div className="project">
                <div className="sidebar">
                    {loaded ?
                        <h1>{project.title}</h1>
                    :
                        <h1></h1>
                    }
                    <button className="project-redeploy">Retrain Model</button>
                    {/* IF CREATING API
                    <p>Current Deployment</p>
                    <select>
                        <option>Experiment 1</option>
                    </select>
                    <button className="project-redeploy">Deploy Experiment</button>
                    <p>Last Deployed: {loaded && <span>2 days</span>}</p> */}
                    <span />
                    <button className="project-delete">Delete Project</button>
                </div>
                <div className="project-body">
                    <div className="project-top">
                        <button className={displayData ? "project-option-selected" : "project-option"}
                                onClick={() => {displayDataPage()}}>Data Set</button>
                        <button className={displayModel ? "project-option-selected" : "project-option"}
                                onClick={() => {displayModelPage()}}>Model</button>
                        <button className={displayExperiment ? "project-option-selected" : "project-option"}
                                onClick={() => {displayExperimentPage()}}>Experiments</button>
                        <span />
                        {!displayExperiment && 
                            <EditIcon className="project-edit"
                                        onClick={() => {edit()}} />
                        }
                    </div>
                    {displayData &&
                        <div className="project-data">
                            <div className="project-data-table">
                                {editData ? <EditTable /> : <ViewTable />}
                            </div>
                        </div>
                    }
                    {displayModel &&
                        <div className="project-model">
                            {editModel ? <EditModel /> : <ViewModel />}
                        </div>
                    }
                    {displayExperiment &&
                        <div className="project-experiment">
                            <div className="project-experiment-list">
                            </div>
                            <div className="project-experiment-detail">
                            </div>
                            <ProjectCard project={{title: "asdasd", id: "sjkdajksjd"}} />
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default Project
