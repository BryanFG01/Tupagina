import type { TestimonialsContent, BlockStyle } from '@/domain/landing/block.types'
import { bsCls, bsStyle } from './blockStyle'

type Props = { content: TestimonialsContent; style?: BlockStyle }

const QUOTE_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 opacity-15">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
  </svg>
)

function Stars({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 20 20" fill={i <= rating ? '#FBBF24' : '#E5E7EB'} className="w-4 h-4">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  )
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return <img src={src} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow" />
  }
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['bg-violet-500', 'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm ${color} shadow`}>
      {initials}
    </div>
  )
}

function TestimonialCard({ item, isList, customBg }: {
  item: TestimonialsContent['items'][number]
  isList: boolean
  customBg: boolean
}) {
  const cardStyle = customBg
    ? { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' }
    : {}

  if (isList) {
    return (
      <div
        className="flex items-start gap-5 p-6 rounded-2xl border transition-shadow hover:shadow-md w-full"
        style={customBg ? cardStyle : { backgroundColor: '#fff', borderColor: '#f1f5f9' }}
      >
        <Avatar name={item.name} src={item.avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">{item.name}</p>
              {item.role && <p className="text-xs text-gray-400 mt-0.5">{item.role}</p>}
            </div>
            <Stars rating={item.rating} />
          </div>
          <div className="relative">
            <span className="absolute -top-1 -left-1 text-indigo-200">{QUOTE_ICON}</span>
            <p className="text-gray-600 text-sm leading-relaxed pl-5 italic">"{item.text}"</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col p-6 rounded-2xl border transition-shadow hover:shadow-md h-full"
      style={customBg ? cardStyle : { backgroundColor: '#fff', borderColor: '#f1f5f9' }}
    >
      <div className="flex items-start justify-between mb-4">
        <Stars rating={item.rating} />
        <span className="text-indigo-200">{QUOTE_ICON}</span>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed flex-1 italic mb-5">"{item.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100/60">
        <Avatar name={item.name} src={item.avatar} />
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">{item.name}</p>
          {item.role && <p className="text-xs text-gray-400 mt-0.5">{item.role}</p>}
        </div>
      </div>
    </div>
  )
}

export function TestimonialsBlock({ content, style }: Props) {
  const layout  = content.layout  ?? 'grid'
  const columns = content.columns ?? 2
  const customBg = !!(style?.backgroundColor && style.backgroundColor !== 'default')

  const colClass =
    columns === 1 ? 'grid-cols-1' :
    columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                    'grid-cols-1 sm:grid-cols-2'

  return (
    <section className={bsCls(style, 'bg-gray-50', 'py-16', 'px-4')} style={bsStyle(style)}>
      <div className="max-w-6xl mx-auto">

        <h2 className="text-3xl sm:text-4xl font-black text-center tracking-tight mb-12">
          {content.title}
        </h2>

        {layout === 'list' ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {(content.items ?? []).map((item, i) => (
              <TestimonialCard key={i} item={item} isList customBg={customBg} />
            ))}
          </div>
        ) : (
          <div className={`grid ${colClass} gap-6`}>
            {(content.items ?? []).map((item, i) => (
              <TestimonialCard key={i} item={item} isList={false} customBg={customBg} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
