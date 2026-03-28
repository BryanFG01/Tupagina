import type { ServicesContent, BlockStyle } from '@/domain/landing/block.types'
import { bsCls, bsStyle } from './blockStyle'

type Props = { content: ServicesContent; style?: BlockStyle }

export function ServicesBlock({ content, style }: Props) {
  const hasCustomBg = !!(style?.backgroundColor && style.backgroundColor !== 'default')
  const cardStyle = hasCustomBg
    ? { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }
    : { backgroundColor: '#F9FAFB', borderColor: '#f1f5f9' }

  return (
    <section className={bsCls(style, 'bg-white')} style={bsStyle(style)}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{content.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(content.items ?? []).map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border hover:shadow-md transition-all"
              style={cardStyle}
            >
              {item.icon && <div className="text-4xl mb-3">{item.icon}</div>}
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm mb-3 opacity-70">{item.description}</p>
              {item.price && (
                <p className="text-brand-600 font-bold text-lg">{item.price}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
