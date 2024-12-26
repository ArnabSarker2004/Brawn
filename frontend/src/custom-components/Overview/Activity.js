
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../components/ui/chart"

const chartData = [
    { week: "Week 1", cardio: 186, strength: 80 },
    { week: "Week 2", cardio: 305, strength: 200 },
    { week: "Week 3", cardio: 237, strength: 120 },
    { week: "Week 4", cardio: 73, strength: 190 }
];
const chartConfig = {
    cardio: {
        label: "Cardio",
        color: "var(--primary)",
    },
    strength: {
        label: "Strength",
        color: "var(--navbar-hover)",
    },
};
const Activity = () =>{
    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="week"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 10)}/>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="cardio" fill="var(--color-cardio)" radius={4} />
                <Bar dataKey="strength" fill="var(--color-strength)" radius={4} />
            </BarChart>
        </ChartContainer>
    );
}
export default Activity;