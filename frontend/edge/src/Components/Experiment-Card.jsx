import React, {useState, useEffect} from 'react'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const ExperimentCard = ({experiment, created}) => {
    const [date, setDate] = useState("");
    const [visibility, setVisibility] = useState(experiment.visibility)

    useEffect(() => {
        const updatedDate = new Date(experiment.updatedAt);
        const currentDate = new Date();

        if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 365) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 365)).toString()} year(s) ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 30) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) % 30).toString())} month(s) ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24) >= 1) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600 * 24))).toString()} day(s) ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600) >= 1) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 3600))).toString()} hour(s) ago`)
        } else if ((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60) >= 1) {
            setDate(`Updated ${Math.floor(((currentDate.getTime() - updatedDate.getTime()) / (1000 * 60))).toString()} minute(s) ago`)
        } else {
            setDate("Updated just now")
        }
    }, [])

    const updateVisibility = async () => {
        try {
            //await globalAPI.put(`/visibility/${item._id}?state=${visibility}`);

            setVisibility(state => !state)
        } catch (err) {}
    }

    return (
        <div className="experiment-card">
            <p className="experiment-card-title">{experiment.title}</p>
            <p className="experiment-card-date">{date}</p>
            {created &&
                <>
                    {visibility ? 
                        <VisibilityIcon className="experiment-card-icon" onClick={() => {updateVisibility()}} />
                    :
                        <VisibilityOffIcon className="experiment-card-icon" onClick={() => {updateVisibility()}} />
                    }
                    <DeleteIcon className="experiment-card-icon" />
                </>
            }
        </div>
    )
};

export default ExperimentCard;
