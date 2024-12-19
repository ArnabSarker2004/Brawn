import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';
import { Button } from './button';

export function Profile() {
return (
    <div className="w-full max-w-8xl mx-auto md:pb-20 gap-10">
    <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
    </header>
    <Card>
        <CardHeader>
            <CardTitle>
                Profile Settings
            </CardTitle>
            <CardDescription>
                Update your account details and preferences.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Name
                    </Label>
                    <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">
                        Email
                    </Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                </div>
            </div>
            <CardDescription>
                Your Body
            </CardDescription>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="Height">
                        Height
                    </Label>
                    <Input id="height" defaultValue="6 foot" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="weight">
                        Weight
                    </Label>
                    <Input id="weight" type="weight" defaultValue="200" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="age">
                        Age
                    </Label>
                    <Input id="age" defaultValue="69" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="Gender">
                        Gender
                    </Label>
                    <Input id="gender" type="gender" defaultValue="Male" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="Basal Metabolic Rate">
                        Basal Metabolic Rate
                    </Label>
                    <Input id="BMR" defaultValue="2000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="YOE">
                        Years of Working Out
                    </Label>
                    <Input id="YOE" type="YOE" defaultValue="5"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="bio">
                    Bio
                </Label>
                <Textarea id="bio" rows={3} defaultValue="I love working out." />
            </div>
            <Button className="w-full" size="lg">
                Save Changes
            </Button>
        </CardContent>
    </Card>
    </div>
);
}
