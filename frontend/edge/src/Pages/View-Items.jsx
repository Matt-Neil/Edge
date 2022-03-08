import React, {useState, useEffect} from 'react'
import {useHistory, Link} from "react-router-dom"
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import Shortcut from '../Components/Shortcut'
import usersAPI from '../API/users'
import itemsAPI from '../API/items'
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
                    case "bookmarks":
                        items = await usersAPI.get(`/bookmarked?date=${new Date().toISOString()}`);
                        break;
                    case "public-workspaces":
                        items = await itemsAPI.get(`/public?type=workspace&date=${new Date().toISOString()}`);
                        break;
                    case "public-datasets":
                        items = await itemsAPI.get(`/public?type=dataset&date=${new Date().toISOString()}`);
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
                    case "bookmarks":
                        items = await usersAPI.get(`/bookmarked?date=${date}`);
                        break;
                    case "public-workspaces":
                        items = await itemsAPI.get(`/public?type=workspace&date=${date}`);
                        break;
                    case "public-datasets":
                        items = await itemsAPI.get(`/public?type=dataset&date=${date}`);
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
            if (type === "public-workspaces" || type === "public-datasets") {
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
                heading = "Your Workspaces"
                break;
            case "created-datasets":
                heading = "Your Datasets"
                break;
            case "bookmarks":
                heading = "Your Bookmarks"
                break;
            case "public-workspaces":
                heading = "Public Workspaces"
                break;
            case "public-datasets":
                heading = "Public Datasets"
                break;
        }

        return <h1>{heading}</h1>
    }
    
    return (
        <>
            {loaded &&
                <div className="main-body">
                    <div className="sidebar">
                        <div className="home-search">
                            <input className="home-search-input" 
                                    placeholder="Search"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={searchFunctionKey} />
                            <SearchIcon className="home-search-icon" onClick={e => searchFunctionButton()} />
                        </div>
                        <div className="sidebar-divided" />
                        <Link className="home-options-link" to="/public-workspaces">
                            <p>Public Workspaces</p>
                            <ArrowForwardIosIcon className="home-options-icon" />
                        </Link>
                        <Link className="home-options-link" to="public-datasets">
                            <p>Public Datasets</p>
                            <ArrowForwardIosIcon className="home-options-icon" />
                        </Link>
                        <div className="sidebar-divided" />
                        <Shortcut type={"workspaces"} />
                        <div className="sidebar-divided" />
                        <Shortcut type={"datasets"} />
                        <div className="sidebar-divided" />
                        <Shortcut type={"bookmarks"} />
                    </div>
                    <div className="inner">
                        <div className="home-inner">
                            <div className="view-items-top">
                                {displayHeading()}
                                {type === "created-workspaces" && <Link to="/create-workspace" className="blue-button">Create Workspace</Link>}
                                {type === "created-datasets" && <Link to="/create-dataset" className="blue-button">Create Dataset</Link>}
                                <div className="toggle-card-type">
                                    <span />
                                    <img src="http://localhost:3000/List.png" className="toggle-card-type-row-icon" onClick={() => {setRowFormat(true)}} />
                                    <img src="http://localhost:3000/Grid.png" className="toggle-card-type-grid-icon" onClick={() => {setRowFormat(false)}} />
                                </div>
                            </div>
                            {(type === "created-workspaces" || type === "public-workspaces") ?
                                <p className="view-items-results">{`${items.length} Workspaces`}</p>
                            : (type === "created-datasets" || type === "public-datasets") ?
                                <p className="view-items-results">{`${items.length} Datasets`}</p>
                            :
                                <p className="view-items-results">{`${items.length} Bookmarks`}</p>
                            }
                            <div className="view-items-list">
                                {items.length > 0 &&
                                    <>
                                        {items.map((item, i) => {
                                            if (type === "created-workspaces" || type === "created-datasets") return rowFormat ? <ItemRowCard item={item} created={true} key={i} /> : <ItemSquareCard item={item} created={true} key={i} />

                                            return rowFormat ?
                                                <ItemRowCard item={item} creator={item.creatorName.name} currentUserID={currentUser.id} created={currentUser.id === item.creator} key={i} /> 
                                                : 
                                                <ItemSquareCard item={item} creator={item.creatorName.name} currentUserID={currentUser.id} created={currentUser.id === item.creator} key={i} />
                                        })}
                                    </>
                                }
                            </div>
                            {items.length >= 0 && finishedItems ?
                                <p className="end-items">End reached</p>
                                :
                                <p className="load-items" onClick={() => {loadMore()}}>Load more</p>
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ViewItems