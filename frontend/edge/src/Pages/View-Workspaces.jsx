import React, {useState, useEffect} from 'react'
import {useHistory, Link} from "react-router-dom"
import WorkspaceRowCard from '../Components/Workspace-Row-Card'
import WorkspaceSquareCard from '../Components/Workspace-Square-Card'
import usersAPI from '../API/users'
import workspacesAPI from '../API/workspaces'
import SearchIcon from '@mui/icons-material/Search';

const AccountWorkspaces = ({type, currentUser, setSearchPhrase}) => {
    const [workspaces, setWorkspaces] = useState();
    const [loaded, setLoaded] = useState(false);
    const [rowFormat, setRowFormat] = useState(false)
    const [input, setInput] = useState("");
    const [finishedWorkspaces, setFinishedWorkspaces] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let workspaces;

                if (type === "created") {
                    workspaces = await usersAPI.get(`/created?date=${new Date().toISOString()}`);
                } else if (type === "bookmark") {
                    workspaces = await usersAPI.get(`/bookmarked?date=${new Date().toISOString()}`);
                } else if (type === "all") {
                    workspaces = await workspacesAPI.get(`/all?date=${new Date().toISOString()}`);
                } else {
                    workspaces = await workspacesAPI.get("/discover");
                }

                if (type !== "discover" && workspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                setWorkspaces(workspaces.data.data);
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

    const fetchDiscover = async () => {
        const refreshedWorkspaces = await workspacesAPI.get("/discover");

        setWorkspaces(refreshedWorkspaces.data.data);
    }
    
    const fetchDataWorkspaces = async (date) => {
        if (!finishedWorkspaces) {
            try {
                let fetchedWorkspaces;

                if (type === "created") {
                    fetchedWorkspaces = await usersAPI.get(`/created?date=${date}`);
                } else if (type === "bookmark") {
                    fetchedWorkspaces = await usersAPI.get(`/bookmarked?date=${date}`);
                } else {
                    fetchedWorkspaces = await workspacesAPI.get(`/all?date=${date}`);
                }
    
                if (fetchedWorkspaces.data.data.length < 21) {
                    setFinishedWorkspaces(true)
                }

                setWorkspaces(workspaces => [...workspaces, ...fetchedWorkspaces.data.data]);
            } catch (err) {}
        }
    }

    const loadMore = () => {
        if (workspaces.length !== 0) {
            if (type === "all") {
                {fetchDataWorkspaces(workspaces[workspaces.length-1].createdAt)}
            } else {
                {fetchDataWorkspaces(workspaces[workspaces.length-1].updatedAt)}
            }
        }
    };

    const displayHeading = () => {
        if (type === "created") {
            return <h1>My Workspaces</h1>
        } else if (type === "bookmark") {
            return <h1>Bookmarked Workspaces</h1>
        } else if (type === "all") {
            return <h1>All Workspaces</h1>
        } else {
            return <h1>Discover Workspaces</h1>
        }
    }
    
    return (
        <>
            {loaded &&
                <div className="width-body">  
                    <div className="view-workspaces-body">
                        {(type === "discover" || type === "all") &&
                            <div className="view-workspaces-search">
                                <input className="view-workspaces-search-input"
                                        placeholder="Search"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyPress={searchFunctionKey} />
                                <SearchIcon className="view-workspaces-search-icon" onClick={e => searchFunctionButton()} />
                            </div>
                        }
                        <div className="view-workspaces-top">
                            {displayHeading()}
                            {type === "created" && <Link to="/new-workspace" className="blue-button">New Workspace</Link>}
                            {type === "discover" && <button className="blue-button" onClick={() => {fetchDiscover()}}>Refresh</button>}
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
                                        if (type === "created") return rowFormat ? <WorkspaceRowCard workspace={workspace} created={true} key={i} /> : <WorkspaceSquareCard workspace={workspace} created={true} key={i} />

                                        return rowFormat ? <WorkspaceRowCard workspace={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={type === "created"} key={i} /> : <WorkspaceSquareCard workspace={workspace} creator={workspace.creatorName.name} currentUserID={currentUser.id} created={type === "created"} key={i} />
                                    })}
                                </>
                            }
                        </div>
                        {type !== "discover" &&
                            <>
                                {workspaces.length > 0 && finishedWorkspaces ?
                                    <p className="endWorkspaces">No More Workspaces</p>
                                    :
                                    <p className="loadWorkspaces" onClick={() => {loadMore()}}>Load More</p>
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