import React from 'react'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import HeaderOpenItem from '../Components/Header-Open-Item'

const Header = ({openItems}) => {
    return (
        <div className="header">
            <Link to="/home" className="header-link">Home</Link>
            <Link to="/created-workspaces" className="header-link">Workspaces</Link>
            <Link to="/created-datasets" className="header-link">Datasets</Link>
            <div className="header-open">
                {openItems.length !== 0 ?
                    <>
                        {openItems.map((item, i) => {
                            return <HeaderOpenItem item={item} key={i} />
                        })}
                    </>
                :
                    <p>No items open</p>
                }
            </div>
            <span />
            <Link to="/account" className="header-account">
                <AccountCircleIcon className="header-account-icon" />
                <p>Account</p>
            </Link>
        </div>
    )
}

export default Header