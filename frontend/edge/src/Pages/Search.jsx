import React, {useState, useEffect} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import globalAPI from '../API/global'
import SearchIcon from '@mui/icons-material/Search';

const AccountWorkspaces = ({searchPhrase, setSearchPhrase, currentUser}) => {
    const [filter, setFilter] = useState("workspaces")
    const [workspaces, setWorkspaces] = useState();
    const [datasets, setDatasets] = useState();
    const [loaded, setLoaded] = useState(false);
    const [rowFormat, setRowFormat] = useState(false)
    const [input, setInput] = useState("");
    const [finishedWorkspaces, setFinishedWorkspaces] = useState(false);
    const [finishedDatasets, setFinishedDatasets] = useState(false);
    const urlPhrase = useParams().id;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            if (searchPhrase === null) {
                if (urlPhrase) {
                    const workspaces = await globalAPI.get(`/search?phrase=${urlPhrase}&type=workspace`);
                    const datasets = await globalAPI.get(`/search?phrase=${urlPhrase}&type=dataset`);

                    if (workspaces.data.data.length < 21) {
                        setFinishedWorkspaces(true)
                    }

                    if (datasets.data.data.length < 21) {
                        setFinishedDatasets(true)
                    }

                    setWorkspaces(workspaces.data.data);
                    setDatasets(datasets.data.data);
                    setLoaded(true);
                } else {
                    history.push("/home");
                }
            } else {
                const workspaces = await globalAPI.get(`/search?phrase=${searchPhrase}&type=workspace`);
                const datasets = await globalAPI.get(`/search?phrase=${searchPhrase}&type=dataset`);

                if (workspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                if (datasets.data.data.length < 21) {
                    setFinishedDatasets(true)
                }

                setWorkspaces(workspaces.data.data);
                setDatasets(datasets.data.data);
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

    const fetchDataWorkspaces = async (id) => {
        if (!finishedWorkspaces) {
            try {
                const fetchedWorkspaces = await globalAPI.get(`/search?phrase=${urlPhrase}&type=workspace&id=${id}`);
    
                if (fetchedWorkspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                setWorkspaces(workspaces => [...workspaces, ...fetchedWorkspaces.data.data]);
            } catch (err) {}
        }
    }

    const fetchDataDatasets = async (id) => {
        if (!finishedDatasets) {
            try {
                const fetchedDatasets = await globalAPI.get(`/search?phrase=${urlPhrase}&type=dataset&id=${id}`);
    
                if (fetchedDatasets.data.data.length < 21) {
                    setFinishedDatasets(true)
                }

                setDatasets(datasets => [...datasets, ...fetchedDatasets.data.data]);
            } catch (err) {}
        }
    }

    const loadMore = () => {
        if (workspaces.length !== 0 && filter === "workspaces") {
            {fetchDataWorkspaces(workspaces[workspaces.length-1]._id)}
        }

        if (datasets.length !== 0 && filter === "datasets") {
            {fetchDataDatasets(datasets[datasets.length-1]._id)}
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
                            <SearchIcon className="view-items-search-icon" onClick={e => searchFunctionButton()} />
                        </div>
                        <div className="view-items-top">
                            <h1>Search Results</h1>
                            <select className="view-items-search-select" onChange={e => {setFilter(e.target.value)}}>
                                <option value="workspaces">Workspaces</option>
                                <option value="datasets">Datasets</option>
                            </select>
                        </div>
                        <div className="view-items-middle">
                            {filter === "workspaces" ?
                                <p>{`${workspaces.length} Workspaces`}</p>
                            :
                                <p>{`${datasets.length} Datasets`}</p>
                            }
                            <img src="http://localhost:3000/List.png" className="view-items-row-icon" onClick={() => {setRowFormat(true)}} />
                            <img src="http://localhost:3000/Grid.png" className="view-items-grid-icon" onClick={() => {setRowFormat(false)}} />
                        </div>
                        <div className="view-items-list">
                            {workspaces.length > 0 && filter === "workspaces" &&
                                <>
                                    {workspaces.map((workspace, i) => {
                                        return rowFormat ? <ItemRowCard item={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={false} key={i} /> : <ItemSquareCard item={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={false} key={i} />
                                    })}
                                </>
                            }
                            {datasets.length > 0 && filter === "datasets" &&
                                <>
                                    {datasets.map((dataset, i) => {
                                        return rowFormat ? <ItemRowCard item={dataset} creator={dataset.creatorName.name} currentUserID={currentUser.id} created={false} key={i} /> : <ItemSquareCard item={dataset} creator={dataset.creatorName.name} currentUserID={currentUser.id} created={false} key={i} />
                                    })}
                                </>
                            }
                        </div>
                        {filter === "workspaces" ?
                            <>
                                {workspaces.length >= 0 && finishedWorkspaces ?
                                    <p className="end-items">No more workspaces</p>
                                    :
                                    <p className="load-items" onClick={() => {loadMore()}}>Load more</p>
                                }
                            </>
                        :
                            <>
                                {datasets.length >= 0 && finishedDatasets ?
                                    <p className="end-items">No more datasets</p>
                                    :
                                    <p className="load-items" onClick={() => {loadMore()}}>Load more</p>
                                }
                            </>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default AccountWorkspaces