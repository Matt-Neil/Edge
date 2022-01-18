import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import { OpenWorkspacesContext } from '../Contexts/openWorkspacesContext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const WorkspaceSquareCard = ({workspace, self}) => {
    const {addOpenWorkspaces} = useContext(OpenWorkspacesContext);

    return (
        <Link to={`/workspace/${workspace._id}`} className="workspace-square-card" onClick={() => {addOpenWorkspaces(workspace._id, workspace.title)}}>
            <img src="https://via.placeholder.com/1000" />
            <p className="workspace-square-card-heading">{workspace.title}</p>
            <div>
                {self && 
                    <>
                        {true ? 
                            <VisibilityIcon className="workspace-square-card-visibility" />
                        :
                            <VisibilityOffIcon className="workspace-square-card-visibility" />
                        }
                    </>
                }
                {!self && <p className="workspace-square-card-meta">Dylan Tate</p>}
                <p className="workspace-square-card-meta">Updated 2 hours ago</p>
                {self && 
                    <>
                        <ThumbUpIcon className="workspace-square-card-icon" />
                        <p className="workspace-square-card-upvotes">128</p>
                    </>
                }
            </div>
            {!self &&
                <div className="workspace-square-card-other">
                    <BookmarkIcon className="workspace-square-card-icon" />
                    <ThumbUpIcon className="workspace-square-card-icon" />
                    <p className="workspace-square-card-upvotes">128</p>
                </div>
            }
        </Link>
    )
}

export default WorkspaceSquareCard