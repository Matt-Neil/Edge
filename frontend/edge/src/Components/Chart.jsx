import React from 'react'
import { Line } from 'react-chartjs-2';
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

// Receives x and y axis data along with the type of chart through props
const ChartComponent = ({x, y1, y2, type}) => {
    return (
        <div className="chart">
            {/* Sets chart title */}
            <p className="chart-title">{type} / Epochs</p>
            <Line 
                data={{
                    // Sets x axis data
                    labels: x,
                    // Sets both y axis data and their styles
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
                        // Sets position of legend
                        legend: {
                            display: true,
                            position: 'right'
                        }
                    },
                    // Sets styles of x and y axis scales
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
                    // Prevents chart from resizing canvas when window is resized
                    maintainAspectRatio: false,
                    // Prevents chart from resizing when container is resized
                    responsive: false,
                    // Prevents chart animations
                    animation: false
                }}
                // Sets chart dimensions
                height={400} 
                width={650}
            />
        </div>
    )
}

export default ChartComponent