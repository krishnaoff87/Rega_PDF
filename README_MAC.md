# How to Build Your Mac App in the Cloud ☁️🍏

Since you are working on a Windows PC, I have created a **GitHub Actions Workflow** that will automatically rent an Apple Mac server in the cloud, build your application, and give you the `.dmg` download link!

## Step-by-Step Instructions

1. **Upload to GitHub**:
   - Create a free account on [GitHub.com](https://github.com/) (if you don't have one).
   - Create a new, private repository.
   - Upload all the files in your `Mark_2` folder to that repository (you can just drag and drop them into the web browser). 
   - *Make sure the hidden `.github` folder I just created gets uploaded too!*

2. **Trigger the Build**:
   - Once your files are uploaded, click on the **"Actions"** tab at the top of your GitHub repository.
   - On the left sidebar, click on the **"Build macOS DMG"** workflow.
   - Click the **"Run workflow"** button on the right side.

3. **Download your DMG!**:
   - The cloud server will spin up an actual Mac, install your Python code, bundle it into an `.app`, and squash it into a `.dmg`. (This usually takes about 3-5 minutes).
   - Once the job turns green, scroll down to the bottom of the summary page and you will see an **Artifacts** section.
   - Click **`PDFCompressor-Mac-Installer`** to download your brand new Mac `.dmg` file straight to your Windows PC!
