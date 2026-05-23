import os

kt_path = r"c:\Users\Reena\Desktop\PoC_BOB\Mark_2\ANDROID_APP\app\src\main\java\com\example\regapdf\MainActivity.kt"
if os.path.exists(kt_path):
    with open(kt_path, 'r', encoding='utf-8') as f:
        kt = f.read()

    old_logic = """                        val fileUri = Uri.parse(uriString)
                        val openIntent = Intent(Intent.ACTION_VIEW)
                        openIntent.setDataAndType(fileUri, mimeType)
                        openIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        try {
                            context.startActivity(openIntent)
                        } catch (e: Exception) {
                            Toast.makeText(context, "Downloaded! Check your Downloads folder.", Toast.LENGTH_LONG).show()
                        }"""

    new_logic = """                        val openFolderIntent = Intent(DownloadManager.ACTION_VIEW_DOWNLOADS)
                        openFolderIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        try {
                            context.startActivity(openFolderIntent)
                            Toast.makeText(context, "File downloaded successfully!", Toast.LENGTH_SHORT).show()
                        } catch (e: Exception) {
                            Toast.makeText(context, "Downloaded! Check your Downloads folder.", Toast.LENGTH_LONG).show()
                        }"""

    kt = kt.replace(old_logic, new_logic)

    with open(kt_path, 'w', encoding='utf-8') as f:
        f.write(kt)
        
    print("Patched MainActivity to open Downloads folder again!")
