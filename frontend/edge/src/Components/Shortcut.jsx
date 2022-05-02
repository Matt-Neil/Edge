import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom';
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import { OpenItemsContext } from '../Contexts/openItemsContext';
import AddIcon from '@mui/icons-material/Add';

const Shortcut = ({type, currentUserID, datasetID}) => {
    const {addOpenItems} = useContext(OpenItemsContext);
    const [items, setItems] = useState();
    const [loaded, setLoaded] = useState(false);

    // Fetches the workspaces and datasets for the page type specified in the component props
    useEffect(() => {
        const fetchData = async () => {
            try {
                let items;

                if (type === "workspaces") {
                    // Creates GET request to get the user's created workspaces
                    items = await usersAPI.get(`/created-shortcut?type=workspace`);
                } else if (type === "datasets") {
                    // Creates GET request to get the user's created datasets
                    items = await usersAPI.get(`/created-shortcut?type=dataset`);
                } else if (type === "bookmarked") {
                    // Creates GET request to get the user's bookmarked workspaces and datatsets
                    items = await usersAPI.get(`/bookmarked-shortcut`);
                } else {
                    // Creates GET request to get workspaces that use the dataset specified as a query parameter
                    items = await itemsAPI.get(`/associated-workspaces?id=${datasetID}`);
                }

                setItems(items.data.data)
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    // Sends the workspace or dataset information to the context provider to be added
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
                        {type === "related" ?
                            <p className="shortcut-link">Related Workspaces</p>
                        :
                            <Link className="shortcut-link"
                                    to={type === "workspaces" ? "/created-workspaces" : (type === "datasets") ? "/created-datasets" : "/bookmarked"}>
                                {type === "workspaces" ? "Your Workspaces" : (type === "datasets") ? "Your Datasets" : "Your Bookmarked"}
                            </Link>
                        }
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