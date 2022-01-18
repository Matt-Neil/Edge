import React, {useContext} from 'react'
import { useLocation, Link, useHistory } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close';
import { OpenWorkspacesContext } from '../Contexts/openWorkspacesContext';

const HeaderOpenWorkspaces = ({workspace}) => {
    const workspaceID = useLocation().pathname.substring(9);
    const history = useHistory();
    const {removeOpenWorkspaces} = useContext(OpenWorkspacesContext);

    const closeWorkspace = () => {
        removeOpenWorkspaces(workspace.id)
        
        if (workspaceID === workspace.id) {
            history.replace("/home")
        }
    }

    return (
        <div className="workspace-header">
            <Link to={`/workspace/${workspace.id}`} className="workspace-header-link">
                <p className={workspaceID === workspace.id ? "workspace-header-title-selected" : "workspace-header-title"}>{workspace.title}</p>
            </Link>
            <CloseIcon className="workspace-header-close" 
                        style={{ fontSize: 14, color: workspaceID === workspace.id ? "#2383F3" : "#474747", cursor: "pointer" }}
                        onClick={() => {closeWorkspace()}} />
        </div>
    )
}

export default HeaderOpenWorkspaces