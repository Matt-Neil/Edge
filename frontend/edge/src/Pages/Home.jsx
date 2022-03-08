import React, {useState, useEffect} from 'react'
import { Link, useHistory } from 'react-router-dom'
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
    const [rowFormat, setRowFormat] = useState(false)
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recent = await usersAPI.get("/recent");

                setRecent(recent.data.data);
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
                                <h1>Recently Updated</h1>
                                <div className="toggle-card-type">
                                    <span />
                                    <img src="http://localhost:3000/List.png" className="toggle-card-type-row-icon" onClick={() => {setRowFormat(true)}} />
                                    <img src="http://localhost:3000/Grid.png" className="toggle-card-type-grid-icon" onClick={() => {setRowFormat(false)}} />
                                </div>
                            </div>
                            <div className="view-items-list">
                                {recent.length > 0 &&
                                    <>
                                        {recent.map((item, i) => {
                                            return rowFormat ? <ItemRowCard item={item} created={true} key={i} /> : <ItemSquareCard item={item} created={true} key={i} />
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
