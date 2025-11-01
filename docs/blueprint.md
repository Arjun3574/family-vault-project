# **App Name**: FamilyVault

## Core Features:

- Secure User Authentication: Utilize Firebase Authentication for secure user login, role management (admin/user), and social login options (Google, Email/Password).
- Family ID Management: Generate and manage unique Family IDs for secure family group creation and access control within Firestore.
- Photo Upload & Storage: Enable users to upload photos with optional text and voice notes, storing media files in Cloud Storage with metadata in Firestore.
- Dynamic Photo Wall Display: Fetch and display photos with dynamic layouts based on tags (e.g., 'Trip,' 'Birthday') using CSS animations.
- Special Days Automation: Automated photo memory generation for important family milestones (birthdays, anniversaries) using Cloud Functions to generate composite images and notifications.
- Content Filtering and Theming: Implement content filtering by tags and layout theming based on event type for customized photo display.
- AI theme Tool: Leverage a generative AI model to incorporate themeTemplate suggestions to choose overlays, banners, or animation styles automatically when the Special Day trigger executes the automation. The reasoning used by the LLM determines the selection and rendering of family event based digital art.

## Style Guidelines:

- Primary color: Soft lavender (#E6E6FA) for a nostalgic and calming feel.
- Background color: Very light gray (#F5F5F5), almost white, to emphasize the photos and provide a clean backdrop.
- Accent color: Muted rose (#D8BFD8) for a warm, gentle highlight.
- Headline font: 'Playfair', a modern serif, for titles and special day headings; Body font: 'PT Sans' a humanist sans-serif.
- Note: currently only Google Fonts are supported.
- Use hand-drawn style icons to reinforce the nostalgic theme.
- Implement card-based layouts with rounded corners for photos, creating a scrapbook-like feel.
- Subtle fade-in animations on photo load and gentle transitions for a smooth user experience.