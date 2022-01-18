import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import FeedWorkspaceCard from '../Components/Feed-Workspace-Card'
import ViewSelfWorkspaces from '../Components/View-Self-Workspaces';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Home = () => {
    return (
        <div className="width-body">
            <div className="home-left-column">
                <div className="home-search">
                    <input className="home-search-input" placeholder="Search" />
                    <SearchIcon className="home-search-icon" />
                </div>
                <ViewSelfWorkspaces bookmarked={false} />
                <ViewSelfWorkspaces bookmarked={true} />
            </div>
            <div className="home-middle-column">
                <div className="home-feed">
                    <p className="home-feed-heading">Feed</p>
                    <div className="home-feed-workspaces">
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                        <FeedWorkspaceCard workspace={{_id: "jaskd"}} />
                    </div>
                </div>
            </div>
            <div className="home-right-column">
                <Link to="/all-workspaces" className="home-filter-workspaces">
                    <p className="home-filter-workspaces-heading">All Workspaces</p>
                    <ArrowForwardIosIcon className="home-filter-workspaces-icon" />
                </Link>
                <Link to="/popular-workspaces" className="home-filter-workspaces">
                    <p className="home-filter-workspaces-heading">Popular Workspaces</p>
                    <ArrowForwardIosIcon className="home-filter-workspaces-icon" />
                </Link>
            </div>
        </div>
    )
}

export default Home
