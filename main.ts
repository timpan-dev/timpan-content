import {dirname} from 'path'
import {
  getMdFiles,
  readMdFile,
  writePost,
  getLinkedFiles
} from './api'

import { v4 as uuid } from 'uuid'

async function main() {
  const files = await getMdFiles('./draft/posts')
  const posts = files.map(readMdFile).map(post => {
    post.data = { id: uuid(), ...post.data }
    return post
  })

  // for await (const post of posts) {
  //   // console.log(dirname((post as any).path))
  //   const linkedFiles = await getLinkedFiles(dirname((post as any).path))
  //   console.log(linkedFiles)
  // }

  // console.log(posts)
  // posts.forEach(post => writePost(post))
  for await (const post of posts) {
    await writePost(post)
  }
}

main()