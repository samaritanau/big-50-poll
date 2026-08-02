# The Big 5-0 Trip Poll

A lightweight static poll that stores responses using Netlify Forms.

- `/` contains the original destination poll.
- `/taiwan.html` contains the second-round Taiwan itinerary poll.

## Deploy to Netlify

1. Create a new Netlify project from this folder or its Git repository.
2. Leave the build command empty.
3. Set the publish directory to `.` if Netlify does not read it from `netlify.toml`.
4. In the Netlify project, open **Forms** and select **Enable form detection**.
5. Redeploy the site after enabling form detection.
6. Submit one test response, then confirm it appears under **Forms > trip-preferences**
   or **Forms > taiwan-preferences**.

Responses can be viewed in the Netlify dashboard or downloaded as a CSV. Email
notifications can be configured in **Project configuration > Notifications >
Emails and webhooks > Form submission notifications**.

## Local preview

Run any static file server from this directory. For example:

```powershell
npx serve .
```

The form itself only saves submissions after deployment to Netlify.
