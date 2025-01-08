import { PieChart, Pie, Cell } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "../../components/ui/chart";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel";

// Function to generate a pastel color
const generateColor = (index) => {
    const hues = [
        160,  // Soft mint green
        190,  // Soft sky blue
        330,  // Soft pink
        220,  // Soft lavender
        30,   // Soft peach
        280,  // Soft purple
        140,  // Soft sage
        20,   // Soft coral
        200,  // Soft periwinkle
        170   // Soft seafoam
    ];
    
    const hue = hues[index % hues.length];
    return `hsl(${hue}, 55%, 85%)`; // Lower saturation and higher lightness for pastel effect
};

// Function to generate colors based on number of routines
const generateColors = (count) => {
    return Array.from({ length: count }, (_, index) => generateColor(index));
};

const AnalyticData = ({ routineDistribution }) => {
    // Generate colors based on the number of routines
    const weeklyColors = generateColors(routineDistribution?.weekly?.length || 0);
    const monthlyColors = generateColors(routineDistribution?.monthly?.length || 0);

    // Create chart configs with dynamic colors
    const weeklyChartConfig = Object.fromEntries(
        (routineDistribution?.weekly || []).map((item, index) => [
            item.name,
            { label: item.name, color: weeklyColors[index] }
        ])
    );

    const monthlyChartConfig = Object.fromEntries(
        (routineDistribution?.monthly || []).map((item, index) => [
            item.name,
            { label: item.name, color: monthlyColors[index] }
        ])
    );

    return (
        <div className="w-full">
            <Carousel className="w-full relative">
                <CarouselContent>
                    <CarouselItem>
                        <div className="p-1">
                            <div className="flex flex-col items-center p-10">
                                <h3 className="text-xl font-semibold mb-4">Weekly Distribution</h3>
                                <ChartContainer config={weeklyChartConfig} className="min-h-[400px] w-[100%]">
                                    <PieChart width={600} height={600}>
                                        <Pie
                                            data={routineDistribution?.weekly || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={({ viewBox }) => Math.min(viewBox.width, viewBox.height) / 4}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {(routineDistribution?.weekly || []).map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={weeklyColors[index]} 
                                                />
                                            ))}
                                        </Pie>
                                        <ChartTooltip 
                                            content={<ChartTooltipContent 
                                                valueFormatter={(value) => `${value} mins`}
                                            />} 
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </div>
                        </div>
                    </CarouselItem>

                    <CarouselItem>
                        <div className="p-1">
                            <div className="flex flex-col items-center p-10">
                                <h3 className="text-xl font-semibold mb-4">Monthly Distribution</h3>
                                <ChartContainer config={monthlyChartConfig} className="min-h-[400px] w-[100%]">
                                    <PieChart width={600} height={600}>
                                        <Pie
                                            data={routineDistribution?.monthly || []}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={({ viewBox }) => Math.min(viewBox.width, viewBox.height) / 4}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            {(routineDistribution?.monthly || []).map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={monthlyColors[index]} 
                                                />
                                            ))}
                                        </Pie>
                                        <ChartTooltip 
                                            content={<ChartTooltipContent 
                                                valueFormatter={(value) => `${value} mins`}
                                            />} 
                                        />
                                        <ChartLegend content={<ChartLegendContent />} />
                                    </PieChart>
                                </ChartContainer>
                            </div>
                        </div>
                    </CarouselItem>
                </CarouselContent>
                <div className="flex justify-center mt-4 mb-4">
                    <CarouselPrevious className="ml-10" />
                    <CarouselNext className="mr-10" />
                </div>
            </Carousel>
        </div>
    );
};

export default AnalyticData;
