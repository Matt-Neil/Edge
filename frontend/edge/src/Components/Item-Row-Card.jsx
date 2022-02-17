import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenItemsContext } from '../Contexts/openItemsContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import globalAPI from '../API/global'
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const WorkspaceRowCard = ({item, created, creator, currentUserID}) => {
    const [bookmarked, setBookmarked] = useState(item.bookmarked)
    const [upvoted, setUpvoted] = useState(item.upvoted)
    const [upvotes, setUpvotes] = useState(item.upvotes)
    const [visibility, setVisibility] = useState(item.visibility)
    const {addOpenItems} = useContext(OpenItemsContext);
    const [date, setDate] = useState("");

    useEffect(() => {
        const updatedDate = new Date(item.updated);
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
        if (item.creator === currentUserID) {
            addOpenItems(item._id, item.title, item.type)
        }
    }

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

    const updateVisibility = async () => {
        try {
            await globalAPI.put(`/visibility/${item._id}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    return (
        <div className="item-row-card" onClick={() => {addHeader()}}>
            <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`}>
                <img src={`http://localhost:4000/images/${item.picture}`} className="item-row-card-picture" />
            </Link>
            <div className="item-row-card-information">
                <div className="item-row-card-heading">
                    {item.type === "workspace" ? <img src="http://localhost:3000/workspace.png" /> : <img src="http://localhost:3000/dataset.png" />}
                    <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`} className="item-row-card-title">{item.title}</Link>
                </div>
                <div>
                    {!created && <p className="item-row-card-meta">{creator}</p>}
                    <p className="item-row-card-meta">{date}</p>
                </div>
            </div>
            <div>
                {!created && item.creator !== currentUserID && <BookmarkIcon className={`item-row-card-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />}
                <ThumbUpIcon className={`item-row-card-icon ${upvoted ? "blue" : "grey"}`} onClick={() => {updateUpvote()}} />
                <p className={`item-row-card-upvotes ${upvoted ? "blue" : "grey"}`}>{upvotes}</p>
                {created && 
                    <>
                        {visibility ? 
                            <VisibilityIcon className="item-row-card-visibility" onClick={() => {updateVisibility()}} />
                        :
                            <VisibilityOffIcon className="item-row-card-visibility" onClick={() => {updateVisibility()}} />
                        }
                    </>
                }
            </div>
        </div>
    )
}

export default WorkspaceRowCard