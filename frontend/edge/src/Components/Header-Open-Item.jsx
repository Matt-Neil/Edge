import React, {useState, useContext} from 'react'
import { useLocation, Link, useHistory } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close';
import { OpenItemsContext } from '../Contexts/openItemsContext';

const HeaderOpenItems = ({item}) => {
    const [mouseOver, setMouseOver] = useState(false)
    const history = useHistory();
    const location = useLocation();
    const {removeOpenItems} = useContext(OpenItemsContext);

    // Checks if the currently displayed page is in the array of open items
    const checkCurrent = () => {
        if (location.pathname.substring(11) === item.id || location.pathname.substring(9) === item.id) return true

        return false
    }

    // Removes item from the array in the context provider
    const closeItem = () => {
        removeOpenItems(item.id)
        
        if (checkCurrent()) {
            history.replace("/home")
        }
    }

    return (
        <div className={`item-header ${checkCurrent() && "item-header-selected"}`}
                onMouseEnter={() => {setMouseOver(true)}}
                onMouseLeave={() => {setMouseOver(false)}}>
            {item.type === "workspace" ? 
                <>
                    {(checkCurrent() || mouseOver) ? 
                        <img src="http://localhost:3000/workspace.png" /> 
                    : 
                        <img src="http://localhost:3000/workspace-grey.png" />
                    } 
                </>
            : 
                <>  
                    {(checkCurrent() || mouseOver) ? 
                        <img src="http://localhost:3000/dataset.png" /> 
                    :
                        <img src="http://localhost:3000/dataset-grey.png" />
                    }
                </>
            }
            <Link to={item.type === "workspace" ? `/workspace/${item.id}` : `/dataset/${item.id}`} className="item-header-link">
                <p className={`item-header-title ${(checkCurrent() || mouseOver) && "item-header-title-selected"}`}>{item.title}</p>
            </Link>
            <CloseIcon className="item-header-close" onClick={() => {closeItem()}} />
        </div>
    )
}

export default HeaderOpenItems