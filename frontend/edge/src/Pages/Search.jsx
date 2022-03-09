import React, {useState, useEffect, useContext} from 'react'
import {Link, useHistory, useParams} from "react-router-dom"
import { CardFormatContext } from '../Contexts/cardFormatContext';
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import globalAPI from '../API/global'
import SearchIcon from '@mui/icons-material/Search';
import Shortcut from '../Components/Shortcut'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const AccountWorkspaces = ({searchPhrase, setSearchPhrase, currentUser}) => {
    const [items, setItems] = useState();
    const [loaded, setLoaded] = useState(false);
    const [input, setInput] = useState("");
    const [finishedItems, setFinishedItems] = useState(false);
    const {cardFormat, changeCardFormat} = useContext(CardFormatContext);
    const urlPhrase = useParams().id;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            if (searchPhrase === null) {
                if (urlPhrase) {
                    const items = await globalAPI.get(`/search?phrase=${urlPhrase}`);

                    if (items.data.data.length < 21) {
                        setFinishedItems(true)
                    }

                    setItems(items.data.data);
                    setLoaded(true);
                } else {
                    history.push("/home");
                }
            } else {
                const items = await globalAPI.get(`/search?phrase=${searchPhrase}`);

                if (items.data.data.length < 21) {
                    setFinishedItems(true)
                }

                setItems(items.data.data);
                setLoaded(true);
            }
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

    const fetchDataItems = async (id) => {
        if (!finishedItems) {
            try {
                const fetchedItems = await globalAPI.get(`/search?phrase=${urlPhrase}&id=${id}`);
    
                if (fetchedItems.data.data.length < 21) {
                    setFinishedItems(true)
                }

                setItems(items => [...items, ...fetchedItems.data.data]);
            } catch (err) {}
        }
    }

    const loadMore = () => {
        if (items.length !== 0) {
            {fetchDataItems(items[items.length-1]._id)}
        }
    };

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
                        <Shortcut type={"bookmarked"} />
                    </div>
                    <div className="inner">
                        <div className="home-inner">
                            <div className="view-items-top">
                                <h1>Search Results: {urlPhrase}</h1>
                                <div className="toggle-card-type">
                                    <span />
                                    <img src="http://localhost:3000/List.png" className="toggle-card-type-row-icon" onClick={() => {changeCardFormat()}} />
                                    <img src="http://localhost:3000/Grid.png" className="toggle-card-type-grid-icon" onClick={() => {changeCardFormat()}} />
                                </div>
                            </div>
                            <p className="view-items-results">{`${items.length} Results`}</p>
                            <div className="view-items-list">
                                {items.length > 0 &&
                                    <>
                                        {items.map((item, i) => {
                                            return cardFormat ? 
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

export default AccountWorkspaces