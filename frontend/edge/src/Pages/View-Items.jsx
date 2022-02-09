import React, {useState, useEffect} from 'react'
import {useHistory, Link} from "react-router-dom"
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import SearchIcon from '@mui/icons-material/Search';

const ViewItems = ({type, currentUser, setSearchPhrase}) => {
    const [items, setItems] = useState();
    const [loaded, setLoaded] = useState(false);
    const [rowFormat, setRowFormat] = useState(false)
    const [input, setInput] = useState("");
    const [finishedItems, setFinishedItems] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let items;

                switch (type) {
                    case "created-datasets":
                        items = await usersAPI.get(`/created?type=dataset&date=${new Date().toISOString()}`);
                        break;
                    case "created-workspaces":
                        items = await usersAPI.get(`/created?type=workspace&date=${new Date().toISOString()}`);
                        break;
                    case "bookmarked":
                        items = await usersAPI.get(`/bookmarked?date=${new Date().toISOString()}`);
                        break;
                    case "all-workspaces":
                        items = await itemsAPI.get(`/all?type=workspace&date=${new Date().toISOString()}`);
                        break;
                    case "all-datasets":
                        items = await itemsAPI.get(`/all?type=dataset&date=${new Date().toISOString()}`);
                        break;
                }

                if (items.data.data.length < 21) {
                    setFinishedItems(true)
                }

                setItems(items.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && input !== "") {
            setSearchPhrase(input);
            history.push(`/search-results/${input}`);
        }
    }

    const searchFunctionButton = () => {
        if (input !== "") {
            setSearchPhrase(input);
            history.push(`/search-results/${input}`);
        }
    }
    
    const fetchDataItems = async (date) => {
        if (!finishedItems) {
            try {
                let fetchedItems;

                switch (type) {
                    case "created-datasets":
                        items = await usersAPI.get(`/created?type=dataset&date=${date}`);
                        break;
                    case "created-workspaces":
                        items = await usersAPI.get(`/created?type=workspace&date=${date}`);
                        break;
                    case "bookmarked":
                        items = await usersAPI.get(`/bookmarked?date=${date}`);
                        break;
                    case "all-workspaces":
                        items = await itemsAPI.get(`/all?type=workspace&date=${date}`);
                        break;
                    case "all-datasets":
                        items = await itemsAPI.get(`/all?type=dataset&date=${date}`);
                        break;   
                }
    
                if (fetchedItems.data.data.length < 21) {
                    setFinishedItems(true)
                }

                setItems(items => [...items, ...fetchedItems.data.data]);
            } catch (err) {}
        }
    }

    const loadMore = () => {
        if (items.length !== 0) {
            if (type === "all-workspaces" || type === "all-datasets") {
                {fetchDataItems(items[items.length-1].createdAt)}
            } else {
                {fetchDataItems(items[items.length-1].updatedAt)}
            }
        }
    };

    const displayHeading = () => {
        let heading;

        switch (type) {
            case "created-workspaces":
                heading = "Created Workspaces"
                break;
            case "created-datasets":
                heading = "Created Datasets"
                break;
            case "bookmarked":
                heading = "Bookmarked"
                break;
            case "all-workspaces":
                heading = "All Workspaces"
                break;
            case "all-datasets":
                heading = "All Datasets"
                break;
        }

        return <h1>{heading}</h1>
    }
    
    return (
        <>
            {loaded &&
                <div className="width-body">  
                    <div className="view-items-body">
                        {type === "all" &&
                            <div className="view-items-search">
                                <input className="view-items-search-input"
                                        placeholder="Search"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyPress={searchFunctionKey} />
                                <SearchIcon className="view-items-search-icon" onClick={e => searchFunctionButton()} />
                            </div>
                        }
                        <div className="view-items-top">
                            {displayHeading()}
                            {type === "created-workspaces" && <Link to="/create-workspace" className="blue-button">Create Workspace</Link>}
                            {type === "created-datasets" && <Link to="/create-dataset" className="blue-button">Create Dataset</Link>}
                        </div>
                        <div className="view-items-middle">
                            {(type === "created-workspaces" || type === "all-workspaces") ?
                                <p>{`${items.length} Workspaces`}</p>
                            : (type === "created-datasets" || type === "all-dataset") ?
                                <p>{`${items.length} Datasets`}</p>
                            :
                                <p>{`${items.length} Bookmarks`}</p>
                            }
                            <img src="http://localhost:3000/List.png" className="view-items-row-icon" onClick={() => {setRowFormat(true)}} />
                            <img src="http://localhost:3000/Grid.png" className="view-items-grid-icon" onClick={() => {setRowFormat(false)}} />
                        </div>
                        <div className="view-items-list">
                            {items.length > 0 &&
                                <>
                                    {items.map((item, i) => {
                                        if (type === "created-workspaces" || type === "created-datasets") return rowFormat ? <ItemRowCard item={item} created={true} key={i} /> : <ItemSquareCard item={item} created={true} key={i} />

                                        return rowFormat ? <ItemRowCard item={item} creator={item.creatorName.name} currentUserID={currentUser.id} created={type === "created"} key={i} /> : <ItemSquareCard item={item} creator={item.creatorName.name} currentUserID={currentUser.id} created={type === "created"} key={i} />
                                    })}
                                </>
                            }
                        </div>
                        {items.length >= 0 && finishedItems ?
                            <p className="end-items">No more bookmarks</p>
                            :
                            <p className="load-items" onClick={() => {loadMore()}}>Load more</p>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default ViewItems