import React, {useState, useEffect, useRef, useContext} from 'react'
import {useParams} from "react-router-dom"
import itemsAPI from '../API/items'
import globalAPI from '../API/global'
import imageAPI from '../API/images'
import fileAPI from '../API/files'
import ViewData from '../Components/View-Data';
import { OpenItemsContext } from '../Contexts/openItemsContext';
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Dataset = ({currentUser}) => {
    const [loaded, setLoaded] = useState(false)
    const [exist, setExist] = useState()
    const [dataset, setDataset] = useState()
    const [workspaces, setWorkspaces] = useState()
    const [finishedWorkspaces, setFinishedWorkspaces] = useState(false)
    const [section, setSection] = useState("data")
    const [dataTable, setDataTable] = useState()
    const [updated, setUpdated] = useState()
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(30)
    const [dataFile, setDataFile] = useState()
    const [row, setRow] = useState()
    const [maxRows, setMaxRows] = useState()
    const [page, setPage] = useState(1)
    const [rowFormat, setRowFormat] = useState(false)
    const [changedData, setChangedData] = useState(false)
    const [changedSettings, setChangedSettings] = useState(false)
    const [date, setDate] = useState("");
    const [picture, setPicture] = useState()
    const [copyData, setCopyData] = useState(true)
    const [bookmarked, setBookmarked] = useState()
    const [upvoted, setUpvoted] = useState()
    const [upvotes, setUpvotes] = useState()
    const [visibility, setVisibility] = useState()
    const [normalised, setNormalised] = useState()
    const [comments, setComments] = useState()
    const [comment, setComment] = useState("")
    const [data, setData] = useState()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState();
    const [refreshTable, setRefreshTable] = useState()
    const {addOpenItems} = useContext(OpenItemsContext);
    const copyInterval = useRef(0)
    const datasetID = useParams().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataset = await itemsAPI.get(`/${datasetID}?type=dataset`);
                const comments = await globalAPI.get(`/comment/${datasetID}`);
                const workspaces = await itemsAPI.get(`/associated-workspaces?id=${datasetID}&date=${new Date().toISOString()}`);

                if (workspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                if (dataset.data.data.self) {
                    addOpenItems(dataset.data.data._id, dataset.data.data.title, dataset.data.data.type)
                }

                setDataset(dataset.data.data);
                setUpdated(dataset.data.data.updated);
                setBookmarked(dataset.data.data.bookmarked)
                setUpvoted(dataset.data.data.upvoted)
                setData(dataset.data.data.datafile)
                setUpvotes(dataset.data.data.upvotes)
                setVisibility(dataset.data.data.visibility)
                setNormalised(dataset.data.data.normalised)
                setTitle(dataset.data.data.title)
                setPicture(dataset.data.data.picture)
                setDescription(dataset.data.data.description)
                setWorkspaces(workspaces.data.data)
                setComments(comments.data.data)

                fetch(`http://127.0.0.1:5000/files/${dataset.data.data.datafile}.csv`)
                    .then(response => response.text())
                    .then(text => {
                        setDataTable(text)
                        setMaxRows(text.slice(text.indexOf('\n')+1).split('\n').length)
                        setExist(true)
                        setLoaded(true)
                    })
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

    const fetchDataWorkspaces = async (date) => {
        if (!finishedWorkspaces) {
            try {
                const fetchedWorkspaces = await itemsAPI.get(`/associated-workspaces?id=${datasetID}&date=${date}`);;
    
                if (fetchedWorkspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                setWorkspaces(items => [...items, ...fetchedWorkspaces.data.data]);
            } catch (err) {}
        }
    }

    const loadMore = () => {
        if (workspaces.length !== 0) {
            {fetchDataWorkspaces(workspaces[workspaces.length-1].createdAt)}
        }
    };

    const copiedInterval = () => {
        clearInterval(copyInterval.current)
        navigator.clipboard.writeText(dataset.data);
        setCopyData(false);
        copyInterval.current = setInterval(() => {
            setCopyData(true);
        }, 800)
        return ()=> {clearInterval(copyInterval.current)};
    }

    const updateUpvote = async () => {
        try {
            await globalAPI.put(`/upvote/${dataset._id}?state=${upvoted}`);

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
            await globalAPI.put(`/bookmark/${dataset._id}?state=${bookmarked}`);
            
            setBookmarked(state => !state)
        } catch (err) {}
    }

    const updateVisibility = async () => {
        try {
            await globalAPI.put(`/visibility/${dataset._id}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    const addComment = async (e) => {
        e.preventDefault()

        try {
            await globalAPI.put(`/comment/${datasetID}`, {
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
        if (!(start === (page-1)*30 && end === page*30)) {
            setStart((page-1)*30)
            setEnd(page*30)
            setRefreshTable(new Date().getTime())
        }
        setRow("")
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

    const updateDataset = async () => {
        if (image) {
            const formImage = new FormData();
            formImage.append('image', image);
            
            try {
                const tempPicture = picture
                const imageResponse = await imageAPI.post("/upload", formImage);

                await itemsAPI.put(`/${datasetID}?type=dataset`, {
                    title: title,
                    description: description,
                    picture: imageResponse.data.data,
                    datafile: data,
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
                await itemsAPI.put(`/${datasetID}?type=dataset`, {
                    title: title,
                    description: description,
                    picture: picture,
                    datafile: data,
                    updated: new Date().toISOString()
                })
            } catch (err) {}
        }

        setUpdated(new Date().toISOString())
        setChangedSettings(false)
    }

    const replaceData = async () => {
        if (dataFile !== undefined) {
            const file = dataFile;
            const reader = new FileReader();
            const formData = new FormData();
            const id = new Date().toISOString();

            reader.onload = function(e) {
                setDataTable(e.target.result);
                setMaxRows(e.target.result.slice(e.target.result.indexOf('\n')+1).split('\n').length)
                setRefreshTable(new Date().getTime())
            }

            reader.readAsText(file)
            
            formData.append('data', dataFile);
            formData.append('id', id)

            try {
                await itemsAPI.put(`/${datasetID}?type=dataset`, {
                    title: title,
                    description: description,
                    picture: picture,
                    datafile: id,
                    updated: new Date().toISOString()
                })

                await fileAPI.post("/upload", formData);

                setData(id)
                setUpdated(new Date().toISOString())
                setDataFile(undefined)
                setChangedData(false)
            } catch (err) {}
        }
    }

    const deleteDataset = async () => {
        try {
            await itemsAPI.delete(`/${datasetID}`)
        } catch (err) {}
    }

    return (
        <>
            {loaded && exist ?
                <div className="width-body">  
                    <div className="item-body">
                        <div className="item-top">
                            <img className="item-picture" src={`http://localhost:4000/images/${picture}`} />
                            {dataset.self && 
                                <input className="item-image-input"
                                        type="file" 
                                        name="image" 
                                        onChange={e => {
                                            setImage(e.target.files[0])
                                            {!changedSettings && setChangedSettings(true)}
                                        }} />
                            }
                            <div className="item-heading">
                                {dataset.self ? 
                                    <input className="item-title-input"
                                            placeholder="Title" 
                                            value={title}
                                            onChange={e => {
                                                setTitle(e.target.value)
                                                {!changedSettings && setChangedSettings(true)}
                                            }} /> 
                                : 
                                    <>
                                        <img src="http://localhost:3000/dataset.png" />
                                        <h1>{dataset.title}</h1>
                                    </>
                                }
                            </div>
                            <div>
                                {!dataset.self && <p className="item-meta">{dataset.creatorName.name}</p>}
                                <p className="item-meta">{date}</p>
                                <span />
                                {dataset.self ?
                                    <>
                                        <label className="dataset-normalised-label">Normalised?</label>
                                        <input className="dataset-normalised-input"
                                                type="checkbox" 
                                                onChange={() => {setNormalised(previous => !previous)}}
                                                checked={normalised} />
                                    </>
                                :
                                    <>
                                        {normalised ?
                                            <p className="dataset-normalised-label">Dataset is normalised</p>
                                        :
                                            <p className="dataset-normalised-label">Dataset not normalised</p>
                                        }
                                    </>
                                }
                                {!dataset.self && <BookmarkIcon className={`item-icon ${bookmarked ? "blue" : "grey"}`} onClick={() => {updateBookmark()}} />}
                                {dataset.self && 
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
                            {dataset.self ? 
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
                                                onClick={() => {deleteDataset()}}>Delete</button>
                                        <button className={`item-save ${!changedSettings ? "grey-button" : "blue-button"}`}
                                                disabled={!changedSettings}
                                                onClick={() => {updateDataset()}}>Save Changes</button>
                                    </div>
                                </>
                            : 
                                <p className="item-description">{dataset.description}</p>
                            }
                            <select className="item-select" onChange={e => {setSection(e.target.value)}}>
                                <option value="data">Data</option>
                                <option value="workspaces">Workspaces</option>
                                <option value="comments">Comments</option>
                            </select>
                        </div>
                        <div className="item-bottom">
                            {section === "data" ? 
                                <> 
                                    <div className="item-options">
                                        {dataset.self && 
                                            <>
                                                <p>Change Data</p>
                                                <input type="file" 
                                                        name="data"
                                                        onChange={e => {
                                                            setDataFile(e.target.files[0])
                                                            setChangedData(true)
                                                        }} />
                                                <button className="blue-button item-replace-button"
                                                        disabled={!changedData}
                                                        onClick={() => {replaceData()}}>Save</button>
                                                <button className="white-button item-replace-button"
                                                        onClick={() => {
                                                            setDataFile(undefined)
                                                            setChangedData(false)
                                                        }}
                                                        disabled={!changedData}>Clear</button>
                                            </>
                                        }
                                        <div className="dataset-copy">
                                            {copyData ? <p>Data ID</p> : <p>Copied</p>}
                                            <button disabled={!copyData} onClick={() => {copiedInterval()}}>
                                                <ContentCopyIcon className="dataset-copy-icon" />
                                            </button>
                                        </div>
                                        <a href={`http://127.0.0.1:5000/files/${dataset.datafile}.csv`} download>Download</a>
                                    </div>
                                    <div className="item-data-table-pagination">
                                        <input placeholder="Row number" value={row} onChange={e => {setRow(e.target.value)}} />
                                        <button onClick={() => {cancelRow()}} className="white-button item-data-cancel-find">Cancel</button>
                                        <button onClick={() => {fetchRow()}} className="blue-button item-data-find">Find</button>
                                        <span />
                                        <ArrowBackIosNewIcon className="item-data-table-pagination-icon" onClick={() => {previousPage()}} />
                                        <p>Page {page} / {Math.ceil(maxRows/30)}</p>
                                        <ArrowForwardIosIcon className="item-data-table-pagination-icon" onClick={() => {nextPage()}} />
                                    </div>
                                    <div className="item-data-table">
                                        <ViewData dataTable={dataTable} start={start} end={end} key={refreshTable} />
                                    </div>
                                </>
                            : section === "workspaces" ?
                                <>
                                    <div className="item-workspaces">
                                        <p>{`${workspaces.length} Workspaces use this dataset`}</p>
                                        <img src="http://localhost:3000/List.png" className="item-workspaces-row-icon" onClick={() => {setRowFormat(true)}} />
                                        <img src="http://localhost:3000/Grid.png" className="item-workspaces-grid-icon" onClick={() => {setRowFormat(false)}} />
                                    </div>
                                    <div className="item-workspaces-list">
                                        {workspaces.length > 0 &&
                                            <>
                                                {workspaces.map((workspace, i) => {
                                                    return rowFormat ? <ItemRowCard item={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={workspace.creator === currentUser.id} key={i} /> : <ItemSquareCard item={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={workspace.creator === currentUser.id} key={i} />
                                                })}
                                            </>
                                        }
                                    </div>
                                    <div className="item-workspaces-end">
                                        {workspaces.length >= 0 && finishedWorkspaces ?
                                            <p className="end-items">No more workspaces</p>
                                            :
                                            <p className="load-items" onClick={() => {loadMore()}}>Load more</p>
                                        }
                                    </div>
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
            :   loaded && !exist &&
                <div className="width-body">  
                    <p className="item-exist">Cannot find dataset</p>
                </div>
            }
        </>
    )
}

export default Dataset