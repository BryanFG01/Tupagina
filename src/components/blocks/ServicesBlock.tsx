import type { ServicesContent, BlockStyle } from '@/domain/landing/block.types'
import { bsCls, bsStyle } from './blockStyle'

type Props = { content: ServicesContent; style?: BlockStyle }

export function ServicesBlock({ content, style }: Props) {
  return (
    <section className={bsCls(style, 'bg-white')} style={bsStyle(style)}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{content.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all"
              style={style?.backgroundColor && style.backgroundColor !== 'default'
                ? { backgroundColor: 'rgba(255,255,255,0.1)' }
                : { backgroundColor: '#F9FAFB' }}
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
