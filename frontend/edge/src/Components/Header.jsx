import React from 'react'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import HeaderOpenWorkspaces from '../Components/Header-Open-Workspaces'

const Header = ({currentUser, openWorkspaces}) => {
    return (
        <div className="header">
            <Link to="/home" className="header-link">Home</Link>
            <Link to="/my-workspaces" className="header-link">Workspaces</Link>
            <Link to="/bookmarked-workspaces" className="header-link">Bookmarked</Link>
            <div className="header-open">
                {openWorkspaces.length !== 0 ?
                    <>
                        {openWorkspaces.map((project, i) => {
                            return <HeaderOpenWorkspaces project={project} key={i} />
                        })}
                    </>
                :
                    <p>No Workspaces Open</p>
                }
            </div>
            <Link to="/new-project" className="header-new-project">
                <AddIcon className="header-new-project-icon" />
            </Link>
            <span />
            <Link to="/account" className="header-account">
                <AccountCircleIcon className="header-account-icon" />
                <p>{currentUser.name}</p>
            </Link>
        </div>
    )
}

export default Header