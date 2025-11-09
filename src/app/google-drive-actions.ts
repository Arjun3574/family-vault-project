'use client';

/**
 * Uploads a file to the user's hidden Google Drive appDataFolder.
 * @param {string} token - The OAuth 2.0 Access Token.
 * @param {File} fileObject - The File object from the <input>.
 */
export async function uploadToGoogleDrive(token: string, fileObject: File) {
  
  // 1. Define the file's metadata (its name and where to put it)
  const metadata = {
    name: fileObject.name, // Use the file's original name
    parents: ['appDataFolder'] // This is the key for the hidden folder
  };

  // 2. Create a form to send the data
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', fileObject);

  console.log("Uploading to Google Drive...");

  try {
    // 3. Send the upload request to the Google Drive API
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        // 4. THIS IS THE KEY: Authorize your request with the token
        'Authorization': `Bearer ${token}` 
      },
      body: form
    });

    if (!response.ok) {
      // If the upload failed, show the error
      const errorData = await response.json();
      throw new Error(`Upload failed: ${errorData.error.message}`);
    }

    const file = await response.json();
    console.log("File uploaded successfully! File ID:", file.id);
    return file; // Return the success data

  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Pass the error along to be handled
  }
}
