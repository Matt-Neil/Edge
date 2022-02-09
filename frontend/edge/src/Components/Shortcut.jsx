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
                    items = await usersAPI.get(`/created-shortcut?type=workspace`);
                } else if (type === "datasets") {
                    items = await usersAPI.get(`/created-shortcut?type=dataset`);
                } else if (type === "bookmarked") {
                    items = await usersAPI.get(`/bookmarked`);
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
                        <p>{type === "workspaces" ? "Created Workspaces" : (type === "datasets") ? "Created Datasets" : "Bookmarked"}</p>
                        {type === "workspaces" && 
                            <Link to="/create-workspace">
                                <AddIcon className="shortcut-items-create-item-icon" />
                            </Link>
                        }
                        {type === "datasets" && 
                            <Link to="/create-dataset">
                                <AddIcon className="shortcut-items-create-item-icon" />
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
                                        <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`}
                                                className="shortcut-list-item" 
                                                onClick={() => {addHeader(item)}}
                                                key={i}>
                                            <img src={`http://localhost:4000/images/${item.picture}`} />
                                            <p>{item.title}</p>
                                        </Link>
                                    )
                                })}
                                <Link to={type === "workspaces" ? "/created-workspaces" : (type === "datasets") ? "/created-datasets" : "/bookmarked"}
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
