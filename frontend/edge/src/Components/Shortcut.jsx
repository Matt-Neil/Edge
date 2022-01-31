import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom';
import usersAPI from '../API/users'
import { OpenItemsContext } from '../Contexts/openItemsContext';
import AddIcon from '@mui/icons-material/Add';

const Shortcut = ({type, currentUserID}) => {
    const {addOpenItems} = useContext(OpenItemsContext);
    const [items, setItems] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let items;

                if (type === "workspaces") {
                    items = await usersAPI.get(`/created-workspaces-shortcut`);
                } else if (type === "datasets") {
                    items = await usersAPI.get(`/created-datasets-shortcut`);
                } else if (type === "bookmarked-workspaces") {
                    items = await usersAPI.get(`/bookmarked-workspaces-shortcut`);
                } else {
                    items = await usersAPI.get(`/bookmarked-datasets-shortcut`);
                }

                setItems(items.data.data)
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const addHeader = (item) => {
        if (item.creator === currentUserID) {
            addOpenItems(item._id, item.title, item.type)
        }
    }

    return (
        <>
            {loaded &&
                <div className="shortcut-items-container">
                    <div className="shortcut-items-heading">
                        <p>{type === "workspaces" ? "Created Workspaces" : (type === "datasets") ? "Created Datasets" 
                            : (type === "bookmarked-workspaces") ? "Bookmarked Workspaces" : "Bookmarked Datasets"}</p>
                        {type === "workspaces" && 
                            <Link to="/new-workspace">
                                <AddIcon className="shortcut-items-new-workspace-icon" />
                            </Link>
                        }
                        {type === "datasets" && 
                            <Link to="/new-dataset">
                                <AddIcon className="shortcut-items-new-workspace-icon" />
                            </Link>
                        }
                    </div>
                    <div className="shortcut-items-list">
                        {items.length === 0 ?
                            <p className="shortcut-items-list-none">Empty</p>
                        :
                            <>
                                {items.map((item, i) => {
                                    return (
                                        <Link to={type === "workspaces" ? `/workspace/${item._id}` : (type === "datasets") ? `/dataset/${item._id}` 
                                            : (type === "bookmarked-workspaces") ? `/workspace/${item._id}` : `/dataset/${item._id}`}
                                                className="shortcut-list-item" 
                                                onClick={() => {addHeader(item)}}
                                                key={i}>
                                            <img src={`http://localhost:4000/images/${item.picture}`} />
                                            <p>{item.title}</p>
                                        </Link>
                                    )
                                })}
                                <Link to={type === "workspaces" ? "/created-workspaces" : (type === "datasets") ? "/created-datasets" 
                                    : (type === "bookmarked-workspaces") ? "/bookmarked-workspaces" : "/bookmarked-datasets"}
                                        className="shortcut-items-all">See All</Link>
                            </>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default Shortcut
