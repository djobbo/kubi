export default {
  versionGroups: [
    {
      dependencies: ["react", "react-dom"],
      policy: "sameMinor",
      packages: ["!@dair/cms"],
    },
    {
      dependencies: ["react", "react-dom", "react-router-dom"],
      packages: ["@dair/cms"],
      policy: "sameMinor",
    },
  ],
} satisfies import("syncpack").RcFile
