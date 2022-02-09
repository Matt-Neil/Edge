import React, {useState, useEffect} from 'react'
import {useHistory, useParams} from "react-router-dom"
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import globalAPI from '../API/global'
import SearchIcon from '@mui/icons-material/Search';

const AccountWorkspaces = ({searchPhrase, setSearchPhrase, currentUser}) => {
    const [items, setItems] = useState();
    const [loaded, setLoaded] = useState(false);
    const [rowFormat, setRowFormat] = useState(false)
    const [input, setInput] = useState("");
    const [finishedItems, setFinishedItems] = useState(false);
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
                <div className="width-body">  
                    <div className="view-items-body">
                        <div className="view-items-search">
                            <input className="view-items-search-input"
                                    placeholder="Search"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={searchFunctionKey} />
                            <SearchIcon className="view-items-search-icon" onClick={() => searchFunctionButton()} />
                        </div>
                        <div className="view-items-top">
                            <h1>Search Results</h1>
                        </div>
                        <div className="view-items-middle">
                            <p>{`${items.length} Results`}</p>
                            <img src="http://localhost:3000/List.png" className="view-items-row-icon" onClick={() => {setRowFormat(true)}} />
                            <img src="http://localhost:3000/Grid.png" className="view-items-grid-icon" onClick={() => {setRowFormat(false)}} />
                        </div>
                        <div className="view-items-list">
                            {items.length > 0 &&
                                <>
                                    {items.map((item, i) => {
                                        return rowFormat ? 
                                            <ItemRowCard item={item} creator={item.creatorName.name} currentUserID={currentUser.id} created={false} key={i} /> 
                                            : 
                                            <ItemSquareCard item={item} creator={item.creatorName.name} currentUserID={currentUser.id} created={false} key={i} />
                                    })}
                                </>
                            }
                        </div>
                        {items.length >= 0 && finishedItems ?
                            <p className="end-items">No more results</p>
                            :
                            <p className="load-items" onClick={() => {loadMore()}}>Load more</p>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default AccountWorkspaces