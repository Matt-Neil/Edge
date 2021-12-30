import React from 'react'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import ProjectHeader from '../Components/Project-Header'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Header = ({currentUser, openProjects}) => {
    return (
        <div className="header">
            <Link to="/home" className="header-home">Home</Link>
            <div className="header-open">
                {openProjects.length !== 0 ?
                    <>
                        {openProjects.map((project, i) => {
                            return <ProjectHeader project={project} key={i} />
                        })}
                    </>
                :
                    <p>No Projects Open</p>
                }
            </div>
            <Link to="/new-project" className="header-new-project">
                <AddIcon style={{ fontSize: 20, color: "#2383F3" }} />
            </Link>
            <span />
            <Link to="/account" className="header-account">
                <AccountCircleIcon style={{ fontSize: 20, color: "#474747" }} />
                <p>{currentUser.username}</p>
            </Link>
        </div>
    )
}

export default Header