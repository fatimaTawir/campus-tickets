import os

search_string = '<span>📊</span> Organizer'
replace_string = '<BarChart2 className="w-4 h-4" /> Organizer'

import_search = "import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut, Star, Check } from 'lucide-react'"
import_replace = "import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut, Star, Check, BarChart2 } from 'lucide-react'"

for root, dirs, files in os.walk('app/dashboard'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if search_string in content:
                content = content.replace(search_string, replace_string)
                if import_search in content:
                    content = content.replace(import_search, import_replace)
                else:
                    # just in case the import is slightly different
                    if 'BarChart2' not in content:
                        content = content.replace("} from 'lucide-react'", ", BarChart2 } from 'lucide-react'")
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {path}")
