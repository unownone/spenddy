import React from "react";

const LandingFooter: React.FC = () => (
  <footer className="py-12 border-t text-center text-sm text-muted-foreground">
    <div className="space-x-4">
      <a
        href="https://github.com/unownone/spenddy"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground"
      >
        GitHub
      </a>
      <a href="/source/privacy-policy" className="hover:text-foreground">
        Privacy
      </a>
      <a
        href="https://github.com/unownone/spenddy/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground"
      >
        MIT License
      </a>
    </div>
    <p className="mt-4">Made with ❤️ by Spenddy</p>
  </footer>
);

export default LandingFooter; 