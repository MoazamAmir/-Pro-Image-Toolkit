// Form Templates Data - Organized by Category
// Each form has a name, background gradient, accent color, and field descriptors

export const formTemplates = {
    "Business": [
        {
            name: "Subscribe to our newsletter",
            bg: "linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)",
            accentColor: "#1f2937",
            borderColor: "#1f2937",
            fields: [
                { type: "input", label: "Enter your email" }
            ],
            buttonText: "Join mailing list",
            buttonStyle: { bg: "#f3f4f6", color: "#1f2937", border: "#1f2937" }
        },
        {
            name: "Contact Form",
            bg: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
            accentColor: "#1f2937",
            borderColor: "#1f2937",
            fields: [
                { type: "input", label: "Name" },
                { type: "input", label: "Email address" },
                { type: "textarea", label: "Leave a message..." }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#1f2937", color: "#ffffff" }
        },
        {
            name: "Project Intake Form",
            bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            accentColor: "#15803d",
            borderColor: "#86efac",
            fields: [
                { type: "input", label: "Email address" },
                { type: "label", text: "Budget range" },
                { type: "radio", options: ["Range [1-10]", "Range [10-100]", "Range [100-1000]"] },
                { type: "label", text: "Project type" },
                { type: "checkbox", options: ["Branding", "Website Design", "Marketing Campaign"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#15803d", color: "#ffffff" }
        },
        {
            name: "Lead Capture Form",
            bg: "linear-gradient(135deg, #1e3a5f 0%, #0c1929 100%)",
            accentColor: "#facc15",
            borderColor: "#facc15",
            textColor: "#ffffff",
            fields: [
                { type: "input", label: "Name and company" },
                { type: "input", label: "Work email" },
                { type: "label", text: "What are you most interested in?" },
                { type: "checkbox", options: ["Our services/products", "Pricing and packages", "A 30-minute consult and demo"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#facc15", color: "#1f2937" }
        },
        {
            name: "Make an Inquiry",
            bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            accentColor: "#1d4ed8",
            borderColor: "#3b82f6",
            fields: [
                { type: "label", text: "What would you like to know?" },
                { type: "checkbox", options: ["Website packages", "Prices and availability", "Project details", "How to apply for a loan"] },
                { type: "input", label: "Enter your email" }
            ],
            buttonText: "INQUIRE NOW",
            buttonStyle: { bg: "#1d4ed8", color: "#ffffff" }
        },
        {
            name: "Team Mood Check",
            bg: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
            accentColor: "#ffffff",
            borderColor: "#ffffff",
            textColor: "#ffffff",
            fields: [
                { type: "label", text: "How are you feeling this week?" },
                { type: "input", label: "" },
                { type: "label", text: "What's going well?" },
                { type: "input", label: "" },
                { type: "label", text: "What are your challenges?" },
                { type: "input", label: "" }
            ],
            buttonText: "Submit Check-in",
            buttonStyle: { bg: "#1f2937", color: "#ffffff" }
        }
    ],
    "Education": [
        {
            name: "Type your statement",
            bg: "linear-gradient(135deg, #fef9c3 0%, #fde047 100%)",
            accentColor: "#7c3aed",
            borderColor: "#a78bfa",
            fields: [
                { type: "input", label: "True" },
                { type: "input", label: "False" }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#7c3aed", color: "#ffffff" }
        },
        {
            name: "Which of the following is NOT true?",
            bg: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            accentColor: "#ffffff",
            borderColor: "#ffffff",
            textColor: "#ffffff",
            fields: [
                { type: "radio", options: ["A. Australia is wider than the moon", "B. Africa is the largest continent", "C. The Nile is the world's longest river"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#facc15", color: "#1f2937" }
        },
        {
            name: "LESSON ASSESSMENT",
            bg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            accentColor: "#ffffff",
            borderColor: "#ffffff",
            textColor: "#ffffff",
            fields: [
                { type: "input", label: "Student name" },
                { type: "label", text: "Check your understanding! Which is correct?" },
                { type: "radio", options: ["Option 1", "Option 2"] },
                { type: "label", text: "What is your main takeaway?" },
                { type: "textarea", label: "" }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#1f2937", color: "#ffffff" }
        },
        {
            name: "Study Group Survey",
            bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
            accentColor: "#0369a1",
            borderColor: "#38bdf8",
            fields: [
                { type: "input", label: "Your name" },
                { type: "input", label: "Your email address" },
                { type: "label", text: "Which time slot works best for you?" },
                { type: "radio", options: ["Morning (8 - 11 AM)", "Afternoon (12 - 5 PM)", "Evening (6 - 9 PM)"] }
            ],
            buttonText: "Submit my preferences",
            buttonStyle: { bg: "#0369a1", color: "#ffffff" }
        },
        {
            name: "Comprehensive Quiz",
            bg: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
            accentColor: "#ffffff",
            borderColor: "#ffffff",
            textColor: "#ffffff",
            fields: [
                { type: "input", label: "Student name" },
                { type: "label", text: "True or false question" },
                { type: "radio", options: ["True", "False"] },
                { type: "label", text: "Multiple choice question" },
                { type: "radio", options: ["Option A", "Option B", "Option C"] },
                { type: "label", text: "Long answer question" },
                { type: "textarea", label: "" }
            ],
            buttonText: "Submit my answers",
            buttonStyle: { bg: "#facc15", color: "#1f2937" }
        },
        {
            name: "Club Sign-up Form",
            bg: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
            accentColor: "#1d4ed8",
            borderColor: "#60a5fa",
            fields: [
                { type: "input", label: "Your name" },
                { type: "input", label: "Email address" },
                { type: "label", text: "We're glad you're here. What catches you about the club?" },
                { type: "checkbox", options: ["Networking and meetups", "Online activities and discussions", "Skills workshops or training sessions"] }
            ],
            buttonText: "Join the club",
            buttonStyle: { bg: "#1f2937", color: "#ffffff" }
        }
    ],
    "Events": [
        {
            name: "RSVP",
            bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            accentColor: "#1f2937",
            borderColor: "#1f2937",
            fields: [
                { type: "input", label: "Your name" },
                { type: "label", text: "Are you coming?" },
                { type: "radio", options: ["Absolutely, wouldn't miss it!", "Can't make it this time"] },
                { type: "textarea", label: "Nominate a song for our playlist!" }
            ],
            buttonText: "RSVP now",
            buttonStyle: { bg: "#1f2937", color: "#ffffff" }
        },
        {
            name: "EVENT FEEDBACK",
            bg: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            accentColor: "#ffffff",
            borderColor: "#ffffff",
            textColor: "#ffffff",
            fields: [
                { type: "label", text: "HOW WOULD YOU RATE THE EVENT?" },
                { type: "rating", max: 5 },
                { type: "textarea", label: "SHARE YOUR FEEDBACK ON THE EVENT" },
                { type: "label", text: "WOULD YOU ATTEND FUTURE EVENTS?" },
                { type: "radio", options: ["YES", "MAYBE", "NO"] }
            ],
            buttonText: "SHARE FEEDBACK",
            buttonStyle: { bg: "#facc15", color: "#1f2937" }
        },
        {
            name: "You're Invited",
            bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
            accentColor: "#be185d",
            borderColor: "#f9a8d4",
            fields: [
                { type: "input", label: "Your name" },
                { type: "label", text: "Will you be attending our wedding?" },
                { type: "radio", options: ["Joyfully accept", "Regretfully decline"] },
                { type: "label", text: "Number of guest(s)" },
                { type: "input", label: "" },
                { type: "input", label: "Dietary needs" },
                { type: "input", label: "Notes" }
            ],
            buttonText: "RSVP",
            buttonStyle: { bg: "#be185d", color: "#ffffff" }
        },
        {
            name: "LUKE IS TURNING 5!",
            bg: "linear-gradient(135deg, #fef9c3 0%, #fde047 100%)",
            accentColor: "#7c3aed",
            borderColor: "#a78bfa",
            fields: [
                { type: "label", text: "Will you join us on our special day?" },
                { type: "radio", options: ["Yes, I'll be there", "Sorry, can't make it"] }
            ],
            buttonText: "SUBMIT",
            buttonStyle: { bg: "#7c3aed", color: "#ffffff" }
        },
        {
            name: "Event Registration Form",
            bg: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
            accentColor: "#dc2626",
            borderColor: "#f87171",
            fields: [
                { type: "input", label: "Full Name" },
                { type: "input", label: "Email Address" },
                { type: "label", text: "Choose your ticket type" },
                { type: "radio", options: ["Regular", "VIP"] }
            ],
            buttonText: "Register now",
            buttonStyle: { bg: "#dc2626", color: "#ffffff" }
        },
        {
            name: "Volunteer Sign-up Form",
            bg: "linear-gradient(135deg, #581c87 0%, #3b0764 100%)",
            accentColor: "#ffffff",
            borderColor: "#a855f7",
            textColor: "#ffffff",
            fields: [
                { type: "input", label: "Your name" },
                { type: "input", label: "E-mail address" },
                { type: "label", text: "Which volunteer role(s) are you interested in?" },
                { type: "checkbox", options: ["Event Support", "Admin Assistance", "Outreach"] },
                { type: "textarea", label: "Do you have any relevant skills or experience?" }
            ],
            buttonText: "Sign up",
            buttonStyle: { bg: "#a855f7", color: "#ffffff" }
        }
    ],
    "Feedback": [
        {
            name: "Rate your experience",
            bg: "linear-gradient(135deg, #a5f3fc 0%, #67e8f9 100%)",
            accentColor: "#0891b2",
            borderColor: "#22d3ee",
            fields: [
                { type: "rating", max: 5, style: "stars" }
            ],
            buttonText: "Submit Feedback",
            buttonStyle: { bg: "#0891b2", color: "#ffffff" }
        },
        {
            name: "Share your feedback",
            bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            accentColor: "#16a34a",
            borderColor: "#86efac",
            fields: [
                { type: "label", text: "Thanks for attending! What went over your limitations?" },
                { type: "textarea", label: "" }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#16a34a", color: "#ffffff" }
        },
        {
            name: "How did you hear about us?",
            bg: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)",
            accentColor: "#1d4ed8",
            borderColor: "#60a5fa",
            fields: [
                { type: "radio", options: ["Social media", "Word-of-mouth", "Commercial ad", "Other"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#1d4ed8", color: "#ffffff" }
        },
        {
            name: "Customer Feedback Survey",
            bg: "linear-gradient(135deg, #fef9c3 0%, #fde047 100%)",
            accentColor: "#15803d",
            borderColor: "#86efac",
            fields: [
                { type: "input", label: "Your email" },
                { type: "label", text: "How would you rate our services overall?" },
                { type: "rating", max: 5 },
                { type: "textarea", label: "Please share the reason for your rating..." }
            ],
            buttonText: "Submit Feedback",
            buttonStyle: { bg: "#15803d", color: "#ffffff" }
        },
        {
            name: "Testimonial Request Form",
            bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            accentColor: "#059669",
            borderColor: "#34d399",
            fields: [
                { type: "input", label: "Your name" },
                { type: "label", text: "How would you rate your overall experience?" },
                { type: "rating", max: 5 },
                { type: "textarea", label: "Care to share a few words about your experience?" },
                { type: "checkbox", options: ["Can we feature your testimonial?", "Yes, notify me by email"] }
            ],
            buttonText: "Submit Testimonial",
            buttonStyle: { bg: "#059669", color: "#ffffff" }
        },
        {
            name: "We'd love your quick feedback",
            bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            accentColor: "#16a34a",
            borderColor: "#86efac",
            fields: [
                { type: "label", text: "How useful is this session/event?" },
                { type: "rating", max: 5 },
                { type: "label", text: "What's one thing we could improve?" },
                { type: "input", label: "" },
                { type: "label", text: "Would you attend another session like this?" },
                { type: "radio", options: ["Yes", "No"] }
            ],
            buttonText: "Submit Feedback",
            buttonStyle: { bg: "#16a34a", color: "#ffffff" }
        },
        {
            name: "Product Feedback",
            bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
            accentColor: "#0284c7",
            borderColor: "#38bdf8",
            fields: [
                { type: "label", text: "How satisfied are you with our product?" },
                { type: "rating", max: 5 },
                { type: "label", text: "Which areas can we improve on?" },
                { type: "checkbox", options: ["Price", "Customer support"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#0284c7", color: "#ffffff" }
        },
        {
            name: "Workplace Feedback",
            bg: "linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)",
            accentColor: "#a21caf",
            borderColor: "#e879f9",
            fields: [
                { type: "label", text: "How are you feeling about work lately?" },
                { type: "input", label: "" },
                { type: "label", text: "How supported do you feel by your team/manager?" },
                { type: "radio", options: ["Very supported", "Somewhat supported", "Not supported at all"] },
                { type: "label", text: "How likely are you to recommend this workplace?" },
                { type: "rating", max: 5 }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#a21caf", color: "#ffffff" }
        }
    ],
    "Other": [
        {
            name: "Ask a simple question",
            bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            accentColor: "#1d4ed8",
            borderColor: "#60a5fa",
            fields: [
                { type: "radio", options: ["Yes please", "No thanks"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#22c55e", color: "#ffffff" }
        },
        {
            name: "Expense Tracker",
            bg: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
            accentColor: "#16a34a",
            borderColor: "#86efac",
            fields: [
                { type: "input", label: "Item purchased" },
                { type: "input", label: "Amount ($)" },
                { type: "label", text: "Expense type" },
                { type: "radio", options: ["Essential (groceries, bills, rent)", "Lifestyle (dining, entertainment, shopping)", "Other"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#16a34a", color: "#ffffff" }
        },
        {
            name: "Gift Wishlist",
            bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
            accentColor: "#be185d",
            borderColor: "#f9a8d4",
            fields: [
                { type: "input", label: "Your name" },
                { type: "label", text: "Choose five gifts" },
                { type: "checkbox", options: ["Something delicious", "Something fun", "Something useful"] },
                { type: "textarea", label: "More details to make sure gifts can be personalized" }
            ],
            buttonText: "Submit gift preferences",
            buttonStyle: { bg: "#be185d", color: "#ffffff" }
        },
        {
            name: "Icebreaker",
            bg: "linear-gradient(135deg, #a5f3fc 0%, #67e8f9 100%)",
            accentColor: "#0891b2",
            borderColor: "#22d3ee",
            fields: [
                { type: "label", text: "Which superpower would you choose?" },
                { type: "radio", options: ["Teleportation", "Invisibility", "Super Strength", "Telekinesis", "Time Travel"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#0891b2", color: "#ffffff" }
        },
        {
            name: "Goal Tracker",
            bg: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
            accentColor: "#ffffff",
            borderColor: "#c4b5fd",
            textColor: "#ffffff",
            fields: [
                { type: "input", label: "Date" },
                { type: "input", label: "Goal" },
                { type: "label", text: "What's your mood today?" },
                { type: "rating", max: 5 },
                { type: "label", text: "How energized are you? (1 = low)" },
                { type: "rating", max: 5 },
                { type: "textarea", label: "What's one action you'll take to move forward?" }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#1f2937", color: "#ffffff" }
        },
        {
            name: "IT'S TIME FOR TRIVIA",
            bg: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
            accentColor: "#ffffff",
            borderColor: "#ffffff",
            textColor: "#ffffff",
            fields: [
                { type: "label", text: "What is the most spoken native language in the world?" },
                { type: "radio", options: ["English", "Spanish", "Mandarin Chinese", "Hindi"] }
            ],
            buttonText: "Submit",
            buttonStyle: { bg: "#f97316", color: "#ffffff" }
        }
    ]
};

// Category metadata with icons
export const formCategories = [
    { id: 'Business', name: 'Business', icon: 'briefcase', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Education', name: 'Education', icon: 'graduationCap', color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'Events', name: 'Events', icon: 'calendar', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'Feedback', name: 'Feedback', icon: 'messageSquare', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'Other', name: 'Other', icon: 'moreHorizontal', color: 'text-gray-500', bg: 'bg-gray-500/10' }
];
