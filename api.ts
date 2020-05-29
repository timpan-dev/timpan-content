import readdirp from 'readdirp'
import fs from 'fs'
import { dirname, normalize, extname, join, relative, basename } from 'path'
import matter, { GrayMatterFile } from 'gray-matter'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import _slugify from 'slugify'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { omit } from 'lodash'

interface IPostData {
  id?: string
  title?: string
  date?: Date
}

const CONTENT_DIR = `${__dirname}/content`

export const createFolders = () => {
  mkdirp.sync(`${getPostsDir()}/`)
  mkdirp.sync(`${getPagesDir()}/`)
}

export const slugify = (title: string) => {
  return _slugify(title, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: false,
    strict: true,
  })
}

export const getPostMonthDir = (data: IPostData) => {
  return format(data.date, 'yyyy-MM')
}

export const getPostNameDate = (data: IPostData) => {
  return format(data.date, 'dd-MMM', { locale: ru })
    .replace('.', '')
    .toUpperCase()
}

export const getPostNameDateYMD = (data: IPostData) => {
  return format(data.date, 'yyMMdd')
}

export const getPostName = (data: IPostData) => {
  return [getPostNameDate(data), data.title].join(' - ')
}

export const getPostNameYMD = (data: IPostData) => {
  return [getPostNameDateYMD(data), data.title].join(' - ')
}

export const getPostDir = (data: IPostData) => {
  const dir = join(
    getPostsDir(),
    getPostMonthDir(data),
    getPostName(data)
  )
  mkdirp.sync(`${dir}/`)
  return dir
}

export const getPageDir = (data: IPostData) => {
  const dir = join(getPagesDir(), data.title)
  mkdirp.sync(`${dir}/`)
  return dir
}

export const getBaseDir = () => {
  return CONTENT_DIR
}

export const getPostsDir = () => {
  return `${getBaseDir()}/posts`
}

export const getPagesDir = () => {
  return `${getBaseDir()}/pages`
}

export const getMdFiles = async (targetDir: string) => {
  const files = []
  for await (const entry of readdirp(targetDir, { fileFilter: ['*.md', '*.mdx'] })) {
    const { fullPath } = entry
    files.push(fullPath)
  }
  return files
}

export const getLinkedFiles = async (targetDir: string) => {
  const files = []
  for await (const entry of readdirp(targetDir, { fileFilter: ['*.jpg', '*.jpeg', '*.png', '*.mp3', '*.pdf'] })) {
    const { fullPath } = entry
    files.push(fullPath)
  }
  return files
}

export const readMdFile = (fullPath: string) => {
  return matter.read(fullPath)
}

export const getMdOutput = (post: GrayMatterFile<string>) => {
  return matter.stringify(post.content, post.data)
}

export const writeOutput = (dstFile: string, output: string) => {
  fs.writeFileSync(dstFile, output, 'utf8')
}

export const writePost = async (post: GrayMatterFile<string>) => {
  const dstDir = getPostDir(post.data)
  mkdirp.sync(`${dstDir}/`)
  const dstFile = `${dstDir}/index.md`
  writeOutput(dstFile, getMdOutput(post))
  const linkedFiles = await getLinkedFiles(dirname((post as any).path))
  for (const file of linkedFiles) {
    fs.copyFileSync(file, join(dstDir, basename(file)))
  }
}

export const writePage = (page: GrayMatterFile<string>) => {
  mkdirp.sync(`${getPageDir(page.data)}/`)
  const dstFile = `${getPageDir(page.data)}/index.md`
  writeOutput(dstFile, getMdOutput(page))
}