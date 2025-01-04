import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../../components/ui/tabs";
import Overview from "../../custom-components/Overview/Overview";
import Analytics from "../Analytics/Analytics";
//NOTE DO NOT MAKE ANY API CALLS FROM HERE, API CALLS SHOULD NOT BE MADE THROUGH COMPONENTS
//ALSO NO RAW HTML SHOULD BE HERE EITHER
const Dashboard = ({
    chartData,
    Weight,
    WeeklyWorkouts,
    MemberSince,
    TotalWorkouts,
    LongestWorkoutStreak,
    user
}) => {
    const capitalizedName = user ? user.charAt(0).toUpperCase() + user.slice(1) : 'Guest';
    
    const greetings = {
        0: "Strong Sunday", 
        1: "Mighty Monday", 
        2: "Training Tuesday", 
        3: "Warrior Wednesday",
        4: "Thriving Thursday",
        5: "Flex Friday", 
        6: "Shredded Saturday" 
    };

    const currentDay = greetings[new Date().getDay()];

    return (
        <Card className="h-full w-full overflow-auto">
            <CardHeader className="text-brawn font-bold text-3xl">
                {currentDay}, {capitalizedName}
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="Analytics" className="w-auto">
                    <TabsList className=" gap-1 grid w-full grid-cols-2">
                        <TabsTrigger
                            value="Overview"
                            className="text-brawn font-semibold cursor-pointer"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="Analytics"
                            className="text-brawn font-semibold cursor-pointer"
                        >
                            Analytics
                        </TabsTrigger>
                        {/* <TabsTrigger value="Friends" className="text-brawn font-semibold cursor-pointer">
                            Friends
                        </TabsTrigger> */}
                    </TabsList>
                    <TabsContent value="Overview">
                        <Overview
                            WeeklyWorkouts={WeeklyWorkouts}
                            MemberSince={MemberSince}
                            TotalWorkouts={TotalWorkouts}
                            LongestWorkoutStreak={LongestWorkoutStreak}
                            chartData={chartData}
                        />
                    </TabsContent>
                    <TabsContent value="Analytics">
                        <Analytics Weight={Weight} />
                    </TabsContent>
                    {/* <TabsContent value="Friends">
                        <Friends/>
                    </TabsContent> */}
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default Dashboard;
