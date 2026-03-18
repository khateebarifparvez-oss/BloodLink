# Deployed - https://capable-squirrel-c1d494.netlify.app/ 

# BloodLink - Blood Donor Finder
A simple blood donor finder web app for India, built with plain HTML, CSS, and JavaScript. No frameworks, no backend, no login required. Runs fully in the browser.

## About
BloodLink lets recipients search for blood donors across all 28 Indian state capitals. Anyone can also register themselves as a donor and get added to the list instantly.

## Features
- Search donors by city and blood group
- Detailed donor cards showing age, blood group, availability status, last donated date, and contact number
- Register as a donor via the "Be a Donor" form
- Emergency Mode that highlights and prioritizes available donors
- Donor count shown per city
- Works fully offline and locally

## Project Structure
bloodlink/
├── index.html      - Page structure and markup
├── style.css       - All styles
├── script.js       - All logic and donor data
└── favicon.svg     - Browser tab icon

## How to Run
1. Clone or download the repository
2. Open `index.html` in any browser
3. No installation or server needed

## Notes
- Donor data is randomly generated at load time using a seeded algorithm, so the same donors appear consistently per city
- All phone numbers shown are placeholder numbers (+91 0123456789) and are not real
- Data resets on page refresh — there is no persistent storage

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript

## Coverage
Donors are available across all 28 Indian state capitals including Hyderabad, Mumbai, Delhi, Bengaluru, Chennai, Kolkata, and more.