import React from 'react'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HeaderOpenItem from '../Components/Header-Open-Item'

const Header = ({openItems}) => {
    return (
        <div className="header">
            <Link to="/home" className="header-home">
                <img src="http://localhost:3000/home-icon.png" className="header-home-icon" />
            </Link>
            <div className="header-open">
                {openItems.length !== 0 &&
                    <>
                        {openItems.map((item, i) => {
                            return <HeaderOpenItem item={item} key={i} />
                        })}
                    </>
                }
            </div>
            <span />
            <Link to="/account" className="header-account">
                <AccountCircleIcon className="header-account-icon" />
            </Link>
        </div>
    )
}

export default Header