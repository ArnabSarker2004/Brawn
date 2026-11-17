const exercise = (
    id,
    name,
    category,
    equipment,
    difficulty,
    primaryMuscles,
    secondaryMuscles,
    aliases,
    tags,
    tutorial,
    cues,
    mistakes
) => ({
    id,
    name,
    category,
    equipment,
    difficulty,
    primaryMuscles,
    secondaryMuscles,
    aliases,
    tags,
    tutorial,
    cues,
    mistakes,
});

export const exerciseDatabase = [
    exercise(
        "barbell-bench-press",
        "Barbell Bench Press",
        "Strength",
        "Barbell",
        "Intermediate",
        ["Chest"],
        ["Triceps", "Front Delts"],
        ["bench", "flat bench", "chest press"],
        ["push", "upper body", "compound", "power"],
        ["Set your eyes under the bar and plant your feet.", "Pull shoulder blades down and back before unracking.", "Lower the bar to mid chest with elbows slightly tucked.", "Press up and back until elbows lock without losing your brace."],
        ["Keep wrists stacked over elbows.", "Use a controlled touch, not a bounce.", "Drive your feet into the floor."],
        ["Flaring elbows too wide.", "Lifting hips off the bench.", "Letting shoulders roll forward."]
    ),
    exercise(
        "incline-dumbbell-press",
        "Incline Dumbbell Press",
        "Strength",
        "Dumbbells",
        "Intermediate",
        ["Upper Chest"],
        ["Front Delts", "Triceps"],
        ["incline press", "incline db press"],
        ["push", "hypertrophy", "upper body"],
        ["Set the bench around 30 degrees.", "Start dumbbells near upper chest.", "Press in a slight arc until the weights meet above shoulders.", "Lower with control and keep ribs down."],
        ["Use a modest incline.", "Keep elbows under the weights.", "Pause briefly at the bottom."],
        ["Turning it into a shoulder press.", "Crashing dumbbells together.", "Overarching the lower back."]
    ),
    exercise(
        "push-up",
        "Push-Up",
        "Calisthenics",
        "Bodyweight",
        "Beginner",
        ["Chest"],
        ["Triceps", "Core", "Front Delts"],
        ["press up", "bodyweight press"],
        ["push", "home", "upper body", "core"],
        ["Stack hands under shoulders.", "Squeeze glutes and brace your trunk.", "Lower chest toward the floor as one unit.", "Press away while keeping a straight line."],
        ["Move your chest and hips together.", "Spread the floor with your hands.", "Stop a rep before form breaks."],
        ["Sagging hips.", "Shrugging shoulders.", "Partial reps without control."]
    ),
    exercise(
        "overhead-press",
        "Standing Overhead Press",
        "Strength",
        "Barbell",
        "Intermediate",
        ["Shoulders"],
        ["Triceps", "Upper Chest", "Core"],
        ["ohp", "military press", "shoulder press"],
        ["push", "compound", "upper body", "strength"],
        ["Grip just outside shoulders.", "Brace glutes, abs, and quads.", "Press the bar close to your face.", "Finish with biceps near ears and ribs stacked."],
        ["Squeeze glutes before pressing.", "Move your head through after the bar passes.", "Keep the bar path vertical."],
        ["Leaning back into a standing incline press.", "Pressing around the face.", "Relaxing the brace."]
    ),
    exercise(
        "dumbbell-lateral-raise",
        "Dumbbell Lateral Raise",
        "Strength",
        "Dumbbells",
        "Beginner",
        ["Side Delts"],
        ["Traps"],
        ["lateral raise", "side raise"],
        ["shoulders", "isolation", "hypertrophy"],
        ["Hold dumbbells at your sides.", "Lead with elbows and raise to shoulder height.", "Pause briefly, then lower slowly.", "Keep the neck relaxed."],
        ["Use light weight.", "Think wide, not high.", "Control the lowering phase."],
        ["Swinging the torso.", "Shrugging every rep.", "Going too heavy."]
    ),
    exercise(
        "pull-up",
        "Pull-Up",
        "Calisthenics",
        "Bodyweight",
        "Intermediate",
        ["Lats"],
        ["Biceps", "Upper Back", "Core"],
        ["chin over bar", "strict pullup"],
        ["pull", "upper body", "compound", "bodyweight"],
        ["Hang with ribs down and legs quiet.", "Pull elbows toward your ribs.", "Bring chest toward the bar.", "Lower to a controlled full hang."],
        ["Start each rep from stillness.", "Drive elbows down.", "Use a full range you can control."],
        ["Kipping unintentionally.", "Craning the neck.", "Half reps without scapular control."]
    ),
    exercise(
        "lat-pulldown",
        "Lat Pulldown",
        "Strength",
        "Cable",
        "Beginner",
        ["Lats"],
        ["Biceps", "Upper Back"],
        ["pulldown", "wide grip pulldown"],
        ["pull", "back", "machine", "hypertrophy"],
        ["Lock thighs under the pad.", "Lean back slightly and keep ribs down.", "Pull elbows toward your pockets.", "Return with a slow stretch."],
        ["Pull with elbows, not hands.", "Let the lats stretch at the top.", "Keep shoulders away from ears."],
        ["Pulling behind the neck.", "Rocking the torso.", "Turning it into a curl."]
    ),
    exercise(
        "barbell-row",
        "Barbell Row",
        "Strength",
        "Barbell",
        "Intermediate",
        ["Upper Back"],
        ["Lats", "Biceps", "Hamstrings"],
        ["bent over row", "pendlay row"],
        ["pull", "compound", "back", "strength"],
        ["Hinge until torso is close to parallel.", "Brace and keep the bar over midfoot.", "Row toward lower ribs.", "Lower under control without losing position."],
        ["Keep your torso still.", "Pull elbows back.", "Use straps if grip limits your back."],
        ["Standing up during the pull.", "Jerking from the lower back.", "Letting the bar drift forward."]
    ),
    exercise(
        "seated-cable-row",
        "Seated Cable Row",
        "Strength",
        "Cable",
        "Beginner",
        ["Upper Back"],
        ["Lats", "Biceps"],
        ["cable row", "seated row"],
        ["pull", "back", "machine", "hypertrophy"],
        ["Sit tall with soft knees.", "Reach forward for a controlled stretch.", "Pull handles toward your lower ribs.", "Squeeze back, then return slowly."],
        ["Keep chest proud.", "Pause at the squeeze.", "Avoid leaning too far back."],
        ["Using momentum.", "Shrugging shoulders.", "Shortening the stretch."]
    ),
    exercise(
        "barbell-back-squat",
        "Barbell Back Squat",
        "Strength",
        "Barbell",
        "Intermediate",
        ["Quads", "Glutes"],
        ["Hamstrings", "Core", "Adductors"],
        ["squat", "back squat"],
        ["legs", "compound", "strength", "power"],
        ["Set the bar on upper traps or rear delts.", "Brace before descending.", "Sit between your hips and keep feet rooted.", "Drive up through midfoot."],
        ["Brace before every rep.", "Keep knees tracking with toes.", "Use a depth you can own."],
        ["Knees collapsing inward.", "Good-morning the weight up.", "Losing heel pressure."]
    ),
    exercise(
        "front-squat",
        "Front Squat",
        "Strength",
        "Barbell",
        "Advanced",
        ["Quads"],
        ["Glutes", "Upper Back", "Core"],
        ["front rack squat"],
        ["legs", "compound", "quad focus"],
        ["Rest the bar across front delts.", "Keep elbows high and ribs down.", "Descend between your knees.", "Drive up while keeping your torso tall."],
        ["Think elbows to the wall.", "Brace hard.", "Use weightlifting shoes if helpful."],
        ["Dropping elbows.", "Collapsing forward.", "Relaxing the upper back."]
    ),
    exercise(
        "romanian-deadlift",
        "Romanian Deadlift",
        "Strength",
        "Barbell",
        "Intermediate",
        ["Hamstrings", "Glutes"],
        ["Lower Back", "Upper Back"],
        ["rdl", "stiff leg deadlift"],
        ["hinge", "posterior chain", "strength"],
        ["Start tall with a soft knee bend.", "Push hips back and keep bar close.", "Stop when hamstrings are loaded.", "Drive hips through to stand tall."],
        ["Keep lats tight.", "Reach hips back, not down.", "Feel hamstrings stretch."],
        ["Squatting the movement.", "Rounding the back.", "Letting the bar drift away."]
    ),
    exercise(
        "deadlift",
        "Conventional Deadlift",
        "Strength",
        "Barbell",
        "Advanced",
        ["Glutes", "Hamstrings", "Lower Back"],
        ["Upper Back", "Core", "Quads"],
        ["deadlift", "pull from floor"],
        ["hinge", "compound", "strength", "power"],
        ["Stand with midfoot under the bar.", "Hinge down and grip outside legs.", "Pull slack out of the bar.", "Push the floor away and lock out with glutes."],
        ["Bar stays close.", "Brace before the pull.", "Finish tall, not leaned back."],
        ["Yanking without tension.", "Rounded start position.", "Overextending at lockout."]
    ),
    exercise(
        "walking-lunge",
        "Walking Lunge",
        "Strength",
        "Dumbbells",
        "Beginner",
        ["Quads", "Glutes"],
        ["Hamstrings", "Core"],
        ["lunges", "db lunge"],
        ["legs", "unilateral", "conditioning"],
        ["Hold weights at your sides.", "Step forward into a long stable stance.", "Lower until both knees bend deeply.", "Push through the front foot into the next step."],
        ["Stay tall.", "Control the back knee.", "Keep front knee tracking over toes."],
        ["Short unstable steps.", "Pushing mostly off the back foot.", "Letting the torso collapse."]
    ),
    exercise(
        "leg-press",
        "Leg Press",
        "Strength",
        "Machine",
        "Beginner",
        ["Quads", "Glutes"],
        ["Hamstrings"],
        ["sled press", "machine leg press"],
        ["legs", "machine", "hypertrophy"],
        ["Set feet shoulder width on the platform.", "Lower until hips stay on the pad.", "Press through the full foot.", "Stop just short of locking hard."],
        ["Use a deep controlled range.", "Keep knees in line.", "Do not rush the eccentric."],
        ["Rounding hips off the seat.", "Locking knees aggressively.", "Cutting depth short."]
    ),
    exercise(
        "hip-thrust",
        "Barbell Hip Thrust",
        "Strength",
        "Barbell",
        "Intermediate",
        ["Glutes"],
        ["Hamstrings", "Core"],
        ["hip thrust", "glute bridge"],
        ["glutes", "posterior chain", "hypertrophy"],
        ["Set upper back on a bench.", "Place bar over hips with padding.", "Tuck ribs and drive hips up.", "Pause at lockout with glutes squeezed."],
        ["Chin tucked.", "Shins vertical at the top.", "Pause each rep."],
        ["Overarching lower back.", "Feet too far away.", "Bouncing off the floor."]
    ),
    exercise(
        "bulgarian-split-squat",
        "Bulgarian Split Squat",
        "Strength",
        "Dumbbells",
        "Intermediate",
        ["Quads", "Glutes"],
        ["Hamstrings", "Core"],
        ["rear foot elevated split squat", "bss"],
        ["legs", "unilateral", "hypertrophy"],
        ["Set rear foot on a bench.", "Hop front foot to a stable distance.", "Lower straight down with control.", "Drive through front foot to stand."],
        ["Use a stable front foot.", "Let knee travel if comfortable.", "Keep reps smooth."],
        ["Front foot too close.", "Pushing from the rear leg.", "Rushing balance."]
    ),
    exercise(
        "biceps-curl",
        "Dumbbell Biceps Curl",
        "Strength",
        "Dumbbells",
        "Beginner",
        ["Biceps"],
        ["Forearms"],
        ["curl", "db curl"],
        ["arms", "isolation", "hypertrophy"],
        ["Stand tall with palms forward.", "Curl without moving elbows forward.", "Squeeze at the top.", "Lower until elbows are straight."],
        ["Keep shoulders quiet.", "Use full range.", "Control the lowering."],
        ["Swinging hips.", "Partial reps only.", "Letting elbows drift."]
    ),
    exercise(
        "triceps-pushdown",
        "Cable Triceps Pushdown",
        "Strength",
        "Cable",
        "Beginner",
        ["Triceps"],
        ["Forearms"],
        ["pushdown", "rope pushdown"],
        ["arms", "isolation", "push"],
        ["Pin elbows near your sides.", "Start with forearms above parallel.", "Push down until elbows straighten.", "Return under control."],
        ["Keep elbows fixed.", "Spread rope at the bottom.", "Use a smooth tempo."],
        ["Leaning bodyweight into it.", "Flaring elbows.", "Short range reps."]
    ),
    exercise(
        "plank",
        "Forearm Plank",
        "Core",
        "Bodyweight",
        "Beginner",
        ["Core"],
        ["Glutes", "Shoulders"],
        ["plank hold", "front plank"],
        ["core", "stability", "bodyweight"],
        ["Set elbows under shoulders.", "Squeeze glutes and quads.", "Pull ribs down and breathe slowly.", "Hold a straight line without sagging."],
        ["Short perfect holds beat long sloppy ones.", "Push elbows through the floor.", "Breathe behind the brace."],
        ["Hips too high.", "Lower back sagging.", "Holding your breath."]
    ),
    exercise(
        "hanging-leg-raise",
        "Hanging Leg Raise",
        "Core",
        "Pull-Up Bar",
        "Advanced",
        ["Abs"],
        ["Hip Flexors", "Forearms"],
        ["leg raise", "toes to bar"],
        ["core", "bodyweight", "advanced"],
        ["Hang from a bar with shoulders active.", "Tilt pelvis back before lifting.", "Raise legs without swinging.", "Lower slowly to stillness."],
        ["Start each rep from control.", "Exhale as legs rise.", "Scale with bent knees."],
        ["Using momentum.", "Arching hard at the bottom.", "Letting shoulders hang passively."]
    ),
    exercise(
        "russian-twist",
        "Russian Twist",
        "Core",
        "Bodyweight",
        "Beginner",
        ["Obliques"],
        ["Abs", "Hip Flexors"],
        ["twists", "seated twist"],
        ["core", "rotation", "conditioning"],
        ["Sit with torso leaned back.", "Brace and rotate through the trunk.", "Tap each side with control.", "Keep chest tall."],
        ["Move ribs, not just hands.", "Stay balanced.", "Use a slow tempo."],
        ["Yanking the neck.", "Collapsing posture.", "Rushing reps."]
    ),
    exercise(
        "treadmill-run",
        "Treadmill Run",
        "Cardio",
        "Treadmill",
        "Beginner",
        ["Heart", "Quads", "Calves"],
        ["Glutes", "Hamstrings"],
        ["run", "jog", "cardio run"],
        ["cardio", "conditioning", "endurance"],
        ["Start with an easy warm-up.", "Find a cadence you can repeat.", "Keep shoulders relaxed.", "Cool down before stepping off."],
        ["Increase speed gradually.", "Run tall.", "Use intervals for progression."],
        ["Starting too fast.", "Overstriding.", "Skipping the warm-up."]
    ),
    exercise(
        "outdoor-run",
        "Outdoor Run",
        "Cardio",
        "Outdoor",
        "Beginner",
        ["Heart", "Quads", "Calves"],
        ["Glutes", "Hamstrings"],
        ["running route", "road run", "trail run"],
        ["cardio", "route", "endurance", "social"],
        ["Warm up with an easy first kilometer.", "Keep effort conversational for base runs.", "Use landmarks for intervals.", "Log route notes after finishing."],
        ["Run by effort, not only pace.", "Relax your hands.", "Finish with a cooldown walk."],
        ["Turning every run into a race.", "Ignoring terrain.", "Adding distance too quickly."]
    ),
    exercise(
        "stationary-bike",
        "Stationary Bike",
        "Cardio",
        "Bike",
        "Beginner",
        ["Heart", "Quads"],
        ["Glutes", "Calves"],
        ["cycling", "spin bike", "bike"],
        ["cardio", "low impact", "conditioning"],
        ["Set seat height so knees stay slightly bent.", "Warm up for five minutes.", "Alternate hard and easy blocks if doing intervals.", "Cool down gradually."],
        ["Keep cadence smooth.", "Use resistance, not bouncing.", "Stay relaxed through shoulders."],
        ["Seat too low.", "Grinding every interval.", "Skipping cooldown."]
    ),
    exercise(
        "rowing-machine",
        "Rowing Machine",
        "Cardio",
        "Rower",
        "Intermediate",
        ["Heart", "Upper Back", "Quads"],
        ["Glutes", "Hamstrings", "Biceps"],
        ["erg", "rower", "machine row"],
        ["cardio", "full body", "conditioning"],
        ["Drive with legs first.", "Swing torso after legs extend.", "Pull handle to lower ribs.", "Return arms, body, then legs."],
        ["Legs-body-arms on the drive.", "Arms-body-legs on recovery.", "Keep strokes long."],
        ["Pulling early with arms.", "Rounding the back.", "Rushing recovery."]
    ),
    exercise(
        "kettlebell-swing",
        "Kettlebell Swing",
        "Conditioning",
        "Kettlebell",
        "Intermediate",
        ["Glutes", "Hamstrings"],
        ["Core", "Shoulders", "Lower Back"],
        ["kb swing", "russian swing"],
        ["hinge", "conditioning", "power"],
        ["Hike the bell back like a football snap.", "Snap hips forward to float the bell.", "Let arms guide, not lift.", "Catch the bell back into the hinge."],
        ["Hips drive the bell.", "Keep lats packed.", "Finish tall with glutes."],
        ["Squatting the swing.", "Lifting with shoulders.", "Losing the hinge."]
    ),
    exercise(
        "burpee",
        "Burpee",
        "Conditioning",
        "Bodyweight",
        "Intermediate",
        ["Heart", "Chest", "Quads"],
        ["Core", "Shoulders", "Glutes"],
        ["squat thrust", "full body burpee"],
        ["conditioning", "hiit", "bodyweight"],
        ["Drop hands under shoulders.", "Step or jump feet back.", "Lower chest if doing full burpees.", "Return feet under hips and stand or jump."],
        ["Choose a sustainable pace.", "Keep landings quiet.", "Scale by stepping back."],
        ["Collapsing into the floor.", "Holding breath.", "Losing rhythm early."]
    ),
    exercise(
        "jump-rope",
        "Jump Rope",
        "Conditioning",
        "Rope",
        "Beginner",
        ["Calves", "Heart"],
        ["Shoulders", "Forearms"],
        ["skipping", "rope jumps"],
        ["conditioning", "footwork", "cardio"],
        ["Hold handles lightly.", "Turn rope from wrists.", "Bounce low on the balls of feet.", "Keep reps smooth and quiet."],
        ["Small jumps.", "Relax shoulders.", "Use timed rounds."],
        ["Jumping too high.", "Turning with arms.", "Landing heavy."]
    ),
    exercise(
        "yoga-sun-salutation",
        "Sun Salutation Flow",
        "Mobility",
        "Yoga Mat",
        "Beginner",
        ["Shoulders", "Hamstrings", "Core"],
        ["Chest", "Calves", "Back"],
        ["sun salutation", "yoga flow", "vinyasa"],
        ["mobility", "recovery", "warmup"],
        ["Start tall and breathe in.", "Fold forward with soft knees.", "Step or jump back to plank.", "Flow through cobra or upward dog, then return to downward dog."],
        ["Match movement to breath.", "Keep shoulders away from ears.", "Move slowly in the first round."],
        ["Rushing transitions.", "Forcing hamstring range.", "Collapsing through wrists."]
    ),
    exercise(
        "worlds-greatest-stretch",
        "World's Greatest Stretch",
        "Mobility",
        "Bodyweight",
        "Beginner",
        ["Hip Flexors", "T-Spine"],
        ["Hamstrings", "Glutes", "Chest"],
        ["lunge stretch", "dynamic warmup"],
        ["mobility", "warmup", "hips"],
        ["Step into a deep lunge.", "Place both hands inside the front foot.", "Rotate toward the front leg.", "Return and switch sides."],
        ["Move slowly.", "Follow your hand with your eyes.", "Keep the back leg active."],
        ["Holding breath.", "Forcing rotation.", "Letting front foot lift."]
    ),
    exercise(
        "couch-stretch",
        "Couch Stretch",
        "Mobility",
        "Bodyweight",
        "Intermediate",
        ["Hip Flexors", "Quads"],
        ["Glutes", "Core"],
        ["quad stretch", "hip flexor stretch"],
        ["mobility", "recovery", "lower body"],
        ["Place back knee near a wall or bench.", "Set the shin upward behind you.", "Squeeze glute on the stretching side.", "Hold tall and breathe."],
        ["Start farther from the wall if tight.", "Posteriorly tilt pelvis.", "Use padding under knee."],
        ["Arching lower back.", "Forcing knee too close.", "Relaxing the glute."]
    ),
    exercise(
        "face-pull",
        "Cable Face Pull",
        "Mobility",
        "Cable",
        "Beginner",
        ["Rear Delts", "Upper Back"],
        ["Rotator Cuff", "Traps"],
        ["facepull", "rope face pull"],
        ["shoulders", "posture", "prehab"],
        ["Set cable near eye level.", "Pull rope toward face with elbows high.", "Externally rotate at the finish.", "Return slowly."],
        ["Lead with elbows.", "Pause at your face.", "Keep ribs down."],
        ["Too much weight.", "Shrugging.", "Turning it into a row."]
    ),
    exercise(
        "farmer-carry",
        "Farmer Carry",
        "Conditioning",
        "Dumbbells",
        "Beginner",
        ["Forearms", "Core", "Traps"],
        ["Glutes", "Calves"],
        ["farmers walk", "loaded carry"],
        ["grip", "conditioning", "core"],
        ["Pick up heavy dumbbells with a flat back.", "Stand tall and brace.", "Walk with controlled steps.", "Set weights down safely."],
        ["Tall posture.", "Crush the handles.", "Short steady steps."],
        ["Leaning side to side.", "Rushing turns.", "Dropping posture."]
    ),
    exercise(
        "sled-push",
        "Sled Push",
        "Conditioning",
        "Sled",
        "Intermediate",
        ["Quads", "Glutes", "Heart"],
        ["Calves", "Core"],
        ["prowler push", "sled sprint"],
        ["conditioning", "legs", "power"],
        ["Load the sled for the intended effort.", "Lean into handles with a stiff trunk.", "Drive knees forward with powerful steps.", "Keep pushing through the full distance."],
        ["Use short aggressive steps.", "Keep arms locked.", "Pick a load that matches the goal."],
        ["Hips too high.", "Tiny shuffling steps.", "Stopping before the line."]
    ),
];

const searchableText = (exerciseItem) =>
    [
        exerciseItem.name,
        exerciseItem.category,
        exerciseItem.equipment,
        exerciseItem.difficulty,
        exerciseItem.primaryMuscles.join(" "),
        exerciseItem.secondaryMuscles.join(" "),
        exerciseItem.aliases.join(" "),
        exerciseItem.tags.join(" "),
        exerciseItem.tutorial.join(" "),
    ]
        .join(" ")
        .toLowerCase();

const semanticHints = {
    push: ["chest", "triceps", "shoulders", "press"],
    pull: ["back", "lats", "biceps", "row"],
    legs: ["quads", "glutes", "hamstrings", "calves", "squat"],
    run: ["cardio", "endurance", "route", "heart"],
    mobility: ["stretch", "recovery", "warmup", "hips", "shoulders"],
    core: ["abs", "obliques", "stability", "plank"],
    strength: ["barbell", "compound", "power", "hypertrophy"],
    beginner: ["bodyweight", "machine", "easy", "simple"],
};

export const getExerciseSearchResults = (query, category = "All", muscle = "All") => {
    const trimmedQuery = query.trim().toLowerCase();
    const queryTokens = trimmedQuery.split(/\s+/).filter(Boolean);
    const expandedTokens = queryTokens.flatMap((token) => [token, ...(semanticHints[token] || [])]);

    return exerciseDatabase
        .filter((exerciseItem) => {
            const matchesCategory = category === "All" || exerciseItem.category === category;
            const matchesMuscle =
                muscle === "All" ||
                exerciseItem.primaryMuscles.includes(muscle) ||
                exerciseItem.secondaryMuscles.includes(muscle);

            return matchesCategory && matchesMuscle;
        })
        .map((exerciseItem, index) => {
            const text = searchableText(exerciseItem);
            let score = exerciseDatabase.length - index;

            if (trimmedQuery) {
                score = 0;
                expandedTokens.forEach((token) => {
                    if (exerciseItem.name.toLowerCase().includes(token)) score += 18;
                    if (exerciseItem.aliases.some((alias) => alias.toLowerCase().includes(token))) score += 14;
                    if (exerciseItem.primaryMuscles.some((item) => item.toLowerCase().includes(token))) score += 12;
                    if (exerciseItem.tags.some((tag) => tag.includes(token))) score += 9;
                    if (text.includes(token)) score += 4;
                });
                if (exerciseItem.name.toLowerCase() === trimmedQuery) score += 30;
            }

            return { ...exerciseItem, searchScore: score };
        })
        .filter((exerciseItem) => exerciseItem.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore);
};

export const exerciseCategories = ["All", ...Array.from(new Set(exerciseDatabase.map((item) => item.category)))];

export const muscleGroups = [
    "All",
    ...Array.from(
        new Set(exerciseDatabase.flatMap((item) => [...item.primaryMuscles, ...item.secondaryMuscles]))
    ).sort(),
];
