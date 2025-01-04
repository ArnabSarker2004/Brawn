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
    WeeklyWorkouts,
    MemberSince,
    TotalWorkouts,
    LongestWorkoutStreak,
    user
}) => {
    const capitalizedName = user ? user.charAt(0).toUpperCase() + user.slice(1) : 'Guest';
    
    const greetings = {
        0: "Snappy Sunday", // Sunday
        1: "Mighty Monday", // Monday
        2: "Terrific Tuesday", // Tuesday
        3: "Winning Wednesday", // Wednesday
        4: "Thriving Thursday", // Thursday
        5: "Fantastic Friday", // Friday
        6: "Super Saturday" // Saturday
    };

    const currentDay = greetings[new Date().getDay()];

    console.log(WeeklyWorkouts);
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
                        />
                    </TabsContent>
                    <TabsContent value="Analytics">
                        <Analytics />
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
