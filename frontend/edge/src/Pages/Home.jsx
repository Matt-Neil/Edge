import React, {useState, useEffect} from 'react'
import { Link, useHistory } from 'react-router-dom'
import workspacesAPI from '../API/workspaces'
import FeedWorkspaceCard from '../Components/Feed-Workspace-Card'
import ViewSelfWorkspaces from '../Components/View-Self-Workspaces';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Home = ({setSearchPhrase}) => {
    const [workspaces, setWorkspaces] = useState()
    const [loaded, setLoaded] = useState(false)
    const [input, setInput] = useState("");
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const workspaces = await workspacesAPI.get("/feed");

                setWorkspaces(workspaces.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && input !== "") {
            setSearchPhrase(input);
            history.push(`/search-results/${input}`);
        }
    }

    const searchFunctionButton = () => {
        if (input !== "") {
            setSearchPhrase(input);
            history.push(`/search-results/${input}`);
        }
    }

    return (
        <>
            {loaded &&
                <div className="width-body">
                    <div className="home-left-column">
                        <div className="home-search">
                            <input className="home-search-input" 
                                    placeholder="Search"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={searchFunctionKey} />
                            <SearchIcon className="home-search-icon" onClick={e => searchFunctionButton()} />
                        </div>
                        <ViewSelfWorkspaces bookmarked={false} />
                        <ViewSelfWorkspaces bookmarked={true} />
                    </div>
                    <div className="home-middle-column">
                        <div className="home-feed">
                            {workspaces.map((workspace, i) => {
                                return <FeedWorkspaceCard workspace={workspace} creator={workspace.creatorName.name} key={i} />
                            })}
                            <p className="blue">End of Feed</p>
                        </div>
                    </div>
                    <div className="home-right-column">
                        <Link to="/all-workspaces" className="home-filter-workspaces">
                            <p className="home-filter-workspaces-heading">All Workspaces</p>
                            <ArrowForwardIosIcon className="home-filter-workspaces-icon" />
                        </Link>
                        <Link to="/discover-workspaces" className="home-filter-workspaces">
                            <p className="home-filter-workspaces-heading">Discover Workspaces</p>
                            <ArrowForwardIosIcon className="home-filter-workspaces-icon" />
                        </Link>
                    </div>
                </div>
            }
        </>
    )
}

export default Home
