import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { useState } from 'react';

const RoutineProgress = ({ routines }) => {
    const [selectedPeriod, setSelectedPeriod] = useState("weekly");

    // Function to process data for different time periods
    const processRoutineData = (routine, period) => {
        if (!routine?.completionStats) return [];
        
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        // Filter and process completion stats
        const filteredStats = routine.completionStats.filter(stat => 
            new Date(stat.date) >= startDate
        ).map(stat => ({
            date: new Date(stat.date).toLocaleDateString(),
            weight: stat.weight || 0,
            time: stat.time || 0
        }));

        return filteredStats;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border">
                    <p className="text-sm text-gray-600">{`Date: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!routines || routines.length === 0) {
        return <div className="text-center p-4">No routine data available</div>;
    }

    return (
        <div className="space-y-8 w-full max-w-[1200px] mx-auto px-4 overflow-hidden">
            {/* Time Period Selection */}
            <div className="flex justify-center">
            <RadioGroup
                defaultValue="weekly"
                onValueChange={setSelectedPeriod}
                className="inline-flex bg-white rounded-lg p-1 shadow-sm border"
            >
                <div className="flex items-center">
                    <RadioGroupItem
                        value="weekly"
                        id="weekly"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="weekly"
                        className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                            selectedPeriod === "weekly"
                                ? "bg-emerald-500 text-white font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Weekly
                    </Label>
                </div>

                <div className="flex items-center">
                    <RadioGroupItem
                        value="monthly"
                        id="monthly"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="monthly"
                        className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                            selectedPeriod === "monthly"
                                ? "bg-emerald-500 text-white font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Monthly
                    </Label>
                </div>

                <div className="flex items-center">
                    <RadioGroupItem
                        value="yearly"
                        id="yearly"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="yearly"
                        className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                            selectedPeriod === "yearly"
                                ? "bg-emerald-500 text-white font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        Yearly
                    </Label>
                </div>
            </RadioGroup>
            </div>

            {/* Weight Progress Carousel */}
            <div className="mb-10">
                <h3 className="text-xl font-semibold mb-6 text-center">Total Weight Progress</h3>
                <Carousel className="w-full">
                    <CarouselContent>
                        {routines.map((routine, routineIndex) => (
                            <CarouselItem key={routineIndex}>
                                <div className="p-2 sm:p-4 md:p-6">
                                    <h4 className="text-lg font-medium mb-4 text-center">{routine?.name || 'Unnamed Routine'}</h4>
                                    <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full"> {/* Responsive height */}
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart 
                                                data={processRoutineData(routine, selectedPeriod)}
                                                margin={{ top: 20, right: 40, left: 0, bottom:0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    stroke="#6b7280"
                                                    tick={{ fontSize: '0.75rem' }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis 
                                                    stroke="#6b7280"
                                                    tick={{ fontSize: '0.75rem' }}
                                                    width={40}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    wrapperStyle={{ 
                                                        paddingTop: "20px",
                                                        fontSize: "0.875rem"
                                                    }} 
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="weight" 
                                                    stroke="hsl(160, 55%, 75%)"  // Soft mint green
                                                    name="Weight (lbs)"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: "hsl(160, 55%, 75%)" }}
                                                    activeDot={{ r: 6, fill: "hsl(160, 55%, 75%)" }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex justify-center gap-4 mt-6">
                        <CarouselPrevious className="relative left-0" />
                        <CarouselNext className="relative right-0" />
                    </div>
                </Carousel>
            </div>

            {/* Time Progress Carousel */}
            <div>
                <h3 className="text-xl font-semibold mb-6 text-center">Total Time Progress</h3>
                <Carousel className="w-full">
                    <CarouselContent>
                        {routines.map((routine, routineIndex) => (
                            <CarouselItem key={routineIndex}>
                                <div className="p-2 sm:p-4 md:p-6">
                                    <h4 className="text-lg font-medium mb-4 text-center">{routine?.name || 'Unnamed Routine'}</h4>
                                    <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart 
                                                data={processRoutineData(routine, selectedPeriod)}
                                                margin={{ top: 20, right: 40, left: 0, bottom:0 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    stroke="#6b7280"
                                                    tick={{ fontSize: '0.75rem' }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis 
                                                    stroke="#6b7280"
                                                    tick={{ fontSize: '0.75rem' }}
                                                    width={40}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    wrapperStyle={{ 
                                                        paddingTop: "20px",
                                                        fontSize: "0.875rem"
                                                    }} 
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="time" 
                                                    stroke="hsl(190, 55%, 75%)"  // Soft sky blue
                                                    name="Time (mins)"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, fill: "hsl(190, 55%, 75%)" }}
                                                    activeDot={{ r: 6, fill: "hsl(190, 55%, 75%)" }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex justify-center gap-4 mt-6">
                        <CarouselPrevious className="relative left-0" />
                        <CarouselNext className="relative right-0" />
                    </div>
                </Carousel>
            </div>
        </div>
    );
};

export default RoutineProgress; 