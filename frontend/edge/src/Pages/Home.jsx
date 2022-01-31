import React, {useState, useEffect} from 'react'
import { Link, useHistory } from 'react-router-dom'
import globalAPI from '../API/global'
import ItemFeedCard from '../Components/Item-Feed-Card'
import Shortcut from '../Components/Shortcut';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Home = ({setSearchPhrase, currentUser}) => {
    const [feed, setFeed] = useState()
    const [loaded, setLoaded] = useState(false)
    const [input, setInput] = useState("");
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const feed = await globalAPI.get("/feed");

                setFeed(feed.data.data);
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
                        <Shortcut type="workspaces" currentUserID={currentUser.id} />
                        <Shortcut type="datasets" currentUserID={currentUser.id} />
                        <Shortcut type="bookmarked-workspaces" currentUserID={currentUser.id} />
                        <Shortcut type="bookmarked-datasets" currentUserID={currentUser.id} />
                    </div>
                    <div className="home-middle-column">
                        <div className="home-feed">
                            {feed.map((item, i) => {
                                return <ItemFeedCard item={item} creator={item.creatorName.name} key={i} />
                            })}
                            <p className="blue">End of feed</p>
                        </div>
                    </div>
                    <div className="home-right-column">
                        <Link to="/all-workspaces" className="home-filter-workspaces">
                            <p className="home-filter-workspaces-heading">All Workspaces</p>
                            <ArrowForwardIosIcon className="home-filter-workspaces-icon" />
                        </Link>
                        <Link to="/all-datasets" className="home-filter-workspaces">
                            <p className="home-filter-workspaces-heading">All Datasets</p>
                            <ArrowForwardIosIcon className="home-filter-workspaces-icon" />
                        </Link>
                    </div>
                </div>
            }
        </>
    )
}

export default Home
