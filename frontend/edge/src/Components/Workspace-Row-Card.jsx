import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenWorkspacesContext } from '../Contexts/openWorkspacesContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const WorkspaceRowCard = ({workspace, self}) => {
    const {addOpenWorkspaces} = useContext(OpenWorkspacesContext);

    return (
        <Link to={`/workspace/${workspace._id}`} className="workspace-row-card" onClick={() => {addOpenWorkspaces(workspace._id, workspace.title)}}>
            <img src="https://via.placeholder.com/1000" />
            <div className="workspace-row-card-information">
                <p className="workspace-row-card-heading">{workspace.title}</p>
                <div>
                    {self && 
                        <>
                            {true ? 
                                <VisibilityIcon className="workspace-row-card-visibility" />
                            :
                                <VisibilityOffIcon className="workspace-row-card-visibility" />
                            }
                        </>
                    }
                    {!self && <p className="workspace-row-card-meta">Dylan Tate</p>}
                    <p className="workspace-row-card-meta">Updated 2 hours ago</p>
                </div>
            </div>
            <div>
                {!self && <BookmarkIcon className="workspace-row-card-icon" />}
                <ThumbUpIcon className="workspace-row-card-icon" />
                <p className="workspace-row-card-upvotes">128</p>
            </div>
        </Link>
    )
}

export default WorkspaceRowCard