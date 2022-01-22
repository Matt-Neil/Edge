import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const FeedWorkspaceCard = ({workspace, creator}) => {
    const [date, setDate] = useState("");

    useEffect(() => {
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
    }, [])

    return (
        <div className="feed-workspace-card">
            <img src="http://localhost:3000/Feed-Bar.png" />
            <div className="feed-workspace-body">
                <Link to={`/workspace/${workspace._id}`}>
                    <img src={`http://localhost:4000/images/${workspace.picture}`} />
                </Link>
                <Link to={`/workspace/${workspace._id}`} className="feed-workspace-heading">{workspace.title}</Link>
                <div>
                    <p className="feed-workspace-meta">{creator}</p>
                    <p className="feed-workspace-meta">{date}</p>
                    <BookmarkIcon className={`feed-workspace-icon ${workspace.bookmarked ? "blue" : "grey"}`} />
                    <ThumbUpIcon className={`feed-workspace-icon ${workspace.upvoted ? "blue" : "grey"}`} />
                    <p className={`feed-workspace-upvotes ${workspace.upvoted ? "blue" : "grey"}`}>{workspace.upvotes}</p>
                </div>
                <p className="feed-workspace-description">{workspace.description}</p>
            </div>
        </div>
    )
}

export default FeedWorkspaceCard