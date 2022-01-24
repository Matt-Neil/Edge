import React, {useState, useEffect} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import WorkspaceRowCard from '../Components/Workspace-Row-Card'
import WorkspaceSquareCard from '../Components/Workspace-Square-Card'
import workspacesAPI from '../API/workspaces'
import SearchIcon from '@mui/icons-material/Search';

const AccountWorkspaces = ({searchPhrase, setSearchPhrase, currentUser}) => {
    const [workspaces, setWorkspaces] = useState();
    const [loaded, setLoaded] = useState(false);
    const [rowFormat, setRowFormat] = useState(false)
    const [input, setInput] = useState("");
    const [finishedWorkspaces, setFinishedWorkspaces] = useState(false);
    const urlPhrase = useParams().id;
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            if (searchPhrase === null) {
                if (urlPhrase) {
                    const workspaces = await workspacesAPI.get(`/search?phrase=${urlPhrase}`);

                    if (workspaces.data.data.length < 21) {
                        setFinishedWorkspaces(true)
                    }

                    setWorkspaces(workspaces.data.data);
                    setLoaded(true);
                } else {
                    history.push("/");
                }
            } else {
                const workspaces = await workspacesAPI.get(`/search?phrase=${searchPhrase}`);

                if (workspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                setWorkspaces(workspaces.data.data);
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
                const fetchedWorkspaces = await workspacesAPI.get(`/search?phrase=${urlPhrase}&id=${id}`);
    
                if (fetchedWorkspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                setWorkspaces(workspaces => [...workspaces, ...fetchedWorkspaces.data.data]);
            } catch (err) {}
        }
    }

    const loadMore = () => {
        if (workspaces.length !== 0) {
            {fetchDataWorkspaces(workspaces[workspaces.length-1]._id)}
        }
    };

    return (
        <>
            {loaded &&
                <div className="width-body">  
                    <div className="view-workspaces-body">
                        <div className="view-workspaces-search">
                            <input className="view-workspaces-search-input"
                                    placeholder="Search"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={searchFunctionKey} />
                            <SearchIcon className="view-workspaces-search-icon" onClick={e => searchFunctionButton()} />
                        </div>
                        <div className="view-workspaces-top">
                            <h1>Search Results</h1>
                        </div>
                        <div className="view-workspaces-middle">
                            <p>{`${workspaces.length} Workspaces`}</p>
                            <img src="http://localhost:3000/List.png" className="view-workspaces-row-icon" onClick={() => {setRowFormat(true)}} />
                            <img src="http://localhost:3000/Grid.png" className="view-workspaces-grid-icon" onClick={() => {setRowFormat(false)}} />
                        </div>
                        <div className="view-workspaces-list">
                            {workspaces.length > 0 &&
                                <>
                                    {workspaces.map((workspace, i) => {
                                        return rowFormat ? <WorkspaceRowCard workspace={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={false} key={i} /> : <WorkspaceSquareCard workspace={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={false} key={i} />
                                    })}
                                </>
                            }
                        </div>
                        {workspaces.length >= 0 && finishedWorkspaces ?
                            <p className="endWorkspaces">No More Workspaces</p>
                            :
                            <p className="loadWorkspaces" onClick={() => {loadMore()}}>Load More</p>
                        }
                    </div>
                </div>
            }
        </>
    )
}

export default AccountWorkspaces