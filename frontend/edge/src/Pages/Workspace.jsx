import React, {useState, useEffect} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import workspacesAPI from '../API/workspaces'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const Workspace = () => {
    const [loaded, setLoaded] = useState(false)
    const [workspace, setWorkspace] = useState()
    const [displayData, setDisplayData] = useState("data")
    const [date, setDate] = useState("");
    const workspaceID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspace = await workspacesAPI.get(`/${workspaceID}`);

                setWorkspace(workspace.data.data);
                setLoaded(true)
            } catch (err) {}
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (workspace) {
            const updatedDate = new Date(workspace.updatedAt);
            const currentDate = new Date();
    
            if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 365) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 365)).toString()} year(s) ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 30) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 30).toString())} month(s) ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 1) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24))).toString()} day(s) ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600) >= 1) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600))).toString()} hour(s) ago`)
            } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60) >= 1) {
                setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60))).toString()} minute(s) ago`)
            }
        }
    }, [workspace])

    return (
        <>
            {loaded &&
                <>
                    {workspace.self ?
                        <div className="sidebar-body"> 
                            <div className="sidebar">
                                <h1>hi</h1>
                            </div>
                            <div className="inner-body">
                                <p>bye</p>
                            </div>
                        </div>
                    :
                        <div className="width-body">  
                            <div className="other-workspace-body">
                                <div className="other-workspace-top">
                                    <img src={`http://localhost:4000/images/${workspace.picture}`} />
                                    <h1>{workspace.title}</h1>
                                    <div>
                                        <p className="other-workspace-meta">{workspace.creatorName.name}</p>
                                        <p className="other-workspace-meta">{date}</p>
                                        <BookmarkIcon className={`other-workspace-icon ${workspace.bookmarked ? "blue" : "grey"}`} />
                                        <ThumbUpIcon className={`other-workspace-icon ${workspace.upvoted ? "blue" : "grey"}`} />
                                        <p className={`other-workspace-upvotes ${workspace.upvoted ? "blue" : "grey"}`}>{workspace.upvotes}</p>
                                    </div>
                                    <p className="other-workspace-description">{workspace.description}</p>
                                    <select className="other-workspace-select" onChange={e => {setDisplayData(e.target.value)}}>
                                        <option value="data">Data</option>
                                        <option value="model">Model</option>
                                    </select>
                                </div>
                                <div className="other-workspace-bottom">
                                    {displayData === "data" ? 
                                        <p>data</p>
                                    :
                                        <p>model</p>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                </>
            }
        </>
    )
}

export default Workspace
