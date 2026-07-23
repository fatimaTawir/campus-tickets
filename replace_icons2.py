import os

files_to_update = [
    'app/tickets/[id]/page.tsx',
    'app/pay/[id]/page.tsx',
    'app/organizer/page.tsx',
    'app/organizer/events/page.tsx',
    'app/organizer/create/page.tsx',
    'app/help/page.tsx'
]

replacements = {
    '<span>??</span>': '<Home className="w-4 h-4" />',
    '<span>??</span>': '<Calendar className="w-4 h-4" />',
    '<span>???</span>': '<Ticket className="w-4 h-4" />',
    '<span>??</span>': '<Bell className="w-4 h-4" />',
    '<span>??</span>': '<Settings className="w-4 h-4" />',
    '<span>?</span>': '<HelpCircle className="w-4 h-4" />',
    '<span>??</span>': '<LogOut className="w-4 h-4" />',
    '?? Dashboard': '<Home className="w-4 h-4" /> Dashboard',
    '?? Sign out': '<LogOut className="w-4 h-4" /> Sign out',
    'icon: \'???\'': 'icon: <Ticket className="w-5 h-5 text-blue-600" />',
    '<div className="text-5xl mb-4">?</div>': '<div className="text-5xl mb-4 flex justify-center"><HelpCircle className="w-12 h-12 text-blue-600" /></div>'
}

import_statement = "import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut } from 'lucide-react'\n"

for file_path in files_to_update:
    if not os.path.exists(file_path):
        print(f"File {file_path} not found")
        continue

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add imports if not present
    if "import { Home" not in content and "lucide-react" not in content:
        # Find the last import statement
        lines = content.split('\n')
        last_import_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith('"use client"'):
                last_import_idx = i
        
        lines.insert(last_import_idx + 1, import_statement.strip())
        content = '\n'.join(lines)

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done replacing additional icons")
