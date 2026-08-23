# Security Rules

- Treat all external input as untrusted.
- Validate input at system boundaries. Use parameterized queries; never concatenate untrusted input into SQL.
- Never hardcode passwords, tokens, API keys, or private keys.
- Use least privilege and secure defaults. Do not disable security controls to make functionality work.
- Keep authentication and authorization distinct; enforce authorization at trusted boundaries.
- Do not log sensitive credentials or tokens.
