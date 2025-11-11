
# FamilyVault: A Step-by-Step Build Guide

This document provides a comprehensive guide to recreating the FamilyVault application from scratch in a new Firebase project using Firebase Studio.

---

## Phase 1: Backend & API Configuration

Before writing any code, you must set up the backend services that the application relies on.

### Step 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and follow the on-screen instructions to create a new project. You do not need to enable Google Analytics.

### Step 2: Configure Firebase Services

You need to enable and configure Authentication, Firestore, and Storage.

#### A. Firebase Authentication

1.  In the Firebase Console, go to **Authentication** (under the "Build" menu).
2.  Click **Get started**.
3.  On the **Sign-in method** tab, you need to enable two providers:
    *   **Email/Password:** Click on it, toggle the **Enable** switch, and click **Save**.
    *   **Google:** Click on it, toggle the **Enable** switch, select a project support email, and click **Save**.

#### B. Firestore Database

1.  In the Firebase Console, go to **Firestore Database** (under the "Build" menu).
2.  Click **Create database**.
3.  Choose **Start in production mode**. You will be providing security rules later.
4.  Select a location for your database (e.g., `us-central`).
5.  Click **Enable**.

#### C. Firebase Storage

1.  In the Firebase Console, go to **Storage** (under the "Build" menu).
2.  Click **Get started**.
3.  Follow the on-screen prompts to enable Storage for your project.

### Step 3: Configure Cloudinary (CRITICAL)

The application uses Cloudinary for direct client-side image uploads. This requires a specific "unsigned" upload preset to be configured.

1.  **Create a Cloudinary Account:** If you don't have one, sign up for a free account at [Cloudinary](https://cloudinary.com/users/register/free).
2.  **Find Your Cloud Name:** On your Cloudinary Dashboard, find your **Cloud Name**. The application is currently hardcoded to use `dgodngj10`. If your cloud name is different, you will need to update it in `src/components/photos/upload-form.tsx`.
3.  **Enable Unsigned Uploads for the `ml_default` Preset:**
    *   In your Cloudinary Dashboard, go to **Settings** by clicking the gear icon in the top right.
    *   Click on the **Upload** tab.
    *   Scroll down to the **Upload presets** section at the bottom.
    *   You will see a preset named **`ml_default`**. Click the **Edit** link next to it.
    *   Find the **Signing Mode** option. It is likely set to `Signed`.
    *   Change the **Signing Mode** from `Signed` to **`Unsigned`**.
    *   Click the **Save** button at the top of the page.

### Step 4: Configure Storage CORS Settings (CRITICAL)

This is the most common point of failure. You must explicitly tell Firebase Storage to accept uploads from your Firebase Studio development environment.

1.  **Create a `cors.json` file:** On your local computer, create a file named `cors.json` and paste the following content into it:
    ```json
    [
      {
        "origin": [
          "http://localhost:3000",
          "https://6000-firebase-studio-1761983285994.cluster-73qgvk7hjjadkrjeyexca5ivva.dev"
        ],
        "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "responseHeader": [
          "Content-Type",
          "Access-Control-Allow-Origin"
        ],
        "maxAgeSeconds": 3600
      }
    ]
    ```
    *Note: The specific `cloudworkstations.dev` URL is unique to this development environment. For a new project, you would need to get the new URL from the browser.*

2.  **Apply the configuration:**
    *   Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) on your local machine to get the `gsutil` command.
    *   Open a terminal or command prompt.
    *   Navigate to where you saved `cors.json`.
    *   Run the command below, replacing `[YOUR_PROJECT_ID]` with your new Firebase Project ID (e.g., `studio-7029574972-369af`):
        ```bash
        gsutil cors set cors.json gs://[YOUR_PROJECT_ID].appspot.com
        ```

### Step 5: Enable Required Google Cloud APIs

The application uses Google APIs for AI features.

1.  Go to the [Google Cloud API Library](https://console.cloud.google.com/apis/library).
2.  Ensure your new Firebase project is selected at the top of the page.
3.  Search for and **Enable** the following API:
    *   **Gemini API** (also listed as `generativelanguage.googleapis.com`)

### Step 6: Get Project Configuration and Code

1.  **Update `firebase/config.ts`**: In your new Firebase Project Console, go to **Project Settings** (click the gear icon). Under the "General" tab, find the "Your apps" section. Copy the Firebase SDK configuration object. Paste this object into the `src/firebase/config.ts` file. (This has been done for you).
2.  **Update `firestore.rules`**: Copy the contents of the `firestore.rules` file from this project into the **Rules** tab of your Firestore Database in the Firebase Console. Click **Publish**.
3.  **Update `storage.rules`**: Copy the contents of the `storage.rules` file from this project into the **Rules** tab of your Storage in the Firebase Console. Click **Publish**.

---

## Phase 2: Code Implementation Overview

Once the backend is configured, you can build the application code. This project uses Next.js, React, and TypeScript. Here is a breakdown of the project structure and key components you would need to create.

### `src/app/` - Pages & Routing

*   **`layout.tsx` (Root):** Sets up global styles, fonts, and providers (`FirebaseClientProvider`, `AuthProvider`).
*   **`page.tsx` (Root):** The main landing page, which contains the login form (`UserAuthForm`).
*   **`(app)/` (Route Group):** Contains all pages that require a user to be authenticated.
    *   **`layout.tsx`:** A nested layout for the authenticated section, including the main `AppSidebar` and `Header`.
    *   **`dashboard/page.tsx`:** The main Photo Wall. Fetches photos from Firestore and displays them in a `PhotoGrid`.
    *   **`upload/page.tsx`:** The page for uploading new photos. Contains the `UploadForm`.
    *   **`family/page.tsx`:** The page for creating, joining, and managing the family group.
    *   **`special-days/page.tsx`:** The page for managing special family dates and using the AI theme suggester.

### `src/components/` - React Components

*   **`auth/`:** Components related to authentication, primarily `user-auth-form.tsx`.
*   **`family/`:** The `family-client.tsx` component, which contains the logic for creating and joining families.
*   **`layout/`:** Reusable layout components like `app-sidebar.tsx`, `header.tsx`, and `user-nav.tsx`.
*   **`photos/`:** Components for handling photos, including the `photo-grid.tsx`, `photo-card.tsx`, and `upload-form.tsx`.
*   **`special-days/`:** Components for the "Special Days" feature, including the `theme-suggester.tsx`.
*   **`ui/`:** The ShadCN UI components (Button, Card, Input, etc.) used throughout the app for a consistent design.

### `src/firebase/` - Firebase Integration

*   **`config.ts`:** Stores your unique Firebase project configuration.
*   **`client-provider.tsx` & `provider.tsx`:** A robust system for initializing Firebase on the client and providing the Firebase services (Auth, Firestore) and user state to the entire app via React Context.
*   **`firestore/`:** Contains the custom hooks `useCollection` and `useDoc` for real-time data fetching from Firestore.
*   **`server-init.ts`:** A utility for initializing Firebase in server-side code (Server Actions).

### `src/contexts/` - Global State

*   **`auth-provider.tsx`:** A critical file that manages the global authentication state. It tracks the current user, their profile from Firestore, and their `familyId`. It exposes this data to any component that needs it via the `useAuthContext` hook.

### `src/ai/` - Generative AI (Genkit)

*   **`genkit.ts`:** Initializes the Genkit framework with the Google AI plugin.
*   **`flows/suggest-theme-templates.ts`:** Defines the Genkit flow for the AI theme suggester. It includes the Zod schemas for input/output and the prompt sent to the Gemini model.

### `src/app/actions.ts` - Server Actions

This file contains functions that run securely on the server. They are used for sensitive operations like creating, joining, or deleting a family, and for saving photo metadata after a successful client-side upload.

By following this guide, you can successfully set up the backend and build the full-stack FamilyVault application.
