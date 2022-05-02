import React, {useState, useEffect, useContext} from 'react'
import { Link, useHistory } from 'react-router-dom'
import { CardFormatContext } from '../Contexts/cardFormatContext';
import usersAPI from '../API/users'
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ItemRowCard from '../Components/Item-Row-Card'
import ItemSquareCard from '../Components/Item-Square-Card'
import Shortcut from '../Components/Shortcut';

const Home = ({setSearchPhrase}) => {
    const [recent, setRecent] = useState()
    const [loaded, setLoaded] = useState(false)
    const [input, setInput] = useState("");
    const {cardFormat, changeCardFormat} = useContext(CardFormatContext);
    const history = useHistory();

    // Whenever the home page is rendered the useEffect hook is executed to fetch content
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Creates GET request to fetch all the workspaces and datasets created by the current user sorted by most recent
                const recent = await usersAPI.get("/recent");

                setRecent(recent.data.data);
                setLoaded(true);
            } catch (err) {}
        }
        fetchData();
    }, [])

    // Searches for user input when enter key is pressed
    const searchFunctionKey = (e) => {
        if (e.key === "Enter" && input !== "") {
            // Sets application local state variable to contain user input
            setSearchPhrase(input);
            // Redirects to search page
            history.push(`/search-results/${input}`);
        }
    }

    // Searches for user input when search button is clicked
    const searchFunctionButton = () => {
        if (input !== "") {
            // Sets application local state variable to contain user input
            setSearchPhrase(input);
            // Redirects to search page
            history.push(`/search-results/${input}`);
        }
    }

    return (
        <>
            {loaded &&
                <div className="main-body">
                    <div className="sidebar">
                        <div className="home-search">
                            <input className="home-search-input" 
                                    placeholder="Search"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={searchFunctionKey} />
                            <SearchIcon className="home-search-icon" onClick={e => searchFunctionButton()} />
                        </div>
                        <div className="sidebar-divided" />
                        <Link className="home-options-link" to="/public-workspaces">
                            <p>Public Workspaces</p>
                            <ArrowForwardIosIcon className="home-options-icon" />
                        </Link>
                        <Link className="home-options-link" to="public-datasets">
                            <p>Public Datasets</p>
                            <ArrowForwardIosIcon className="home-options-icon" />
                        </Link>
                        <div className="sidebar-divided" />
                        <Shortcut type={"workspaces"} />
                        <div className="sidebar-divided" />
                        <Shortcut type={"datasets"} />
                        <div className="sidebar-divided" />
                        <Shortcut type={"bookmarked"} />
                    </div>
                    <div className="inner">
                        <div className="home-inner">
                            <div className="view-items-top">
                                <h1>Your Recents</h1>
                                <div className="toggle-card-type">
                                    <span />
                                    <img src="http://localhost:3000/List.png" className="toggle-card-type-row-icon" onClick={() => {changeCardFormat()}} />
                                    <img src="http://localhost:3000/Grid.png" className="toggle-card-type-grid-icon" onClick={() => {changeCardFormat()}} />
                                </div>
                            </div>
                            <div className="view-items-list">
                                {recent.length > 0 &&
                                    <>
                                        // Loops through all workspaces and datasets fetched
                                        {recent.map((item, i) => {
                                            // Displays workspaces and datasets in a card
                                            return cardFormat ? <ItemRowCard item={item} created={true} key={i} /> : <ItemSquareCard item={item} created={true} key={i} />
                                        })}
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default Home
