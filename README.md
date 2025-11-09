# FamilyVault: Your Private Digital Scrapbook

FamilyVault is a secure, private web application designed to be a digital scrapbook for your family. It provides a shared space where family members can upload photos, share stories, and celebrate special moments together, creating a lasting archive of cherished memories.

### Core Features

*   **Secure Authentication:** Users can create an account and log in using their email and password or their Google account.
*   **Private Family Groups:** After signing in, a user can either create a new family group, which makes them the owner, or join an existing family by entering a unique Family ID. This ensures all content is private to the family.
*   **Photo Wall:** The main dashboard is a beautiful, masonry-style "Photo Wall" that displays all the photos uploaded by family members. Photos are displayed with a slight, playful rotation, giving the feel of a physical scrapbook.
*   **Photo Uploads & Storytelling:** Members can upload photos and add a text note to tell the story behind the image. They can also add comma-separated tags (e.g., "vacation", "birthday", "summer 2024") to organize their memories.
*   **Tag-Based Filtering:** The Photo Wall can be easily filtered by clicking on tags, allowing you to quickly find specific collections of memories.
*   **Special Days & AI Themes:** You can add important family milestones like birthdays and anniversaries. The application uses Generative AI (Genkit) to suggest creative theme templates (e.g., "fireworks," "confetti," "photo album") for these events, helping to inspire automated memory collections.
*   **Real-time Updates:** Built on Firebase, the application updates in real-time. When one family member uploads a photo, it appears instantly for everyone else in the family group without needing to refresh the page.

### Technology Stack

*   **Framework:** Next.js with the App Router
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with ShadCN UI components for a modern and responsive design.
*   **Backend & Database:**
    *   **Firebase Authentication:** For user sign-up and login.
    *   **Firestore:** As the real-time NoSQL database for storing user profiles, family groups, photo metadata, and special days.
    *   **Firebase Storage:** For securely storing the uploaded photo files.
*   **Generative AI:** Google's Genkit is used for the "Theme Suggester" feature on the Special Days page.

This project is a complete, full-stack application that demonstrates how to build a modern, real-time, and AI-enhanced web application using a powerful and scalable technology stack.
