function SkeletonBar({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return (
    <div className={`${w} ${h} rounded-md bg-gray-200 skeleton-pulse`} />
  )
}

export default function SkeletonLoader() {
  return (
    <div className="p-4 space-y-4">
      {/* Simulates Overview tab layout */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 skeleton-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonBar w="w-3/5" h="h-3.5" />
          <SkeletonBar w="w-2/5" h="h-2.5" />
        </div>
        <div className="w-16 h-5 rounded-full bg-gray-200 skeleton-pulse" />
      </div>

      <div className="h-px bg-gray-200" />

      <div className="space-y-2">
        <SkeletonBar w="w-1/4" h="h-2.5" />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <SkeletonBar w="w-full" h="h-2" />
            <SkeletonBar w="w-3/4" h="h-3.5" />
          </div>
          <div className="space-y-1">
            <SkeletonBar w="w-full" h="h-2" />
            <SkeletonBar w="w-3/4" h="h-3.5" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <SkeletonBar w="w-1/3" h="h-2.5" />
        <div className="rounded-xl border border-gray-200 p-3 space-y-2.5">
          <div className="flex justify-between">
            <SkeletonBar w="w-1/3" h="h-3" />
            <SkeletonBar w="w-1/4" h="h-3" />
          </div>
          <SkeletonBar w="w-full" h="h-2" />
          <div className="flex justify-between">
            <SkeletonBar w="w-1/4" h="h-2.5" />
            <SkeletonBar w="w-1/5" h="h-2.5" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-3 space-y-2.5">
          <div className="flex justify-between">
            <SkeletonBar w="w-2/5" h="h-3" />
            <SkeletonBar w="w-1/4" h="h-3" />
          </div>
          <SkeletonBar w="w-full" h="h-2" />
          <div className="flex justify-between">
            <SkeletonBar w="w-1/3" h="h-2.5" />
            <SkeletonBar w="w-1/5" h="h-2.5" />
          </div>
        </div>
      </div>
    </div>
  )
}
