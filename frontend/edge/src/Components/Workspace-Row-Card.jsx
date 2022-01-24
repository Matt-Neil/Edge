import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenWorkspacesContext } from '../Contexts/openWorkspacesContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import workspacesAPI from '../API/workspaces'
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const WorkspaceRowCard = ({workspace, created, creator, currentUserID}) => {
    const [bookmarked, setBookmarked] = useState(workspace.bookmarked)
    const [upvoted, setUpvoted] = useState(workspace.upvoted)
    const [upvotes, setUpvotes] = useState(workspace.upvotes)
    const [visibility, setVisibility] = useState(workspace.visibility)
    const {addOpenWorkspaces} = useContext(OpenWorkspacesContext);
    const [date, setDate] = useState("");

    useEffect(() => {
        const updatedDate = new Date(workspace.updated);
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
        } else {
            setDate("Updated just now")
        }
    }, [])

    const addHeader = () => {
        if (workspace.creator === currentUserID) {
            addOpenWorkspaces(workspace._id, workspace.title)
        }
    }

    const updateUpvote = async () => {
        try {
            await workspacesAPI.put(`/upvote/${workspace._id}?state=${upvoted}`);

            if (upvoted) {
                setUpvotes(state => state-1)
            } else {
                setUpvotes(state => state+1)
            }

            setUpvoted(state => !state)
        } catch (err) {}
    }

    const updateBookmark = async () => {
        try {
            await workspacesAPI.put(`/bookmark/${workspace._id}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    const updateVisibility = async () => {
        try {
            await workspacesAPI.put(`/visibility/${workspace._id}?state=${visibility}`);

            setVisibility(state => !state)
        } catch (err) {}
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
                            {visibility ? 
                                <VisibilityIcon className="workspace-row-card-visibility" onClick={() => {updateVisibility()}} />
                            :
                                <VisibilityOffIcon className="workspace-row-card-visibility" onClick={() => {updateVisibility()}} />
                            }
                        </>
                    }
                    {!created && <p className="workspace-row-card-meta">{creator}</p>}
                    <p className="workspace-row-card-meta">{date}</p>
                </div>
            </div>
            <div>
                {!created && workspace.creator !== currentUserID && <BookmarkIcon className={`workspace-row-card-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />}
                <ThumbUpIcon className={`workspace-row-card-icon ${upvoted ? "blue" : "grey"}`} onClick={() => {updateUpvote()}} />
                <p className={`workspace-row-card-upvotes ${upvoted ? "blue" : "grey"}`}>{upvotes}</p>
            </div>
        </div>
    )
}

export default WorkspaceRowCard