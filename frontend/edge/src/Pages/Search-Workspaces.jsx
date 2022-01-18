import React, {useState, useEffect} from 'react'
import {useHistory, Link, useParams} from "react-router-dom"
import WorkspaceRowCard from '../Components/Workspace-Row-Card'
import WorkspaceSquareCard from '../Components/Workspace-Square-Card'
import workspacesAPI from '../API/workspaces'
import GridOnIcon from '@mui/icons-material/GridOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';

const AccountWorkspaces = ({type}) => {
    const [workspaces, setWorkspaces] = useState();
    const [loaded, setLoaded] = useState(false);
    const [rowFormat, setRowFormat] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspaces = await workspacesAPI.get("/");

                setWorkspaces(workspaces.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    return (
        <>
            {loaded &&
                <div className="width-body">  
                    <div className="view-workspaces-body">
                        <div className="view-workspaces-search">
                            <input className="view-workspaces-search-input" placeholder="Search" />
                            <SearchIcon className="view-workspaces-search-icon" />
                        </div>
                        <div className="view-workspaces-top">
                            <h1>Search Results</h1>
                            {type === "self" && <Link to="/new-workspace" className="blue-button">New Workspace</Link>}
                        </div>
                        <div className="view-workspaces-middle">
                            <p>{`${workspaces.length} Workspaces`}</p>
                            <ListAltIcon className="view-workspaces-row-icon" onClick={() => {setRowFormat(true)}} />
                            <GridOnIcon className="view-workspaces-grid-icon" onClick={() => {setRowFormat(false)}} />
                        </div>
                        <div className="view-workspaces-list">
                            {workspaces.map((workspace, i) => {
                                return rowFormat ? <WorkspaceRowCard workspace={workspace} self={type === "self"} key={i} /> : <WorkspaceSquareCard workspace={workspace} self={type === "self"} key={i} />
                            })}
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default AccountWorkspaces