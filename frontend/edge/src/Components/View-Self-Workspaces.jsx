import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom';
import usersAPI from '../API/users'
import { OpenWorkspacesContext } from '../Contexts/openWorkspacesContext';
import AddIcon from '@mui/icons-material/Add';

const ViewSelfWorkspaces = ({bookmarked}) => {
    const {addOpenWorkspaces} = useContext(OpenWorkspacesContext);
    const [createdWorkspaces, setCreatedWorkspaces] = useState();
    const [bookmarkedWorkspaces, setBookmarkedWorkspaces] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const createdWorkspaces = await usersAPI.get(`/createdShort`);
                const bookmarkedWorkspaces = await usersAPI.get(`/bookmarkedShort`);

                setCreatedWorkspaces(createdWorkspaces.data.data);
                setBookmarkedWorkspaces(bookmarkedWorkspaces.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    return (
        <>
            {loaded &&
                <div className="home-my-workspaces-container">
                    <div className="home-my-workspaces-heading">
                        <p>{bookmarked ? "Bookmarked Workspaces" : "My Workspaces"}</p>
                        {!bookmarked && 
                            <Link to="/new-project">
                                <AddIcon className="home-my-workspaces-new-workspace-icon" />
                            </Link>
                        }
                    </div>
                    <div className="home-my-workspaces-list">
                        {!bookmarked && 
                            <>
                                {createdWorkspaces.map((workspace, i) => {
                                    return (
                                        <Link to={`/workspace/${workspace._id}`} 
                                                className="home-my-workspaces-item" 
                                                onClick={() => {addOpenWorkspaces(workspace._id, workspace.title)}}>
                                            <img src={`http://localhost:4000/images/${workspace.picture}`} />
                                            <p>{workspace.title}</p>
                                        </Link>
                                    )
                                })}
                            </>
                        }
                        {bookmarked &&
                            <>
                                {bookmarkedWorkspaces.map((workspace, i) => {
                                    return (
                                        <Link to={`/workspace/${workspace._id}`} className="home-my-workspaces-item">
                                            <img src={`http://localhost:4000/images/${workspace.picture}`} />
                                            <p>{workspace.title}</p>
                                        </Link>
                                    )
                                })}
                            </>
                        }
                        <Link to={bookmarked ? "/bookmarked-workspaces" : "/my-workspaces"} className="home-my-workspaces-all">See All</Link>
                    </div>
                </div>
            }
        </>
    )
}

export default ViewSelfWorkspaces
