/** @jsx jsx */
import { jsx } from "theme-ui";
import { Link } from "gatsby";
import useMinimalBlogConfig from "@lekoarts/gatsby-theme-minimal-blog/src/hooks/use-minimal-blog-config";
import AnnouncementBar from "../../../components/AnnouncementBar";
import replaceSlashes from "@lekoarts/gatsby-theme-minimal-blog/src/utils/replaceSlashes";

const Header = ({ children }: { children?: React.ReactNode }) => {
  const { navigation: nav, basePath } = useMinimalBlogConfig();

  return (
    <header sx={{ pt: [3, 4], mb: [5, 6] }}>
      <AnnouncementBar />
      <div
        sx={{
          display: `flex`,
          alignItems: `center`,
          justifyContent: `space-between`,
          flexWrap: `wrap`,
          columnGap: 4,
          rowGap: 2,
          pb: 3,
          borderBottom: `1px solid`,
          borderColor: `divide`,
        }}
      >
        <Link
          to={replaceSlashes(`/${basePath}`)}
          aria-label="Aditya Karnam - home"
          sx={{ fontFamily: `heading`, fontSize: [`1.25rem`, `1.4rem`], letterSpacing: `-0.02em`, color: `heading`, textDecoration: `none`, ":hover": { color: `primary` } }}
        >
          Aditya Karnam
        </Link>
        <nav
          aria-label="Primary"
          sx={{ display: `flex`, flexWrap: `wrap`, columnGap: [3, 4], rowGap: 1, fontSize: `14px` }}
        >
          {nav.map((item) => (
            <Link
              key={item.slug}
              to={replaceSlashes(`/${basePath}/${item.slug}`)}
              activeClassName="active"
              partiallyActive
              sx={{
                color: `secondary`,
                textDecoration: `none`,
                py: `6px`,
                ":hover, &.active": { color: `heading` },
                "&.active": { textDecoration: `underline`, textDecorationColor: `primary`, textUnderlineOffset: `0.35em`, textDecorationThickness: `1px` },
              }}
            >
              {item.title}
            </Link>
          ))}
          <a
            href="https://www.linkedin.com/in/adityakarnamgrao/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ml: [0, 2],
              px: 3,
              py: `2px`,
              bg: `heading`,
              color: `background`,
              textDecoration: `none`,
              borderRadius: `3px`,
              ":hover": { bg: `primary`, color: `background` },
            }}
          >
            Contact
          </a>
        </nav>
      </div>
      {children}
    </header>
  );
};

export default Header;
