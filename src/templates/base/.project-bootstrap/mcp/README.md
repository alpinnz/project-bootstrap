# MCP Config

MCP is optional. Native tools come first.

Default posture:
- READ ONLY
- project-scoped
- least privilege

Write access requires an explicit requirement. Never store credentials, expose secrets, or allow destructive actions by default.

For each capability you enable, record:
- provider
- what it can read / write
- credentials it can access
- whether it is project-scoped and read-only
