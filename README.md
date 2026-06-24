# ScreenFocus 🎯

> A beautiful, unobtrusive digital wellbeing and productivity tracker for Windows.

ScreenFocus is a minimalist, gorgeous frosted-glass overlay that sits elegantly on your desktop. It silently tracks your active application usage, calculates your daily screen time, and presents everything in a visually stunning interface without interrupting your workflow.

## ✨ Features

- **True Desktop Integration**: Utilizing native Windows hooks (`WorkerW` and `Progman`), the widget pins itself directly to your desktop. It lives underneath your desktop icons and active windows, behaving like a true native gadget.
- **Stunning UI**: Designed with frosted glass aesthetics, smooth micro-animations (via Framer Motion), and a dynamic scenery background.
- **Smart Tracking**: Automatically detects what application you're currently using and tracks your exact active screen time.
- **Native App Icons**: Extracts and displays the native executable icons of the apps you use, reducing text clutter and keeping the interface clean.
- **Intelligent Idle Detection**: Automatically pauses tracking when you step away from your computer.
- **System Uptime vs Active Time**: Compare how long your PC has been on versus how long you've actually been actively using it today.
- **Delayed Categorization**: All apps start as "Uncategorized", allowing you to sort and tag them on your own terms.

## 🛠️ Technology Stack

- **Framework**: [Electron](https://www.electronjs.org/) + [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Tailwind CSS & vanilla CSS (Glassmorphism)
- **Animations**: Framer Motion
- **Database**: `better-sqlite3` (Local-first, privacy-focused storage)
- **State Management**: Zustand

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Windows OS (ScreenFocus relies heavily on Windows-specific APIs for tracking and desktop widget reparenting)

### Installation

1. Clone the repository and navigate to the folder:
   ```bash
   git clone https://github.com/yourusername/ScreenFocus.git
   cd ScreenFocus
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the application in development mode:
   ```bash
   npm run dev
   ```

### Building for Production

To create a standalone executable/installer for Windows, run:

```bash
npm run package
```
This will generate the installer in the `dist/` directory.

## 📝 Usage Notes
- The application stores its database and scripts locally in `%APPDATA%/screenfocus`. Your data never leaves your machine.
- To toggle between "Always on Top" and "Desktop Widget" modes, just click the Settings gear icon and change the layout preference.

## 📄 License
This project is licensed under the MIT License.
