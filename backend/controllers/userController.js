const User = require("../models/User");
const Routine = require("../models/routineModel");

const getBodyInfo = async (req, res) => {
    //gonna probably have to split this up into a couple of different requests later since this request is getting expensive
    const userID = req.body.username;
    const ID = req.user.id;
    const routines = await Routine.find({ user: ID }).sort({ createdAt: -1 });
    let totalWorkouts = 0;
    let completitionStats = [];
    routines.forEach((routine) => {
        totalWorkouts += routine.completionStats.length;
        if (routine.completionStats.length != 0)
            completitionStats.push(routine.completionStats);
    });

    const uniqueDays = Array.from(
        new Set(
            completitionStats.flat(2).map((entry) => entry.date.split("T")[0])
        )
    );

    const body = await User.findOne({ username: userID });
    if (!body) return res.status(404).json({ error: "Body doesn't exist" });

    const dayPriorExists = (isoSet, isoString) => {
        const givenDate = new Date(isoString);
        const dayPrior = new Date(givenDate);
        dayPrior.setDate(givenDate.getDate() - 1);
        const priorDay = dayPrior.toISOString().split("T")[0];
        return Array.from(isoSet).some((_) => _.startsWith(priorDay));
    };

    const dayAfterExists = (isoSet, isoString) => {
        const givenDate = new Date(isoString);
        const dayAfter = new Date(givenDate);
        dayAfter.setDate(givenDate.getDate() + 1);
        const afterDay = dayAfter.toISOString().split("T")[0];
        return Array.from(isoSet).some((_) => _.startsWith(afterDay));
    };

    let longestStreak = 0;
    uniqueDays.forEach((_) => {
        if (!dayPriorExists(uniqueDays, _)) {
            let length = 0;
            let currentDay = _;
            while (dayAfterExists(uniqueDays, currentDay)) {
                length++;
                const currentDate = new Date(currentDay);
                currentDate.setDate(currentDate.getDate() + 1);
                currentDay = currentDate.toISOString().split("T")[0];
            }
            length++;
            longestStreak = Math.max(longestStreak, length);
        }
    });
    let sortedDays = uniqueDays.flat().sort((a,b) =>{
        return (a.toISOString) > (b.toISOString) ? 1 : -1
    });

    let currentLongestStreak = 0;
    let flag = false;
    sortedDays.forEach((_)=>{
        //basically we are going to take the current date and then go backwards to find when there isn't a day that is the previous day, using the day prior exists function and then just increementing that count 
        if (dayPriorExists(uniqueDays, _) && !flag){
            currentLongestStreak++;
        }else{
            flag = true;
        }
    });
    console.log(currentLongestStreak);

    //total workouts and lognest workoutstreak have been added to schema so that means that they don't needa be recomputed every call but we will have this for now
    // just to test out the algorithms that we have before we abstract away logic
    res.status(200).json({
        Name: body.Name,
        Email: body.Email,
        Age: body.Age,
        Experience: body.YearsOfWorkoutExperience,
        Gender: body.Gender,
        Height: body.Height,
        Weight: body.Weight,
        BMR: body.BMR,
        YearsOfWorkoutExperience: body.YearsOfWorkoutExperience,
        Bio: body.Bio,
        MemberSince: body.MemberSince,
        TotalWorkouts: totalWorkouts,
        LongestWorkoutStreak: longestStreak,
        currentLongestStreak: currentLongestStreak,
    });
};

const updateBody = async (req, res) => {
    const userID = req.body.username;
    const {
        Name,
        Email,
        Height,
        Weight,
        Age,
        Gender,
        BMR,
        YearsOfWorkoutExperience,
        Bio,
    } = req.body;

    try {
        const updatedProfile = await User.findOneAndUpdate(
            { username: userID },
            {
                $set: {
                    Name,
                    Email,
                    Height,
                    Weight,
                    Age,
                    Gender,
                    BMR,
                    YearsOfWorkoutExperience,
                    Bio,
                },
            },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBodyInfo,
    updateBody,
};
