const axios = require('axios');

const producyHuntUrl = 'https://www.producthunt.com/frontend/graphql';
const graphqlQuery = `query LegacyHomePage(
  $cursor: String
  $postCursor: String
) {
  sections(first: 1, after: $cursor) {
    edges {
      cursor
      node {
        id
        date
        posts(after: $postCursor) {
          edges {
            node {
              ...PostItemList
              featuredComment {
                id
                body: bodyText
                user {
                  id
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          pageInfo {
            endCursor
            hasNextPage
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    pageInfo {
      endCursor
      hasNextPage
      __typename
    }
    __typename
  }
}
fragment PostItemList on Post {
  id
  ...PostItem
  __typename
}
fragment PostItem on Post {
  id
  _id
  commentsCount
  name
  shortenedUrl
  slug
  tagline
  updatedAt
  pricingType
  topics(first: 1) {
    edges {
      node {
        id
        name
        slug
        __typename
      }
      __typename
    }
    __typename
  }
  ...PostThumbnail
  ...PostVoteButton
  __typename
}
fragment PostThumbnail on Post {
  id
  name
  thumbnailImageUuid
  ...PostStatusIcons
  __typename
}
fragment PostStatusIcons on Post {
  name
  productState
  __typename
}
fragment PostVoteButton on Post {
  createdAt
  ... on Votable {
    id
    votesCount
    __typename
  }
  __typename
}`;
const productHuntBody = {
  operationName: 'LegacyHomePage',
  variables: { cursor: 'MA==' },
  query: graphqlQuery,
};

module.exports.run = async () => {
  const response = await axios.post(producyHuntUrl, productHuntBody);
  const slackMsg = response.data.data.sections.edges[0].node.posts.edges.sort(
    (a, b) => b.node.votesCount - a.node.votesCount,
  ).slice(0, process.env.POST_COUNT).map((post) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*<https://www.producthunt.com/posts/${post.node.slug}|${post.node.name}>*\n:star: ${post.node.votesCount} votes\n ${post.node.tagline}`,
    },
    accessory: {
      type: 'image',
      image_url: `https://ph-files.imgix.net/${post.node.thumbnailImageUuid}`,
      alt_text: post.node.name,
    },
  }));
  await axios.post(process.env.WEBHOOK_URL, { blocks: slackMsg, text: 'Product Hunt Daily Digest' });
};
