/** @jsx jsx */
import { jsx } from "theme-ui";
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config";
import Navigation from "@lekoarts/gatsby-theme-minimal-blog/src/components/navigation";
import HeaderTitle from "@lekoarts/gatsby-theme-minimal-blog/src/components/header-title";
import HeaderExternalLinks from "./header-external-links";
import { SiteBanner } from "../../../components/SiteBanner";

type HeaderProps = {
  children?: React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  const { navigation: nav, externalLinks } = useMinimalBlogConfig();

  return (
    <header sx={{ mb: [5, 6], pt: [2, 3] }}>
      <SiteBanner />
      <div
        sx={{
          display: `flex`,
          alignItems: `flex-start`,
          justifyContent: `space-between`,
          gap: 3,
          flexWrap: `wrap`,
        }}
      >
        <div>
          <HeaderTitle />
          <div sx={{ color: `secondary`, fontSize: 1, mt: 1, maxWidth: `26rem`, letterSpacing: `-0.01em` }}>
            AI researcher building the infrastructure layer for reliable agents.
          </div>
        </div>
      </div>
      <div
        sx={{
          boxSizing: `border-box`,
          display: `flex`,
          borderBottom: `1px solid`,
          borderColor: `divide`,
          alignItems: `center`,
          justifyContent: `space-between`,
          mt: 3,
          pt: 3,
          pb: 2,
          color: `secondary`,
          a: {
            color: `secondary`,
            ":hover": { color: `primary` },
            transition: `color 120ms cubic-bezier(0.4, 0, 0.2, 1)`,
          },
          flexFlow: `wrap`,
          gap: 3,
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
