import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useFeatures } from '../hooks/useFeatures'
import { FeatureDetailModal } from '../components/FeatureDetailModal'
import { ROADMAP_STATUSES, CATEGORY_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '../constants'
import type { RoadmapFeature } from '../types'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export function RoadmapPage() {
  const { data: features = [], isLoading } = useFeatures()
  const [selectedFeature, setSelectedFeature] = useState<RoadmapFeature | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const categories = [...new Set(features.map((f) => f.category))]

  const filteredFeatures = categoryFilter
    ? features.filter((f) => f.category === categoryFilter)
    : features

  const doneCount = features.filter((f) => f.status === 'done').length
  const totalCount = features.length
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const handleFeatureClick = (feature: RoadmapFeature) => {
    setSelectedFeature(feature)
    setModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Chargement de la roadmap...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez l'avancement des fonctionnalités de Sparo
          </p>
        </div>
        <Link
          to="/roadmap/ideas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Proposer une idée
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">
            {doneCount}/{totalCount} terminées ({progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
              !categoryFilter
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
            )}
          >
            Toutes
          </button>
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat] ?? '#6b7280'
            const active = categoryFilter === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(active ? null : cat)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                  active
                    ? 'text-white'
                    : 'bg-transparent hover:opacity-80'
                )}
                style={
                  active
                    ? { backgroundColor: color, borderColor: color, color: '#fff' }
                    : { borderColor: color, color }
                }
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
        {ROADMAP_STATUSES.map((status) => {
          const columnFeatures = filteredFeatures.filter((f) => f.status === status.id)
          return (
            <div
              key={status.id}
              className="flex-shrink-0 w-72 snap-start"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <h2 className="text-sm font-semibold">{status.label}</h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  {columnFeatures.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnFeatures.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    onClick={() => handleFeatureClick(feature)}
                  />
                ))}
                {columnFeatures.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                    Aucune feature
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <FeatureDetailModal
        feature={selectedFeature}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}

function FeatureCard({
  feature,
  onClick,
}: {
  feature: RoadmapFeature
  onClick: () => void
}) {
  const categoryColor = CATEGORY_COLORS[feature.category] ?? '#6b7280'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="text-sm font-medium line-clamp-1">{feature.title}</h3>
      {feature.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {feature.description}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Badge
          className="text-[10px] px-1.5 py-0"
          style={{
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
            borderColor: categoryColor,
          }}
        >
          {feature.category}
        </Badge>
        <Badge
          className="text-[10px] px-1.5 py-0"
          style={{
            backgroundColor: `${PRIORITY_COLORS[feature.priority]}20`,
            color: PRIORITY_COLORS[feature.priority],
            borderColor: PRIORITY_COLORS[feature.priority],
          }}
        >
          {PRIORITY_LABELS[feature.priority]}
        </Badge>
      </div>
    </button>
  )
}
