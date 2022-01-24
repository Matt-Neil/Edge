import React, {useState, useEffect, useRef} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import workspacesAPI from '../API/workspaces'
import ViewData from '../Components/View-Data';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const Workspace = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false)
    const [workspace, setWorkspace] = useState()
    const [displayData, setDisplayData] = useState("data")
    const [dataTable, setDataTable] = useState()
    const [date, setDate] = useState("");
    const [copyData, setCopyData] = useState(true)
    const [bookmarked, setBookmarked] = useState()
    const [upvoted, setUpvoted] = useState()
    const [upvotes, setUpvotes] = useState()
    const [visibility, setVisibility] = useState()
    const [comments, setComments] = useState()
    const [comment, setComment] = useState("")
    const [section, setSection] = useState("data")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const copyInterval = useRef(0)
    const workspaceID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspace = await workspacesAPI.get(`/${workspaceID}`);
                const comments = await workspacesAPI.get(`/comment/${workspaceID}`);

                setWorkspace(workspace.data.data);
                setBookmarked(workspace.data.data.bookmarked)
                setUpvoted(workspace.data.data.upvoted)
                setUpvotes(workspace.data.data.upvotes)
                setVisibility(workspace.data.data.visibility)
                setComments(comments.data.data)

                fetch(`http://127.0.0.1:5000/files/${workspace.data.data.data}.csv`)
                    .then(response => response.text())
                    .then(text => {
                        setDataTable(text)
                        setLoaded(true)
                    })
            } catch (err) {}
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (loaded) {
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
        }
    }, [loaded])

    const copiedInterval = () => {
        clearInterval(copyInterval.current)
        navigator.clipboard.writeText(workspace.data);
        setCopyData(false);
        copyInterval.current = setInterval(() => {
            setCopyData(true);
        }, 800)
        return ()=> {clearInterval(copyInterval.current)};
    }

    const updateUpvote = async () => {
        try {
            await workspacesAPI.put(`/upvote/${workspaceID}?state=${upvoted}`);

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
            await workspacesAPI.put(`/bookmark/${workspaceID}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    const updateVisibility = async () => {
        try {
            await workspacesAPI.put(`/visibility/${workspace._id}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    const addComment = async (e) => {
        e.preventDefault()

        try {
            await workspacesAPI.put(`/comment/${workspaceID}`, {
                comment: comment
            });

            setComments([{
                user: {name: currentUser.name},
                comment: comment
            }, ...comments])
            setComment("")
        } catch (err) {}
    }

    const commentDate = (date) => {
        const updatedDate = new Date(date);
        const currentDate = new Date();

        if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 365) {
            return `Posted ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 365)).toString()} years ago`
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 30) {
            return `Posted ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 30).toString())} months ago`
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 1) {
            return `Posted ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24))).toString()} days ago`
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600) >= 1) {
            return `Posted ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600))).toString()} hours ago`
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60) >= 1) {
            return `Posted ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60))).toString()} minutes ago`
        } else {
            return "Posted just now"
        }
    }

    const updateWorkspaceSettings = () => {
        
    }

    return (
        <>
            {loaded &&
                <>
                    {workspace.self ?
                        <div className="sidebar-body"> 
                            <div className="self-workspace-sidebar">
                                <h1>{workspace.title}</h1>
                                <button className={section === "data" ? "blue-button" : "grey-button"} onClick={() => {setSection("data")}}>Data</button>
                                <button className={section === "experiments" ? "blue-button" : "grey-button"} onClick={() => {setSection("experiments")}}>Experiments</button>
                                <button className={section === "settings" ? "blue-button" : "grey-button"} onClick={() => {setSection("settings")}}>Settings</button>
                                <button className={section === "comments" ? "blue-button" : "grey-button"} onClick={() => {setSection("comments")}}>Comments</button>
                            </div>
                            <div className="inner-body">
                                {section === "data" ?
                                    <div className="self-workspace-body">
                                    </div>
                                : section === "experiments" ?
                                    <div className="self-workspace-body">
                                    </div>
                                : section === "settings" ?
                                    <div className="self-workspace-settings">
                                        <form className="self-workspace-settings-form" method="PUT" onSubmit={updateWorkspaceSettings}>
                                            <label>Title</label>
                                            <input placeholder="Title" value={title} onChange={e => {setTitle(e.target.value)}} />
                                            <label>Description</label>
                                            <textarea placeholder="Description" value={description} onChange={e => {setDescription(e.target.value)}} />
                                            <button className="white-button" type="button" onClick={() => {updateVisibility()}}>{visibility ? "Public" : "Private"}</button>
                                            <button className="blue-button" disabled={title === "" || description === ""}>Save Changes</button>
                                        </form>
                                    </div>
                                : 
                                    <div className="self-workspace-body">
                                    </div>
                                }
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
                                        <BookmarkIcon className={`other-workspace-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />
                                        <ThumbUpIcon className={`other-workspace-icon ${upvoted ? "blue" : "grey"}`} onClick={() => {updateUpvote()}} />
                                        <p className={`other-workspace-upvotes ${upvoted ? "blue" : "grey"}`}>{upvotes}</p>
                                    </div>
                                    <p className="other-workspace-description">{workspace.description}</p>
                                    <select className="other-workspace-select" onChange={e => {setDisplayData(e.target.value)}}>
                                        <option value="data">Data</option>
                                        <option value="model">Model</option>
                                        <option value="comment">Comments</option>
                                    </select>
                                </div>
                                <div className="other-workspace-bottom">
                                    {displayData === "data" ? 
                                        <> 
                                            <div className="other-workspace-data">
                                                <div className="other-workspace-copy">
                                                    {copyData ? <p>Data ID</p> : <p>Copied</p>}
                                                    <button disabled={!copyData} onClick={() => {copiedInterval()}}>
                                                        <ContentCopyIcon className="other-workspace-copy-icon" />
                                                    </button>
                                                </div>
                                                <a href={`http://127.0.0.1:5000/files/${workspace.data}.csv`} download>Download</a>
                                            </div>
                                            <ViewData dataTable={dataTable} />
                                        </>
                                    : displayData === "model" ?
                                        <p>model</p>
                                    :
                                        <>
                                            <form className="other-workspace-comment-form" method="PUT" onSubmit={addComment}>
                                                <p className="other-workspace-comment">Leave a Comment</p>
                                                <textarea className="other-workspace-comment-input" value={comment} onChange={e => {setComment(e.target.value)}} />
                                                <button className="blue-button">Comment</button>
                                            </form>
                                            <div className="other-workspace-comments">
                                                {comments.map((comment, i) => {
                                                    return (
                                                        <div className="comment-card" key={i}>
                                                            <div>
                                                                <p className="comment-card-user">{comment.user.name}</p>
                                                                <p className="comment-card-date">{commentDate(comment.createdAt)}</p>
                                                            </div>
                                                            <p className="comment-card-comment">{comment.comment}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </>
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
