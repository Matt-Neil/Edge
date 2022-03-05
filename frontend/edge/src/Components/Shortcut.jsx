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
                } else {
                    items = await usersAPI.get(`/bookmarked-shortcut`);
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
                <div className="shortcut">
                    <div className="shortcut-header">
                        <Link className="shortcut-link"
                                to={type === "workspaces" ? "/created-workspaces" : (type === "datasets") ? "/created-datasets" : "/bookmarked"}>
                            {type === "workspaces" ? "Your Workspaces" : (type === "datasets") ? "Your Datasets" : "Your Bookmarked"}
                        </Link>
                        <span />
                        {type === "workspaces" && 
                            <Link to="/create-workspace">
                                <AddIcon className="shortcut-icon" />
                            </Link>
                        }
                        {type === "datasets" && 
                            <Link to="/create-dataset">
                                <AddIcon className="shortcut-icon" />
                            </Link>
                        }
                    </div>
                    <div className="shortcut-body">
                        {items.length === 0 ?
                            <p className="shortcut-none">Empty</p>
                        :
                            <>
                                {items.map((item, i) => {
                                    return (
                                        <Link to={item.type === "workspace" ? `/workspace/${item._id}` : `/dataset/${item._id}`}
                                                className="shortcut-item" 
                                                onClick={() => {addHeader(item)}}
                                                key={i}>
                                            <img src={`http://localhost:4000/images/${item.picture}`} />
                                            <p>{item.title}</p>
                                        </Link>
                                    )
                                })}
                            </>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default Shortcut