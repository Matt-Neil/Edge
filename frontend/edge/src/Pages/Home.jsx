import React, {useState, useEffect} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import ProjectCard from '../Components/Project-Card'
import projectsAPI from '../API/projects'

const Home = () => {
    const [projects, setProjects] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projects = await projectsAPI.get("/");

                setProjects(projects.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    return (
        <>
            {loaded &&
                <>  
                    <div className="home-top">
                        <h1>All Projects</h1>
                        <Link to="/new-project" className="home-new-project">New Project</Link>
                    </div>
                    <div className="home-projects">
                        {projects.map((project, i) => {
                            return <ProjectCard project={project} key={i} />
                        })}
                    </div>
                </>
            }
        </>
    )
}

export default Home