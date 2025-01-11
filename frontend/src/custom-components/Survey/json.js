export const json = {
    "title": "Welcome to Brawn",
    "description": "Let's get Started",
    "logo": "https://api.surveyjs.io/private/Surveys/files?name=3069d57f-107d-43c4-a17f-72811062121d",
    "logoPosition": "right",
    "pages": [
        {
            "name": "page1",
            "title": "What's your name?",
            "elements": [
                {
                    "type": "text",
                    "name": "question1",
                    "title": "Full Name",
                    "isRequired": true,
                    "placeholder": "John Doe"
                },
                {
                    "type": "text",
                    "name": "question2",
                    "title": "Email",
                    "isRequired": true,
                    "inputType": "email",
                    "placeholder": "someone@email.com"
                },
                {
                    "type": "text",
                    "name": "question3",
                    "title": "Height (cm)",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 0
                },
                {
                    "type": "text",
                    "name": "question4",
                    "title": "Weight (kg)",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 0
                },
                {
                    "type": "text",
                    "name": "question5",
                    "title": "Age",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 0
                },
                {
                    "type": "radiogroup",
                    "name": "question6",
                    "title": "Gender",
                    "isRequired": true,
                    "choices": [
                        {
                            "value": "Male",
                            "text": "Male"
                        },
                        {
                            "value": "Female",
                            "text": "Female"
                        }
                    ],
                    "showOtherItem": true
                },
                {
                    "type": "text",
                    "name": "question7",
                    "title": "Years of Working Out",
                    "isRequired": true,
                    "inputType": "number",
                    "min": 0
                },
                {
                    "type": "html",
                    "name": "question9",
                    "html": "<a \n  href=\"/your-link-here\"\n  class=\"inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-brawn text-primary-foreground hover:bg-brawn/90 h-10 px-4 py-2\"\n>\nGo to Brawn\n</a>"
                }
            ]
        }
    ]
}