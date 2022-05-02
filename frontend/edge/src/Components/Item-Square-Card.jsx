import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenItemsContext } from '../Contexts/openItemsContext';
import globalAPI from '../API/global'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ItemSquareCard = ({item, created, creator, currentUserID}) => {
    const [bookmarked, setBookmarked] = useState(item.bookmarked)
    const [upvoted, setUpvoted] = useState(item.upvoted)
    const [upvotes, setUpvotes] = useState(item.upvotes)
    const [visibility, setVisibility] = useState(item.visibility)
    const {addOpenItems} = useContext(OpenItemsContext);
    const [date, setDate] = useState("");

    // Converts the ISO date the workspace or dataset was last updated into a better format for user readability
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

    // Sends the workspace or dataset information to the context provider to be added
    const addHeader = () => {
        if (item.creator === currentUserID) {
            addOpenItems(item._id, item.title, item.type)
        }
    }

    // Updates whether the currently signed-in user has upvoted the workspace or dataset
    const updateUpvote = async () => {
        try {
            // Creates an PUT request to the associated API endpoint with the state of the upvote as a query parameter
            await globalAPI.put(`/upvote/${item._id}?state=${upvoted}`);

            // Updates the local state variable containing the number of upvotes
            if (upvoted) {
                setUpvotes(state => state-1)
            } else {
                setUpvotes(state => state+1)
            }

            // Updates the local state variable containing the upvote state
            setUpvoted(state => !state)
        } catch (err) {}
    }

    // Updates whether the currently signed-in user has bookmarked the workspace or dataset
    const updateBookmark = async () => {
        try {
            // Creates a PUT request to the associated API endpoint with the bookmark state as a query parameter
            await globalAPI.put(`/bookmark/${item._id}?state=${bookmarked}`);
            
            // Updates the local state variable containing the bookmark state
            setBookmarked(state => !state)
        } catch (err) {}
    }

    // Updates whether the workspace or dataset is public or not
    const updateVisibility = async () => {
        try {
            // Creates a PUT request to he associated API endpoint to update the workspace or dataset visibility
            await globalAPI.put(`/visibility/${item._id}`);

            // Updates the local state variable containing the visibility state
            setVisibility(state => !state)
        } catch (err) {}
    }

    return (
        <div className="item-square-card" onClick={() => {addHeader()}}>
            <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`}>
                <img src={`http://localhost:4000/images/${item.picture}`} className="item-square-card-picture" />
            </Link>
            <div className="item-square-card-heading">
                {item.type === "workspace" ? <img src="http://localhost:3000/workspace.png" /> : <img src="http://localhost:3000/dataset.png" />}
                <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`} className="item-square-card-title">{item.title}</Link>
            </div>
            <div>
                <p className="item-square-card-meta">{created ? "You" : creator}</p>
                <p className="item-square-card-meta">{date}</p>
            </div>
            <div className="item-square-card-bottom">
                <ThumbUpIcon className={`item-square-card-icon ${upvoted ? "blue2" : "white"}`} onClick={() => {updateUpvote()}} />
                <p className={`item-square-card-upvotes ${upvoted ? "blue2" : "white"}`}>{upvotes}</p>
                {/* Only displays the button to bookmark the workspace or dataset if the user viewing the card isn't the creator */}
                {!created ?
                    <BookmarkIcon className={`item-square-card-icon ${bookmarked ? "blue2" : "white"}`} onClick={() => {updateBookmark()}} />
                :
                    <>
                        {/* Only displays button to change visibility if the creator is viewing the card */}
                        {visibility ? 
                            <VisibilityIcon className="item-square-card-visibility" onClick={() => {updateVisibility()}} />
                        :
                            <VisibilityOffIcon className="item-square-card-visibility" onClick={() => {updateVisibility()}} />
                        }
                    </>
                }
            </div>
        </div>
    )
}

export default ItemSquareCard