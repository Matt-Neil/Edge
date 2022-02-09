import React, {useState, useEffect, useContext, useRef} from 'react'
import {Link, useParams} from "react-router-dom"
import globalAPI from '../API/global'
import imageAPI from '../API/images'
import itemsAPI from '../API/items'
import ViewData from '../Components/View-Data';
import { OpenItemsContext } from '../Contexts/openItemsContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExperimentCard from '../Components/Experiment-Card'

const Workspace = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false)
    const [exist, setExist] = useState()
    const [noData, setNoData] = useState()
    const [dataset, setDataset] = useState()
    const [workspace, setWorkspace] = useState()
    const [dataTable, setDataTable] = useState()
    const [dataID, setDataID] = useState("")
    const [updated, setUpdated] = useState()
    const [changedData, setChangedData] = useState(false)
    const [changedSettings, setChangedSettings] = useState(false)
    const [date, setDate] = useState("");
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(30)
    const [row, setRow] = useState()
    const [maxRows, setMaxRows] = useState()
    const [page, setPage] = useState(1)
    const [bookmarked, setBookmarked] = useState()
    const [upvoted, setUpvoted] = useState()
    const [upvotes, setUpvotes] = useState()
    const [picture, setPicture] = useState()
    const [visibility, setVisibility] = useState()
    const [comments, setComments] = useState()
    const [comment, setComment] = useState("")
    const [experiments, setExperiments] = useState()
    const [section, setSection] = useState("experiments")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState();
    const [refreshTable, setRefreshTable] = useState()
    const [displayPublic, setDisplayPublic] = useState(false)
    const [displayExist, setDisplayExist] = useState(false)
    const {addOpenItems} = useContext(OpenItemsContext);
    const workspaceID = useParams().id;
    const publicInterval = useRef(0)
    const existInterval = useRef(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspace = await itemsAPI.get(`/${workspaceID}?type=workspace`);
                const comments = await globalAPI.get(`/comment/${workspaceID}`);

                if (workspace.data.data.creator === currentUser.id) {
                    addOpenItems(workspace.data.data._id, workspace.data.data.title, workspace.data.data.type)
                }

                setWorkspace(workspace.data.data);
                setUpdated(workspace.data.data.updated);
                setBookmarked(workspace.data.data.bookmarked)
                setUpvoted(workspace.data.data.upvoted)
                setPicture(workspace.data.data.picture)
                setUpvotes(workspace.data.data.upvotes)
                setDataset(workspace.data.data.dataset._id)
                setVisibility(workspace.data.data.visibility)
                setTitle(workspace.data.data.title)
                setDescription(workspace.data.data.description)
                setComments(comments.data.data)
                setExperiments(workspace.data.data.experiments)

                fetch(`http://127.0.0.1:5000/files/${workspace.data.data.dataset.datafile}.csv`)
                    .then(response => response.text())
                    .then(text => {
                        setDataTable(text)
                        setMaxRows(text.slice(text.indexOf('\n')+1).split('\n').length)
                        setExist(true)
                        setNoData(false)
                        setLoaded(true)
                    }).catch(() => {
                        setExist(true)
                        setNoData(true)
                        setLoaded(true)
                    });
            } catch (err) {
                setExist(false)
                setLoaded(true)
            }
        }
        fetchData();
    }, [])    

    useEffect(() => {
        if (loaded && exist) {
            const updatedDate = new Date(updated);
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
    }, [loaded, updated])

    const displayPublicInterval = () => {
        clearInterval(publicInterval.current)
        setDisplayPublic(true);
        publicInterval.current = setInterval(() => {
            setDisplayPublic(false);
        }, 1200)
        return ()=> {clearInterval(publicInterval.current)};
    }

    const displayExistInterval = () => {
        clearInterval(existInterval.current)
        setDisplayExist(true);
        existInterval.current = setInterval(() => {
            setDisplayExist(false);
        }, 1200)
        return ()=> {clearInterval(existInterval.current)};
    }

    const existingWorkspace = async () => {
        try {
            const checkPublic = await itemsAPI.get(`/check-public-dataset?datafile=${dataID}`)
    
            if (checkPublic.data.success && checkPublic.data.data.visibility) {
                fetch(`http://127.0.0.1:5000/files/${dataID}.csv`)
                    .then(response => response.text())
                    .then(text => {
                        setDataTable(text)
                        setMaxRows(text.slice(text.indexOf('\n')+1).split('\n').length)
                        setDataset(checkPublic._id)
                        setRefreshTable(new Date().getTime())
                    })
            } else if (checkPublic.data.success && !checkPublic.data.data.visibility) {
                displayPublicInterval()
            } else {
                displayExistInterval()
            }
        } catch (err) {}
    }

    const updateUpvote = async () => {
        try {
            await globalAPI.put(`/upvote/${workspaceID}?state=${upvoted}`);

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
            await globalAPI.put(`/bookmark/${workspaceID}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    const updateVisibility = async () => {
        try {
            await globalAPI.put(`/visibility/${workspace._id}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    const addComment = async (e) => {
        e.preventDefault()

        try {
            await globalAPI.put(`/comment/${workspaceID}?type=workspace`, {
                comment: comment
            });

            setComments([{
                user: {name: currentUser.name},
                comment: comment
            }, ...comments])
            setComment("")
        } catch (err) {}
    }

    const fetchRow = () => {
        if (!isNaN(row) && row !== "") {
            setStart(row-1)
            setEnd(row)
            setRefreshTable(new Date().getTime())
        } else {
            if (start === (page-1)*30 && end === page*30) {
                setRow("")
            } else {
                setStart((page-1)*30)
                setEnd(page*30)
                setRefreshTable(new Date().getTime())
            }
        }
    }

    const cancelRow = () => {
        if (start === (page-1)*30 && end === page*30) {
            setRow("")
        } else {
            setStart((page-1)*30)
            setEnd(page*30)
            setRefreshTable(new Date().getTime())
        }
    }

    const previousPage = () => {
        if (page > 1) {
            setPage(state => state-1)
        }
        setStart((page-1)*30)
        setEnd(page*30)
        setRefreshTable(new Date().getTime())
    }

    const nextPage = () => {
        if (page*30 < maxRows && maxRows > 30) {
            setPage(state => state+1)
            setStart((page)*30)
            setEnd((page+1)*30)
            setRefreshTable(new Date().getTime())
        }
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

    const updateSettings = async () => {
        if (image) {
            const formImage = new FormData();
            formImage.append('image', image);
            
            try {
                const tempPicture = picture
                const imageResponse = await imageAPI.post("/upload", formImage);

                await itemsAPI.put(`/${workspaceID}?type=workspace`, {
                    title: title,
                    description: description,
                    picture: imageResponse.data.data,
                    dataset: dataset,
                    updated: new Date().toISOString()
                })

                setImage(undefined)
                setPicture(imageResponse.data.data)

                if (tempPicture !== "default.png") {
                    await imageAPI.put('/remove', {picture: tempPicture});
                }
            } catch (err) {}
        } else {
            try {
                await itemsAPI.put(`/${workspaceID}?type=workspace`, {
                    title: title,
                    description: description,
                    picture: picture,
                    dataset: dataset,
                    updated: new Date().toISOString()
                })
            } catch (err) {}
        }

        setUpdated(new Date().toISOString())
        setChangedSettings(false)
    }

    const deleteWorkspace = async () => {
        try {
            await itemsAPI.delete(`/${workspaceID}`)
        } catch (err) {}
    }

    return (
        <>
            {loaded && exist ?
                <div className="width-body">  
                    <div className="item-body">
                        <div className="item-top">
                            <img className="item-picture" src={`http://localhost:4000/images/${picture}`} />
                            {workspace.self && 
                                <input className="item-image-input"
                                        type="file" 
                                        name="image" 
                                        onChange={e => {
                                            setImage(e.target.files[0])
                                            {!changedSettings && setChangedSettings(true)}
                                        }} />
                            }
                            <div className="item-heading">
                                {workspace.self ? 
                                    <input className="item-title-input"
                                            placeholder="Title" 
                                            value={title}
                                            onChange={e => {
                                                setTitle(e.target.value)
                                                {!changedSettings && setChangedSettings(true)}
                                            }} /> 
                                : 
                                    <>
                                        <img src="http://localhost:3000/workspace.png" />
                                        <h1>{workspace.title}</h1>
                                    </>
                                }
                            </div>
                            <div>
                                {!workspace.self && <p className="item-meta">{workspace.creatorName.name}</p>}
                                <p className="item-meta">{date}</p>
                                <span />
                                <Link to={`/dataset/${dataset}`} className="workspace-dataset-link">View Dataset</Link>
                                {!workspace.self && <BookmarkIcon className={`item-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />}
                                {workspace.self && 
                                    <>
                                        {visibility ? 
                                            <VisibilityIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                        :
                                            <VisibilityOffIcon className="item-visibility" onClick={() => {updateVisibility()}} />
                                        }
                                    </>
                                }
                                <ThumbUpIcon className={`item-icon ${upvoted ? "blue" : "grey"}`} onClick={() => {updateUpvote()}} />
                                <p className={`item-upvotes ${upvoted ? "blue" : "grey"}`}>{upvotes}</p>
                            </div>
                            {workspace.self ? 
                                <>
                                    <textarea className="item-description-input"
                                                placeholder="Description" 
                                                value={description}
                                                onChange={e => {
                                                    setDescription(e.target.value)
                                                    {!changedSettings && setChangedSettings(true)}
                                                }} /> 
                                    <div className="item-middle">
                                        <button className="dark-grey-button item-delete"
                                                onClick={() => {deleteWorkspace()}}>Delete</button>
                                        <button className="blue-button"
                                                disabled={!changedSettings}
                                                onClick={() => {updateSettings()}}>Save Changes</button>
                                    </div>
                                </>
                            : 
                                <p className="item-description">{workspace.description}</p>
                            }
                            <select className="item-select" onChange={e => {setSection(e.target.value)}}>
                                <option value="experiments">Experiments</option>
                                <option value="data">Data</option>
                                <option value="comments">Comments</option>
                            </select>
                        </div>
                        <div className="item-bottom">
                            {section === "experiments" ? 
                                <div className="item-experiments">
                                    <div className="item-experiments-middle">
                                        <p>{`${experiments.length} Experiments`}</p>
                                        <Link className="blue-button item-experiments-create" to={`/${workspaceID}/create-experiment`}>Create Experiment</Link>
                                    </div> 
                                    {experiments.length === 0 ?
                                        <p className="end-items">No experiments</p>
                                    :
                                        <div className="item-experiments-list"> 
                                            {experiments.map((experiment, i) => {
                                                if (currentUser.id === workspace.creator) return <ExperimentCard experiment={experiment} created={true} key={i} />

                                                return <ExperimentCard experiment={experiment} created={false} key={i} />
                                            })}
                                        </div>
                                    }
                                </div>
                            : section === "data" ?
                                <>
                                    {noData ?
                                        <p className="end-items">Cannot find dataset</p>
                                    :   
                                        <>
                                            {workspace.self && 
                                                <div className="item-options">
                                                    <p>Change Dataset</p>
                                                    <input className="workspace-replace-input"
                                                            placeholder="Data ID"
                                                            onChange={e => {setDataID(e.target.value)}}
                                                            value={dataID} />
                                                    <button className="white-button item-replace-button"
                                                            onClick={() => {
                                                                setDataID(undefined)
                                                                setChangedData(false)
                                                            }}
                                                            disabled={!changedData}>Clear</button>
                                                    <button className="blue-button item-replace-button"
                                                            disabled={dataID === ""}
                                                            onClick={() => {existingWorkspace()}}>Import</button>
                                                    {displayPublic && <p className="create-item-data-public">Dataset not public</p>}
                                                    {displayExist && <p className="create-item-data-public">Dataset does not exist</p>}
                                                </div>
                                            }
                                            <div className="item-data-table-pagination">
                                                <input placeholder="Row number" value={row} onChange={e => {setRow(e.target.value)}} />
                                                <button onClick={() => {cancelRow()}} className="white-button item-data-cancel-fetch">Cancel</button>
                                                <button onClick={() => {fetchRow()}} className="blue-button item-data-fetch">Fetch</button>
                                                <span />
                                                <ArrowBackIosNewIcon className="item-data-table-pagination-icon" onClick={() => {previousPage()}} />
                                                <p>Page {page} / {Math.ceil(maxRows/30)}</p>
                                                <ArrowForwardIosIcon className="item-data-table-pagination-icon" onClick={() => {nextPage()}} />
                                            </div>
                                            <div className="item-data-table">
                                                <ViewData dataTable={dataTable} start={start} end={end} key={refreshTable} />
                                            </div>
                                        </>
                                    }
                                </>
                            : 
                                <>
                                    <form className="item-comment-form" method="PUT" onSubmit={addComment}>
                                        <p className="item-comment">Leave a Comment</p>
                                        <textarea className="item-comment-input" placeholder="Write here" value={comment} onChange={e => {setComment(e.target.value)}} />
                                        <button className="blue-button">Comment</button>
                                    </form>
                                    <div className="item-comments">
                                        {comments.length === 0 ?
                                            <p className="end-items">No comments</p>
                                            :
                                            <>
                                                {comments.map((comment, i) => {
                                                    return (
                                                        <div className="comment-card" key={i}>
                                                            <div>
                                                                <p className="comment-card-user">{comment.user}</p>
                                                                <p className="comment-card-date">{commentDate(comment.createdAt)}</p>
                                                            </div>
                                                            <p className="comment-card-comment">{comment.comment}</p>
                                                        </div>
                                                    )
                                                })}
                                            </>
                                        }
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            : loaded && !exist &&
                <div className="width-body">  
                    <p className="item-exist">Cannot find workspace</p>
                </div>
            }   
        </>
    )
}

export default Workspace
