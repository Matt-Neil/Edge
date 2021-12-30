import React, {useContext} from 'react'
import { useLocation, Link, useHistory } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close';
import { OpenProjectsContext } from '../Contexts/openProjectsContext';

const ProjectHeader = ({project}) => {
    const projectID = useLocation().pathname.substring(9);
    const history = useHistory();
    const {removeOpenProjects} = useContext(OpenProjectsContext);

    const closeProject = () => {
        removeOpenProjects(project.id)
        
        if (projectID === project.id) {
            history.replace("/home")
        }
    }

    return (
        <div className="project-header">
            <Link to={`/project/${project.id}`} className="project-header-link">
                <p className={projectID === project.id ? "project-header-title-selected" : "project-header-title"}>{project.title}</p>
            </Link>
            <CloseIcon className="project-header-close" 
                        style={{ fontSize: 14, color: projectID === project.id ? "#2383F3" : "#474747", cursor: "pointer" }}
                        onClick={() => {closeProject()}} />
        </div>
    )
}

export default ProjectHeader