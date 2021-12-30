import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenProjectsContext } from '../Contexts/openProjectsContext';

const ProjectCard = ({project}) => {
    const {addOpenProjects} = useContext(OpenProjectsContext);

    return (
        <Link to={`/project/${project._id}`} className="project-card" onClick={() => {addOpenProjects(project._id, project.title)}}>
            {project.title}
        </Link>
    )
}

export default ProjectCard
