import React from 'react'
import { Line } from 'react-chartjs-2';
import Chart from '../Components/Chart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ChartComponent = ({x, y1, y2, type}) => {
    return (
        <div className="chart">
            <p className="chart-title">{type} / Epochs</p>
            <Line 
                data={{
                    labels: x,
                    datasets: [
                        {
                            label: `Training ${type}`,
                            data: y1,
                            borderColor: '#3C51F9',
                            tension: 0,
                            backgroundColor: ['#FBFBFB'],
                        },
                        {
                            label: `Validation ${type}`,
                            fill: false,
                            borderDash: [5, 5],
                            data: y2,
                            borderColor: '#3C51F9',
                            tension: 0,
                            backgroundColor: ['#FBFBFB'],
                        }
                    ],
                }} 
                options={{
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right'
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Epochs',
                                color: '#FBFBFB',
                                padding: {top: 10, left: 0, right: 0, bottom: 0}
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: type,
                                color: '#FBFBFB',
                                padding: {top: 0, left: 0, right: 0, bottom: 10}
                            }
                        }
                    },
                    maintainAspectRatio: false,
                    responsive: false,
                    animation: false
                }}
                height={400} 
                width={650}
            />
        </div>
    )
}

export default ChartComponent