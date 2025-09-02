/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import MindockCTA from "../../../components/MindockCTA";

type PostHeaderProps = {
  post: any;
};

const PostHeader = ({ post }: PostHeaderProps) => {
  return (
    <div sx={{ mb: 6 }}>
      {/* Mindock CTA for all blog posts at the top */}
      <MindockCTA />
      
      {/* Optional: Add a separator line */}
      <div
        sx={{
          width: "100%",
          height: "1px",
          backgroundColor: "divider",
          marginTop: 4,
          marginBottom: 4,
        }}
      />
    </div>
  );
};

export default PostHeader;
