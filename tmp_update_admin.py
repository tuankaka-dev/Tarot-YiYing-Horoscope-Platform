import os

target_files = [
    r"src\app\api\admin\users\[id]\credits\route.ts",
    r"src\app\api\admin\users\route.ts",
    r"src\app\api\admin\transactions\route.ts",
    r"src\app\api\admin\notifications\[id]\route.ts",
    r"src\app\api\admin\notifications\route.ts",
    r"src\app\api\admin\hexagrams\route.ts",
    r"src\app\api\admin\api-config\route.ts"
]

search_str = "    if (user.user_metadata?.role !== 'admin' && user.app_metadata?.role !== 'admin') return null;"
replace_str = """    let isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    if (!isAdmin) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        isAdmin = profile?.role === 'admin';
    }
    if (!isAdmin) return null;"""

for rel_path in target_files:
    path = os.path.join(r"c:\Users\Admin\Desktop\gieoque.online", rel_path)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if it has already been replaced
        if replace_str in content:
            print(f"Already updated: {rel_path}")
            continue

        if search_str in content:
            new_content = content.replace(search_str, replace_str)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {rel_path}")
        else:
            print(f"Search string not found in {rel_path}")
    else:
        print(f"File not found: {rel_path}")
