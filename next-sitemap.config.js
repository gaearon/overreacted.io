/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://weekly.zisheng.pro",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: "out",
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
}