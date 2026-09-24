import json
import os

transcript_path = r'C:\Users\ASUS\.gemini\antigravity-ide\brain\98a3eb42-ec62-4fc0-9e94-154ac067fbb8\.system_generated\logs\transcript.jsonl'
files_to_restore = [
    'Login.jsx', 'Login.css', 'About.jsx', 'About.css'
]

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['function']['name'] == 'default_api:write_to_file':
                        args_str = call['function']['arguments']
                        try:
                            # Usually arguments is a JSON string in transcript
                            args = json.loads(args_str)
                        except:
                            args = args_str
                            
                        if isinstance(args, dict) and 'TargetFile' in args and 'CodeContent' in args:
                            tf = args['TargetFile']
                            for fname in files_to_restore:
                                if fname in tf:
                                    print(f"Restoring {tf}")
                                    with open(tf, 'w', encoding='utf-8') as out_f:
                                        out_f.write(args['CodeContent'])
        except Exception as e:
            pass
