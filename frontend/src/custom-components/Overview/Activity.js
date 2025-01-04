import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "../../components/ui/chart";

const chartConfig = {
    cardio: { label: "Cardio", color: "var(--primary)" },
    strength: { label: "Strength", color: "var(--navbar-hover)" },
};

const Activity = ({ chartData }) => {
    const finalChartData = [
        {
            week: "Week 1",
            cardio: chartData.weeklyCardioTime[0],
            strength: chartData.weeklyStrengthTime[0],
        },
        {
            week: "Week 2",
            cardio: chartData.weeklyCardioTime[1],
            strength: chartData.weeklyStrengthTime[1],
        },
        {
            week: "Week 3",
            cardio: chartData.weeklyCardioTime[2],
            strength: chartData.weeklyStrengthTime[2],
        },
        {
            week: "Week 4",
            cardio: chartData.weeklyCardioTime[3],
            strength: chartData.weeklyStrengthTime[3],
        },
    ];

    return (
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={finalChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="week"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 10)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="cardio" fill="var(--color-cardio)" radius={4} />
                <Bar
                    dataKey="strength"
                    fill="var(--color-strength)"
                    radius={4}
                />
            </BarChart>
        </ChartContainer>
    );
};

export default Activity;
