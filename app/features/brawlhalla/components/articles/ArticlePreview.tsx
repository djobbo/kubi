import type { BrawlhallaArticle } from "@/features/bh-articles/functions/getBrawlhallaArticles"
import { UnsafeImage } from "@/features/brawlhalla/components/Image"

interface ArticlePreviewProps {
  article: BrawlhallaArticle
}

const BASE_BRAWLHALLA_ARTICLE_URL = "https://brawlhalla.com/news/"

export const ArticlePreview = ({ article }: ArticlePreviewProps) => {
  const { title, featuredImage, categories } = article

  const href = `${BASE_BRAWLHALLA_ARTICLE_URL}${article.slug}`

  return (
    <div className="flex flex-col">
      <a
        className="relative w-full aspect-video rounded-lg overflow-hidden"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        <UnsafeImage
          src={featuredImage.sourceUrl}
          alt={title}
          className="object-cover object-center"
        />
      </a>
      <div className="flex justify-start items-center gap-2 mt-2">
        {categories.map((category) => (
          <span
            key={category.slug}
            className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground"
          >
            {category.name}
          </span>
        ))}
      </div>
      <h4 className="mt-4 font-bold">
        <a href={href} target="_blank" rel="noreferrer">
          {title}
        </a>
      </h4>
    </div>
  )
}
