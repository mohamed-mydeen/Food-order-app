import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NEIGHBORHOODS } from '../constants/neighborhoods'

export default function NeighborhoodPicker({ value, onChange, error, touched }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return NEIGHBORHOODS.filter(n => 
      n.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const selectedName = value || 'Select your area...'

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between bg-surface-container-low border rounded-xl px-4 py-3.5 transition-all text-sm
          ${error && touched 
            ? 'border-red-400 focus:ring-2 focus:ring-red-200' 
            : 'border-outline-variant/30 focus:ring-2 focus:ring-primary/20'
          }`}
      >
        <span className={value ? 'text-on-surface font-medium' : 'text-outline'}>
          {selectedName}
        </span>
        <span className="material-symbols-outlined text-outline text-[20px]">
          expand_more
        </span>
      </button>

      {/* Bottom Sheet Portal-like Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-[32px] z-[101] flex flex-col max-h-[85vh] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1.5 bg-surface-container-high rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4">
                <h3 className="font-headline font-black text-xl text-on-surface tracking-tight mb-4">
                  Select Neighborhood
                </h3>
                
                {/* Search Bar */}
                <div className="relative flex items-center">
                  <span className="absolute left-4 material-symbols-outlined text-outline text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your area..."
                    autoFocus
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-primary transition-all text-sm font-medium"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-4 text-outline"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 pb-10 hide-scrollbar">
                {filtered.length > 0 ? (
                  <div className="space-y-1">
                    {filtered.map((n) => (
                      <button
                        key={n.name}
                        onClick={() => {
                          onChange({ target: { value: n.name } })
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all
                          ${value === n.name 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-surface-container-low text-on-surface'
                          }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-[15px]">{n.name}</span>
                        </div>
                        {value === n.name && (
                          <span className="material-symbols-outlined text-[20px] font-black">
                            check_circle
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <span className="material-symbols-outlined text-outline text-5xl mb-3">
                      location_off
                    </span>
                    <p className="text-on-surface-variant font-medium">No areas found matching "{search}"</p>
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
