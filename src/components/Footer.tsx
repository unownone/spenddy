import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 text-center text-xs text-muted-foreground border-t bg-muted/30">
      © 2025 <a href="https://ikr.one" className="underline hover:text-foreground">ikr.one</a> •{" "}
      <a
        href="https://github.com/unownone/spenddy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Star Spenddy on GitHub
      </a>
    </footer>
  );
};

export default Footer; 