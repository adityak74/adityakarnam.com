/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaMedium,
  FaGoogle,
  FaHome,
} from "react-icons/fa";

type ExternalLink = {
  name: string;
  url: string;
};

type HeaderExternalLinksProps = {
  links: ExternalLink[];
};

const HeaderExternalLinks = ({ links }: HeaderExternalLinksProps) => (
  <div sx={{ "a:not(:first-of-type)": { ml: 3 }, fontSize: [1, `18px`] }}>
    {links.map((link) => {
      let IconComponent: React.ComponentType | null = null;

      switch (link.name) {
        case "LinkedIn":
          IconComponent = FaLinkedin;
          break;
        case "Twitter":
          IconComponent = FaTwitter;
          break;
        case "GitHub":
          IconComponent = FaGithub;
          break;
        case "Medium":
          IconComponent = FaMedium;
          break;
        case "Google Scholar":
          IconComponent = FaGoogle;
          break;
        case "Homepage":
          IconComponent = FaHome;
          break;
        case "Dzone":
          IconComponent = null; // Use text instead of icon
          break;
      }

      return (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: `secondary`,
            ":hover": { color: `heading` },
            display: "inline-flex",
            alignItems: "center",
            fontSize: "20px",
            transition: "color 0.3s ease",
          }}
          title={link.name}
        >
          {IconComponent ? React.createElement(IconComponent) : link.name}
        </a>
      );
    })}
  </div>
);

export default HeaderExternalLinks;
