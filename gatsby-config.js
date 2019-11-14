const path = require(`path`)

const config = require(`./src/utils/siteConfig`)
const generateRSSFeed = require(`./src/utils/rss/generate-feed`)

let ghostConfig

try {
    ghostConfig = require(`./.ghost`)
} catch (e) {
    ghostConfig = {
        production: {
            apiUrl: process.env.GHOST_API_URL,
            contentApiKey: process.env.GHOST_CONTENT_API_KEY,
        },
    }
} finally {
    const { apiUrl, contentApiKey } = process.env.NODE_ENV === `development` ? ghostConfig.development : ghostConfig.production

    if (!apiUrl || !contentApiKey || contentApiKey.match(/<key>/)) {
        throw new Error(`GHOST_API_URL and GHOST_CONTENT_API_KEY are required to build. Check the README.`) // eslint-disable-line
    }
}

/**
* This is the place where you can tell Gatsby which plugins to use
* and set them up the way you want.
*
* Further info 👉🏼 https://www.gatsbyjs.org/docs/gatsby-config/
*
*/
module.exports = {
    siteMetadata: {
        siteUrl: config.siteUrl,
    },
    plugins: [
        /**
         *  Content Plugins
         */
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: path.join(__dirname, `src`, `pages`),
                name: `pages`,
            },
        },
        // Setup for optimised images.
        // See https://www.gatsbyjs.org/packages/gatsby-image/
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: path.join(__dirname, `src`, `images`),
                name: `images`,
            },
        },
        `gatsby-plugin-sharp`,
        `gatsby-transformer-sharp`,
        {
            resolve: `gatsby-source-ghost`,
            options:
                process.env.NODE_ENV === `development`
                    ? ghostConfig.development
                    : ghostConfig.production,
        },
        /**
         *  Utility Plugins
        */

         /* gatsby-plugin-ghost-manifest
            ----------------------------- 
           url: https://www.gatsbyjs.org/packages/gatsby-plugin-manifest/

           Seems to be based on gatsby-plugin-manifests. This plugin allows users to add the site to
           their home screen on most mobile browsers. The manifest procides configuration and icons to
           the phone. Part of the PWA spec 

         */
        {
            resolve: `gatsby-plugin-ghost-manifest`,
            options: {
                short_name: config.shortTitle,
                start_url: `/`,
                background_color: config.backgroundColor,
                theme_color: config.themeColor,
                display: `minimal-ui`,
                icon: `static/${config.siteIcon}`,
                legacy: true,
                query: `
                {
                    allGhostSettings {
                        edges {
                            node {
                                title
                                description
                            }
                        }
                    }
                }
              `,
            },
        },

        /*
         gatsby-plugin-feed
         -------------------
         url: https://www.gatsbyjs.org/packages/gatsby-plugin-feed/?=gatsby%20plugin%20fee

         Create and RSS feed, uses the src/utils/rss/generate-feed.js

         */
        {
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
                {
                    allGhostSettings {
                        edges {
                            node {
                                title
                                description
                            }
                        }
                    }
                }
              `,
                feeds: [
                    generateRSSFeed(config),
                ],
            },
        },
        /*
        gatsby-plugin-advanced-sitemap
        -------------------------------

        url: https://www.gatsbyjs.org/packages/gatsby-plugin-advanced-sitemap/?=gatsby%20plugin%20advanced

        adds more power and configuration to default gatsby sitemap generator. More human and machine readable
        site maps

        */
        {
            resolve: `gatsby-plugin-advanced-sitemap`,
            options: {
                query: `
                {
                    allGhostPost {
                        edges {
                            node {
                                id
                                slug
                                updated_at
                                created_at
                                feature_image
                            }
                        }
                    }
                    allGhostPage {
                        edges {
                            node {
                                id
                                slug
                                updated_at
                                created_at
                                feature_image
                            }
                        }
                    }
                    allGhostTag {
                        edges {
                            node {
                                id
                                slug
                                feature_image
                            }
                        }
                    }
                    allGhostAuthor {
                        edges {
                            node {
                                id
                                slug
                                profile_image
                            }
                        }
                    }
                }`,
                mapping: {
                    allGhostPost: {
                        sitemap: `posts`,
                    },
                    allGhostTag: {
                        sitemap: `tags`,
                    },
                    allGhostAuthor: {
                        sitemap: `authors`,
                    },
                    allGhostPage: {
                        sitemap: `pages`,
                    },
                },
                exclude: [
                    `/dev-404-page`,
                    `/404`,
                    `/404.html`,
                    `/offline-plugin-app-shell-fallback`,
                ],
                createLinkInHead: true,
                addUncaughtPages: true,
            },
        },
        /*
        gatsby-plugin-catch-links
        --------------------------

        url: https://www.gatsbyjs.org/packages/gatsby-plugin-catch-links/?=gatsby%20plugin%20catch

        Intercepts all local links that have not been created in React using gatsby-link
        */
        `gatsby-plugin-catch-links`,
        /*
        gatsby-plugin-react-helmet
        ---------------------------

        url: https://www.gatsbyjs.org/packages/gatsby-plugin-react-helmet/?=gatsby%20plugin%20react

        Provides support for server rendering data with React Helmet, Lets you control your document head 
        using their react component
        */
        `gatsby-plugin-react-helmet`,

        /*

        gatsby-plugin-force-trailing-slashes
        ------------------------------------

        url: https://www.gatsbyjs.org/packages/gatsby-plugin-force-trailing-slashes/?=gatsby%20plugin%20force

        Forces trailing slashes from your projects paths

        */
        `gatsby-plugin-force-trailing-slashes`,
        /*
        gatsby-plugin-offline
        
        url: https://www.gatsbyjs.org/packages/gatsby-plugin-offline/?=gatsby%20plugin%20offl

        Drop in support for making a Gatsby site work offline
        */
        `gatsby-plugin-offline`,
    ],
}
