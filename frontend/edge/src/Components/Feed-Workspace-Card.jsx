import React from 'react'
import { Link } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const FeedWorkspaceCard = ({workspace}) => {
    return (
        <div className="feed-workspace-card">
            <img src="http://localhost:3000/Feed-Bar.png" />
            <div className="feed-workspace-body">
                <Link to={`/workspace/${workspace._id}`}>
                    <img src="https://via.placeholder.com/1000" />
                </Link>
                <Link to={`/workspace/${workspace._id}`} className="feed-workspace-heading">Workspace 2</Link>
                <div>
                    <p className="feed-workspace-meta">Dylan Tate</p>
                    <p className="feed-workspace-meta">Updated 2 hours ago</p>
                    <BookmarkIcon className="feed-workspace-icon" />
                    <ThumbUpIcon className="feed-workspace-icon" />
                    <p className="feed-workspace-upvotes">128</p>
                </div>
                <p className="feed-workspace-description">Description</p>
            </div>
        </div>
    )
}

export default FeedWorkspaceCard