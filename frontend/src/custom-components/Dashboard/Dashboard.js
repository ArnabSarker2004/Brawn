import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import Overview from "../../custom-components/Overview/Overview";
import Analytics from "../Analytics/Analytics";
//NOTE DO NOT MAKE ANY API CALLS FROM HERE, API CALLS SHOULD NOT BE MADE THROUGH COMPONENTS
//ALSO NO RAW HTML SHOULD BE HERE EITHER
const Dashboard = () =>{
    return (
    <Card className="h-full w-full overflow-auto"> 
        <CardHeader className="text-brawn font-bold text-3xl">
            Dashboard
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="Analytics" className="w-auto">
                    <TabsList className=" gap-1 grid w-full grid-cols-2">
                        <TabsTrigger value="Overview" className="text-brawn font-semibold cursor-pointer">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="Analytics" className="text-brawn font-semibold cursor-pointer">
                            Analytics
                        </TabsTrigger>
                        {/* <TabsTrigger value="Friends" className="text-brawn font-semibold cursor-pointer">
                            Friends
                        </TabsTrigger> */}
                    </TabsList>
                    <TabsContent value="Overview">
                        <Overview/>
                    </TabsContent>
                    <TabsContent value="Analytics">
                        <Analytics/>
                    </TabsContent>
                    {/* <TabsContent value="Friends">
                        <Friends/>
                    </TabsContent> */}
                </Tabs>
        </CardContent>
    </Card>);
}

export default Dashboard;