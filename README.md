# Spelling Bee Practice App

A kid-friendly web application for elementary school students to practice spelling bee words from the 2024-2025 Scripps National Spelling Bee Study List.

## Features

- **450 spelling words** with definitions from the official study list
- **Two practice modes:**
  - **In Order** - Practice words sequentially, starting from any word number
  - **Random** - Practice words in random order
- **Text-to-Speech** - Hear the word pronounced (uses Web Speech API)
- **Hints** - Show the first letter and word length
- **Progress tracking** - Streak counter and accuracy percentage saved locally
- **Kid-friendly design** - Large fonts, bright colors, encouraging feedback
- **Responsive** - Works on laptops, iPads, and iPhones
- **No login required** - All data stored in browser

## Running Locally

Because this app uses ES6 modules, you need to serve it through a local web server (not just open the HTML file directly).

### Option 1: Python (Recommended)

If you have Python installed:

```bash
# Navigate to the project folder
cd C:\Users\vinay\vibing\practicebee

# Python 3
python -m http.server 8000

# Or Python 2
python -SimpleHTTPServer 8000
```

Then open http://localhost:8000 in your browser.

### Option 2: Node.js

If you have Node.js installed:

```bash
# Install a simple server globally (one time)
npm install -g serve

# Run the server
cd C:\Users\vinay\vibing\practicebee
serve .
```

### Option 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Use npx (Node.js)

```bash
cd C:\Users\vinay\vibing\practicebee
npx serve .
```

## Deploying to GitHub Pages

1. **Create a GitHub repository:**
   ```bash
   cd C:\Users\vinay\vibing\practicebee
   git init
   git add .
   git commit -m "Initial commit - Spelling Bee Practice App"
   ```

2. **Create a new repository on GitHub** (e.g., `spelling-bee-practice`)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/spelling-bee-practice.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" > "Pages"
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/ (root)" folder
   - Click "Save"

5. Your app will be live at: `https://YOUR_USERNAME.github.io/spelling-bee-practice/`

## Deploying to Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Drag and drop the `practicebee` folder onto the Netlify dashboard
3. Your site will be deployed instantly with a random URL
4. (Optional) Customize the URL in site settings

## Project Structure

```
practicebee/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles (kid-friendly, responsive)
├── js/
│   ├── app.js          # Main application logic
│   ├── words.js        # 450 words with definitions
│   ├── speech.js       # Text-to-speech functionality
│   └── storage.js      # LocalStorage for progress
└── README.md           # This file
```

## Browser Compatibility

- Chrome (recommended for best Text-to-Speech)
- Firefox
- Safari (iOS and macOS)
- Edge

Text-to-speech works best on Chrome. On other browsers, it will still work but may sound different.

## Tips for Parents/Teachers

- Start with word #1 for beginners (easier words)
- Words get progressively harder (word #400+ are challenging)
- Use "Random" mode for review sessions
- The app remembers where you left off in "In Order" mode
- Encourage kids to use the "Hear Word" button before typing

## Data Source

Words are from the official 2024-2025 Scripps National Spelling Bee School Study List.
