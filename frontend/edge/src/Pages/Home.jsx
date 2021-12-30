import React, {useState, useEffect} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import ProjectCard from '../Components/Project-Card'
import projectsAPI from '../API/projects'
import fileAPI from '../API/files'

const Home = () => {
    const [projects, setProjects] = useState();
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState("")
    const [pictureFile, setPictureFile] = useState("");

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

    const uploadPicture = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('picture', pictureFile);

        try {
            const uploadResponse = await fileAPI.post("/upload", formData);
        } catch (err) {}
    }

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
                    <form method="POST" onSubmit={uploadPicture} encType="multipart/form-data">
                        <div>
                            <input className="pictureInput" type="file" name="picture" onChange={e => {setPictureFile(e.target.files[0])}} />
                        </div>
                        <div>
                            <input className="pictureUpload text4" type="submit" value="Upload image" />
                        </div>
                    </form>
                </>
            }
        </>
    )
}

export default Home