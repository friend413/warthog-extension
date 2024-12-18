# Warthog Wallet Extension

The **Warthog Wallet Extension** is a feature-rich browser extension for seamless interaction with the **Warthog Network**. Built for modern browsers, it provides a secure, efficient, and user-friendly interface for managing your Warthog assets.

---

## 🚀 Features

- **⚡ Modern Tech Stack**: Built with **React.js 18.3.1** and **TypeScript** for a robust and scalable architecture.
- **🎨 Tailwind CSS**: Ensures a sleek and responsive design for all screen sizes.
- **🔒 Secure**: Optimized for privacy and secure data handling.
- **🌐 Web3 Ready**: Compatible with decentralized applications in the Warthog ecosystem.
- **📱 Fully Responsive**: Offers a seamless experience across devices.

---

## 📦 Installation

Follow these steps to install and run the Warthog Wallet Extension:

1. Clone the repository:

   ```bash
   git clone https://github.com/Crypto-Pioneers/warthog-wallet-extension.git

   cd warthog-wallet-extension
   ```
2. Make **.env** file and fix the variables

   Make **.env** file by renaming **.env.sample** file.
   ```bash
   mv .env.sample .env
   ```

   Fix the variables

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Build the extension for production:

   ```bash
   npm run build
   ```
   
## ⚙️ Building a Firefox Add-on as an XPI

Follow this simple guide to build your Firefox extension into an XPI file, ready for testing or distribution!

---

### **Step 1: Move to Your Build Directory**
Ensure you're in the correct directory where your extension files are located.

```bash
cd build
```

---

### **Step 2: Install `web-ext` Globally**
`web-ext` is a Mozilla-provided tool that helps validate, build, and run browser extensions. Install it globally using npm:

```bash
npm install --global web-ext
```

> **Note:** You need to have [Node.js](https://nodejs.org/) and npm installed on your system.

---

### **Step 3: Lint and Build Your Extension**

1. **Run the Linter**: Ensure your add-on files are valid and error-free.
   ```bash
   web-ext lint
   ```
   This step will check for any issues in your code or `manifest.json` file. Fix any reported errors before proceeding.

2. **Build the Extension**:
   Generate a packaged `.zip` file for your extension:
   ```bash
   web-ext build
   ```
   This will create a `web-ext-artifacts` folder containing the zip file.

---

### **Step 4: Rename the Zip File to XPI**
Firefox extensions use the `.xpi` format. Simply rename the `.zip` file to `.xpi`:

```bash
mv web-ext-artifacts/your-extension.zip your-extension.xpi
```

> **Tip**: For automation, you can include this step in your build script (e.g., `npm run build`).

---

### **Step 5: Test Your XPI Add-on**

1. Open Firefox.
2. Navigate to `about:config`. Search for **xpinstall.signatures.required**. Set it to **false**
3. Navigate to `about:addons`.
4. Click the gear icon ⚙️ , select **"Debug Add-ons"** and **"Load Temporary Add-on..."**
5. Choose your newly built `.xpi` file and confirm installation.

---


## 📄 Manifest Files

The extension's configuration is managed by the `public/manifest.json` file. This file defines key settings such as permissions, browser compatibility, and entry points.

To build and package the extension, run:

```bash
npm run build
```

---

## 🧑‍💻 Usage Instructions

### Load the Extension in Chrome Developer Mode

1. Navigate to the Extension Management page:

   - Open `chrome://extensions` in your browser.
   - Alternatively, access it via the Chrome menu: `More Tools > Extensions`.

2. Enable **Developer Mode**:

   - Toggle the **Developer mode** switch at the top-right of the Extensions page.

3. Load the unpacked extension:
   - Click the **Load unpacked** button.
   - Select the `build` folder from the project directory.

The extension will now be loaded and ready for use.

---

## 🛠️ Development Notes

- Ensure you’re using Node.js **22.x or higher**.
- Follow the coding standards defined in the project’s `.eslintrc` and `.prettierrc` configuration files.

---

## 📚 Resources & Documentation

Explore additional resources to enhance your development experience:

- [Chrome Extension Developer Guide](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [React.js Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
