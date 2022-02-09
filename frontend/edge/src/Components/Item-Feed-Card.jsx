import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import globalAPI from '../API/global'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const FeedWorkspaceCard = ({item, creator}) => {
    const [bookmarked, setBookmarked] = useState(item.bookmarked)
    const [upvoted, setUpvoted] = useState(item.upvoted)
    const [upvotes, setUpvotes] = useState(item.upvotes)
    const [date, setDate] = useState("");

    useEffect(() => {
        const updatedDate = new Date(item.updatedAt);
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
            await globalAPI.put(`/upvote/${item._id}?state=${upvoted}`);

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
            await globalAPI.put(`/bookmark/${item._id}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    return (
        <div className="item-feed-card-card">
            <img src="http://localhost:3000/Feed-Bar.png" className="item-feed-card-bar" />
            <div className="item-feed-card-body">
                <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`}>
                    <img src={`http://localhost:4000/images/${item.picture}`} className="item-feed-card-picture" />
                </Link>
                <div className="item-feed-card-heading">
                    {item.type === "workspace" ? <img src="http://localhost:3000/workspace.png" /> : <img src="http://localhost:3000/dataset.png" />}
                    <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`} className="item-feed-card-title">{item.title}</Link>
                </div>
                <div>
                    <p className="item-feed-card-meta">{creator}</p>
                    <p className="item-feed-card-meta">{date}</p>
                    <BookmarkIcon className={`item-feed-card-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />
                    <ThumbUpIcon className={`item-feed-card-icon ${upvoted ? "blue" : "grey"}`} onClick={() => {updateUpvote()}} />
                    <p className={`item-feed-card-upvotes ${upvoted ? "blue" : "grey"}`}>{upvotes}</p>
                </div>
                <p className="item-feed-card-description">{item.description}</p>
            </div>
        </div>
    )
}

export default FeedWorkspaceCard