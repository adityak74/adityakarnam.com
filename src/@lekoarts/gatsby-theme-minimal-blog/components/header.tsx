/** @jsx jsx */
import { jsx } from "theme-ui";
import useSiteMetadata from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-site-metadata";
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config";
import ColorModeToggle from "@lekoarts/gatsby-theme-minimal-blog/src/components/colormode-toggle";
import Navigation from "@lekoarts/gatsby-theme-minimal-blog/src/components/navigation";
import HeaderTitle from "@lekoarts/gatsby-theme-minimal-blog/src/components/header-title";
import HeaderExternalLinks from "./header-external-links";

type HeaderProps = {
  children?: React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  const { siteTitle } = useSiteMetadata();
  const { navigation: nav, externalLinks } = useMinimalBlogConfig();

  return (
    <header sx={{ mb: [5, 6] }}>
      <div
        sx={{
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
        }}
      >
        <HeaderTitle />
        <ColorModeToggle />
      </div>
      <div
        sx={{
          boxSizing: `border-box`,
          display: `flex`,
          variant: `dividers.bottom`,
          alignItems: `center`,
          justifyContent: `space-between`,
          mt: `12px`,
          pt: `10px`,
          color: `secondary`,
          a: {
            color: `secondary`,
            ":hover": { color: `primary` },
            transition: `color 0.2s ease`,
          },
          flexFlow: `wrap`,
          gap: 2,
        }}
      >
        <Navigation nav={nav} />
        {externalLinks && externalLinks.length > 0 && (
          <HeaderExternalLinks links={externalLinks} />
        )}
      </div>
      {children}
    </header>
  );
};

export default Header;
