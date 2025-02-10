import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  graphqlTypegen: true,
  flags: {
    DEV_SSR: true,
  },
  plugins: [
    // Load the plugin with its options
    {
      resolve: `plugin`,
      options: {
        verbose: true,
        extraIcons: [
          "borg", // what the fuck is this icon for
        ],
      }
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-preload-fonts`
  ],
}

export default config
