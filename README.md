# Alpha contacts

A contact manager built with React and TypeScript. It has 10 sample contacts and two views: Table and Board.

[Live demo](https://alpha-submissionapp.vercel.app/)

## How to run

Install Node.js 22.12 or newer. Open this folder in a terminal and run:

```sh
npm ci
npm run dev
```

Open the link shown in the terminal.

Other commands:

```sh
npm run build   # Check the code and build the app
npm run preview # Open the built app
npm test        # Run the tests
```

## What you can do

- Switch between Table and Board.
- Contacts move smoothly between rows and cards when you switch views. The animation is skipped if your device asks for reduced motion. Browsers without this feature switch views normally.
- Open a contact by selecting any part of their row or card. With a keyboard, Tab to the name and press Enter.
- Change their Stage or Notes, then choose Save changes.
- For a quick stage change, use the dropdown in the table row or board card. It saves right away without opening the drawer.
- Choose Cancel to leave without saving.
- Search for a contact by name, company, email, role, owner, or label.

Both views use the same contact list. A saved change shows up in both views. Changing a stage moves the card to the right column.

The Customer column starts empty. Some contacts have missing details on purpose.

## Why I chose this layout

- The table shows more details so people can compare contacts quickly.
- The board makes it easy to see contacts at each stage.
- Cards show the name, role, company, labels, and owner.
- There is no sidebar because this app only has one page.
- There is no extra top header; the page title and view controls provide enough context.
- All 10 contacts are shown together for easy scanning. For a larger list, I would add pagination and a rows-per-page option.
- The details drawer uses two columns on desktop, so all fields fit without scrolling at common desktop sizes. On smaller screens, the fields stack.
- Save and Cancel are separate actions. Closing with unsaved changes asks before throwing them away.
- Quick stage changes save immediately. Changes made inside the drawer still use Save and Cancel.
- Closing the drawer takes you back to the same view and contact.

## Checks

The seven tests check saving, cancelling, quick stage changes, repeated edits, fast view switching, reduced motion, missing details, and search. I also checked the layout and keyboard controls in the browser.

## Limits and next steps

Changes last until you refresh the page. There is no server or database.

You can edit Stage and Notes only. Adding contacts and dragging cards are left out to keep the exercise small.

Next, I would test it with users, improve screen reader support, and add saved data if needed.
