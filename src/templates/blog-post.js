import * as React from "react"
import { Link, graphql } from "gatsby"
// rich Text
import {documentToReactComponents} from "@contentful/rich-text-react-renderer";
import {BLOCKS, MARKS} from "@contentful/rich-text-types"

import { GatsbyImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPostTemplate = ({ data, location }) => {
  const post = data.contentfulBooks
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data
  const json = JSON.parse(post.description.raw)
  
  const RICHTEXT_OPTIONS = {
    renderMark: {
      [MARKS.BOLD]: text => <p>{text}</p>,
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => (
         <p>{children}</p>
      ),
      [MARKS.BOLD]: (node, children) => (
         <p>{children}</p>
      ),
      "embedded-asset-block": node => {
        const { gatsbyImageData } = data.contentfulBooks.description.references[0]
        if (!gatsbyImageData) {
          // asset is not an image
          return null
        }
        return <GatsbyImage image={gatsbyImageData} />
      },
    },
  }
  console.log("previous", previous)
  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={post.name}
        description={post.description || post.excerpt}
      />
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.name}</h1>
          <p>Date: {post.createdAt}</p>
          <img src={post.picture.fixed.src} alt="fixed" width="100" height="150"/>
        </header>
        <section>
          {documentToReactComponents(json, RICHTEXT_OPTIONS)}
        </section>
                
        <hr />
        <footer>
          <Bio />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.slug} rel="prev">
                ← {previous.name}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.slug} rel="next">
                {next.name} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    contentfulBooks(id: { eq: $id }) {
      id
      name
      createdAt(formatString: "DD-MM-YYYY")
      description {
        raw
        references {
          ... on ContentfulAsset{
            contentful_id
            __typename
          }
          gatsbyImageData
        }
      }
      picture {
        fluid(maxHeight: 300, maxWidth: 300){
          ...GatsbyContentfulFluid
        }
        fixed{
          base64
          src
        }
      }
    }
    previous: contentfulBooks(id: { eq: $previousPostId }) {
      id
      slug
      name
    }
    next: contentfulBooks(id: { eq: $nextPostId }) {
      id
      slug
      name
    }
  }
`