import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import workspacesAPI from '../API/workspaces'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const FeedWorkspaceCard = ({workspace, creator}) => {
    const [bookmarked, setBookmarked] = useState(workspace.bookmarked)
    const [upvoted, setUpvoted] = useState(workspace.upvoted)
    const [upvotes, setUpvotes] = useState(workspace.upvotes)
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
        } else {
            setDate("Updated just now")
        }
    }, [])

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
                    <BookmarkIcon className={`feed-workspace-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />
                    <ThumbUpIcon className={`feed-workspace-icon ${upvoted ? "blue" : "grey"}`} onClick={() => {updateUpvote()}} />
                    <p className={`feed-workspace-upvotes ${upvoted ? "blue" : "grey"}`}>{upvotes}</p>
                </div>
                <p className="feed-workspace-description">{workspace.description}</p>
            </div>
        </div>
    )
}

export default FeedWorkspaceCard