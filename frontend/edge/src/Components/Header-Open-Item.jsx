import React, {useState, useContext, useEffect} from 'react'
import { useLocation, Link, useHistory } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close';
import { OpenItemsContext } from '../Contexts/openItemsContext';

const HeaderOpenItems = ({item}) => {
    const history = useHistory();
    const location = useLocation();
    const {removeOpenItems} = useContext(OpenItemsContext);

    const checkCurrent = () => {
        if (location.pathname.substring(11) === item.id || location.pathname.substring(9) === item.id) return true

        return false
    }

    const closeItem = () => {
        removeOpenItems(item.id)
        
        if (checkCurrent()) {
            history.replace("/home")
        }
    }

    return (
        <div className="item-header">
            {item.type === "workspace" ? <img src="http://localhost:3000/workspace.png" /> : <img src="http://localhost:3000/dataset.png" />}
            <Link to={item.type === "item" ? `/item/${item.id}` : `/dataset/${item.id}`} className="item-header-link">
                <p className={checkCurrent() ? "item-header-title-selected" : "item-header-title"}>{item.title}</p>
            </Link>
            <CloseIcon className={`item-header-close ${checkCurrent() && "blue"}`}
                        onClick={() => {closeItem()}} />
        </div>
    )
}

export default HeaderOpenItems