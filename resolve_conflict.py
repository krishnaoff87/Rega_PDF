import os
import re

kt_path = r"c:\Users\Reena\Desktop\PoC_BOB\Mark_2\ANDROID_APP\app\src\main\java\com\example\regapdf\MainActivity.kt"
if os.path.exists(kt_path):
    with open(kt_path, 'r', encoding='utf-8') as f:
        kt = f.read()

    # Find the conflict block
    # <<<<<<< HEAD
    # [remote code]
    # =======
    # [my code]
    # >>>>>>> ...
    
    pattern = r"<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>>.*?\n"
    match = re.search(pattern, kt, re.DOTALL)
    
    if match:
        remote_code = match.group(1)
        my_code = match.group(2)
        
        resolved = remote_code + "\n" + my_code
        kt = kt[:match.start()] + resolved + kt[match.end():]
        
        with open(kt_path, 'w', encoding='utf-8') as f:
            f.write(kt)
        print("Conflict resolved!")
    else:
        print("No conflict markers found?!")
