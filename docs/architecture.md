# Sinkhole Architecture

- `app/layout.js`: global shell with sticky nav and footer.
- `app/page.js`: branded sinkhole hero and featured tools.
- `app/tools/page.js`: all tools directory.
- `app/tools/[slug]/page.js`: shared interactive tool shell.
- `app/api/tools/route.js`: tool execution API.
- `app/api/savings/route.js`: persistent savings datastore access.
