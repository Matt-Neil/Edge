import React from 'react'
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const ViewSelfWorkspaces = ({bookmarked}) => {
    return (
        <div className="home-my-workspaces-container">
            <div className="home-my-workspaces-heading">
                <p>{bookmarked ? "Bookmarked Workspaces" : "My Workspaces"}</p>
                {!bookmarked && 
                    <Link to="/new-project">
                        <AddIcon className="home-my-workspaces-new-project-icon" />
                    </Link>
                }
            </div>
            <div className="home-my-workspaces-list">
                <div className="home-my-workspaces-item">
                    <img src="https://via.placeholder.com/100" />
                    <p>Workspace 1</p>
                </div>
                <Link to={bookmarked ? "/bookmarked-workspaces" : "/my-workspaces"} className="home-my-workspaces-all">See All</Link>
            </div>
        </div>
    )
}

export default ViewSelfWorkspaces
