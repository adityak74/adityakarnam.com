export type ImpactMetric = {
  value: string
  label: string
}

export const openSourceImpact = {
  snapshotLabel: "Public metrics snapshot · September 2026",
  heroMetrics: [
    { value: "78K+", label: "monthly PyPI downloads" },
    { value: "320+", label: "GitHub stars" },
    { value: "190+", label: "public repositories" },
    { value: "MLX-LM", label: "upstream contributor" },
  ] satisfies ImpactMetric[],
  featuredProject: {
    name: "mcp-scholarly",
    eyebrow: "Open-source impact",
    title: "Scholarly retrieval infrastructure that people use.",
    description:
      "An MCP server that gives AI clients a direct path to current, inspectable scholarly sources. It is distributed through PyPI, Docker, Smithery, and MCP ecosystem directories.",
    metrics: ["78K+ monthly PyPI downloads", "~180 GitHub stars", "26+ forks"],
    links: [
      { label: "GitHub", href: "https://github.com/adityak74/mcp-scholarly" },
      { label: "PyPI", href: "https://pypi.org/project/mcp-scholarly/" },
    ],
  },
  googleDriveAction: {
    name: "Google Drive Upload Action",
    description: "Reusable CI/CD infrastructure for uploading workflow artifacts to Google Drive.",
    metrics: ["108 GitHub stars", "24 forks"],
    href: "https://github.com/adityak74/google-drive-upload-git-action",
  },
  upstreamProjects: ["MLX-LM", "Model Context Protocol", "BuilderIO gpt-crawler", "ML Homelab"],
  technicalDepth: {
    name: "Quecto, Embenx, and Subagent Fleet",
    description:
      "Original agent runtime, retrieval, and local-compute systems built alongside the adopted tools and upstream contributions.",
  },
}
