# BlogApp

A simple blogging application built with Node.js, Express, MongoDB (Mongoose), and EJS templates.

## Features
- User signup/signin with password hashing
- Create, edit, delete blogs
- Comments on blogs
- Profile and image uploads

## Local Setup
1. Install dependencies:

```bash
npm install
```

2. Create a `.env` (or set env variables) with your MongoDB URI and any secrets.

3. Run the app in development:

```bash
npm run dev
```

## Notes
- Update `views/partials/footer.ejs` to change social links.
- If `git push` fails, ensure a remote is configured and you have permission to push.

## License
MIT
