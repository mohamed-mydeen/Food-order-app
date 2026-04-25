import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NEIGHBORHOOD_GROUPS, NEIGHBORHOODS } from '../constants/neighborhoods'

export default function NeighborhoodPicker({ value, onChange, error, touched }) {
  const [isOpen, setIsOpen]   = useState(false)
  const [search, setSearch]   = useState('')
  const searchRef             = useRef(null)

  // Auto-focus search when sheet opens
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 300)
  }, [isOpen])

  // Filter across all groups
  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return NEIGHBORHOOD_GROUPS
    return NEIGHBORHOOD_GROUPS
      .map(g => ({ ...g, places: g.places.filter(p => p.name.toLowerCase().includes(q)) }))
      .filter(g => g.places.length > 0)
  }, [search])

  const handleSelect = (name) => {
    onChange({ target: { value: name } })
    setIsOpen(false)
    setSearch('')
  }

  const feeColor = (fee) => {
    if (fee <= 20)  return 'bg-green-100 text-green-700'
    if (fee <= 60)  return 'bg-blue-100 text-blue-700'
    if (fee <= 100) return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-600'
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        id="neighborhood-picker-btn"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between bg-white border rounded-xl pl-11 pr-4 py-3.5 transition-all text-sm shadow-sm
          ${error && touched
            ? 'border-red-400 ring-2 ring-red-100'
            : value
              ? 'border-primary/50 ring-1 ring-primary/20'
              : 'border-outline-variant/40'
          }`}
      >
        <span className={value ? 'text-on-surface font-semibold' : 'text-outline font-medium'}>
          {value || 'Select your area...'}
        </span>
        <div className="flex items-center gap-2">
          {value && (() => {
            const n = NEIGHBORHOODS.find(x => x.name === value)
            return n ? (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${feeColor(n.fee)}`}>
                ₹{n.fee}
              </span>
            ) : null
          })()}
          <span className="material-symbols-outlined text-outline text-[20px]">
            expand_more
          </span>
        </div>
      </button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setSearch('') }}
              className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[100]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[28px] z-[101] flex flex-col shadow-2xl"
              style={{ maxHeight: '88vh' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-surface-container-high rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-surface-container">
                <div>
                  <h3 className="font-headline font-black text-lg text-on-surface tracking-tight">
                    Select Neighborhood
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Delivery fee shown per area
                  </p>
                </div>
                <button
                  onClick={() => { setIsOpen(false); setSearch('') }}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
                </button>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-surface-container">
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 material-symbols-outlined text-primary text-[20px]">search</span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your area..."
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl pl-11 pr-10 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all text-sm font-medium text-on-surface placeholder:text-outline-variant"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3.5 text-outline"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Fee Legend */}
              <div className="px-4 py-2 flex items-center gap-3 border-b border-surface-container overflow-x-auto hide-scrollbar">
                {[
                  { label: '≤ ₹20', cls: 'bg-green-100 text-green-700' },
                  { label: '≤ ₹60', cls: 'bg-blue-100 text-blue-700'  },
                  { label: '≤ ₹100', cls: 'bg-amber-100 text-amber-700'},
                  { label: '₹120+', cls: 'bg-red-100 text-red-600'    },
                ].map(({ label, cls }) => (
                  <span key={label} className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${cls}`}>
                    {label}
                  </span>
                ))}
                <span className="text-[10px] text-on-surface-variant whitespace-nowrap ml-1">delivery fee</span>
              </div>

              {/* Grouped List */}
              <div className="flex-1 overflow-y-auto pb-8 hide-scrollbar">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <div key={group.group}>
                      {/* Section Header */}
                      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
                        <span className="material-symbols-outlined text-primary text-[16px]">{group.icon}</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                          {group.group}
                        </p>
                      </div>

                      {/* Places */}
                      <div className="px-3 space-y-0.5">
                        {group.places.map((n) => {
                          const isSelected = value === n.name
                          return (
                            <motion.button
                              key={n.name}
                              type="button"
                              onClick={() => handleSelect(n.name)}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all
                                ${isSelected
                                  ? 'bg-primary/10 border border-primary/20'
                                  : 'hover:bg-surface-container-low active:bg-surface-container'
                                }`}
                            >
                              <div className="flex items-center gap-3 text-left">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary' : 'bg-surface-container'}`}>
                                  <span className={`material-symbols-outlined text-[15px] ${isSelected ? 'text-white' : 'text-on-surface-variant'}`}>
                                    {isSelected ? 'check' : 'location_on'}
                                  </span>
                                </div>
                                <span className={`font-bold text-[14px] ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                                  {n.name}
                                </span>
                              </div>
                              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${feeColor(n.fee)}`}>
                                ₹{n.fee}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center px-6">
                    <span className="material-symbols-outlined text-outline text-5xl">location_off</span>
                    <p className="text-on-surface-variant font-medium mt-3">No areas found for "{search}"</p>
                    <p className="text-xs text-outline mt-1">Try a different spelling</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
