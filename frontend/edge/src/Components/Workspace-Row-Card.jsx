import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenWorkspacesContext } from '../Contexts/openWorkspacesContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const WorkspaceRowCard = ({workspace, created, creator, currentUserID}) => {
    const {addOpenWorkspaces} = useContext(OpenWorkspacesContext);
    const [date, setDate] = useState("");

    useEffect(() => {
        const updatedDate = new Date(workspace.updatedAt);
        const currentDate = new Date();

        if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 365) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 365)).toString()} years ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 30) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 30).toString())} months ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 1) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24))).toString()} days ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600) >= 1) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600))).toString()} hours ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60) >= 1) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60))).toString()} minutes ago`)
        }
    }, [])

    const addHeader = () => {
        if (workspace.creator === currentUserID) {
            addOpenWorkspaces(workspace._id, workspace.title)
        }
    }

    return (
        <div className="workspace-row-card" onClick={() => {addHeader()}}>
            <Link to={`/workspace/${workspace._id}`}>
                <img src={`http://localhost:4000/images/${workspace.picture}`} />
            </Link>
            <div className="workspace-row-card-information">
                <Link to={`/workspace/${workspace._id}`} className="workspace-row-card-heading">{workspace.title}</Link>
                <div>
                    {created && 
                        <>
                            {workspace.visibility ? 
                                <VisibilityIcon className="workspace-row-card-visibility" />
                            :
                                <VisibilityOffIcon className="workspace-row-card-visibility" />
                            }
                        </>
                    }
                    {!created && <p className="workspace-row-card-meta">{creator}</p>}
                    <p className="workspace-row-card-meta">{date}</p>
                </div>
            </div>
            <div>
                {!created && workspace.creator !== currentUserID && <BookmarkIcon className={`workspace-row-card-icon ${workspace.bookmarked ? "blue" : "grey"}`} />}
                <ThumbUpIcon className={`workspace-row-card-icon ${workspace.upvoted ? "blue" : "grey"}`} />
                <p className={`workspace-row-card-upvotes ${workspace.upvoted ? "blue" : "grey"}`}>{workspace.upvotes}</p>
            </div>
        </div>
    )
}

export default WorkspaceRowCard