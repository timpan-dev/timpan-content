import {
  getMdFiles,
  readMdFile,
  writePost
} from './api'

import uuid from 'uuid/v4'

async function main() {
  const files = await getMdFiles('./draft/posts')
  const posts = files.map(readMdFile).map(post => {
    post.data = { id: uuid(), ...post.data }
    return post
  })

  posts.forEach(post => writePost(post))
}

main()