import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function About() {
  return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />

      <div className="flex-1 overflow-y-auto hide-scrollbar"
           style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-[#0c0f10] to-[#1c1c1c] px-6 pt-8 pb-10">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcsxZUU4nN3eScsbCmDcHRpoZGUoJBRV0CDCHjnOWldQRo5nyMpxZPVnEZil25U4Dtuhox4q-32HFleSb5OF4rHGb23yS1XUz9ykWBqCti1aDiGaFR8Cuhvgj7sDtBgqFwB8_Gn0XTvXk-t3TkV5PBwdvECptV6mvdJWXvtOZj25aFRDf-hMJwi3b_2nMi0aKeMLbvR2ErXZSaV4AVNG1VJYclu6cZw_v635KEJV58uLjrPZ5htZE3YbxGph_nLndf_L3Blkk4tZo"
            alt="Restaurant"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary font-black tracking-[0.3em] uppercase text-xs mb-2 block">
              The Story Of
            </span>
            <h2 className="text-white font-headline font-extrabold text-3xl tracking-tighter mb-1">
              Feast At Night
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Authentic recipes, fresh ingredients, and unforgettable midnight cravings delivered right to you.
            </p>
          </motion.div>
        </div>

        <main className="px-4 pt-5 pb-8">
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/5 overflow-hidden relative z-20 -mt-6 p-6"
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <p className="text-[13px] leading-relaxed text-on-surface-variant font-medium mb-4">
              <span className="font-bold text-on-surface">Feast at Night</span> is a late-night food destination dedicated to serving delicious, fresh, and authentic Mandi dishes. Located in Melapalayam, Tirunelveli, we specialize in flavorful Arabian-style Mandi prepared with high-quality ingredients and perfectly cooked rice and meat.
            </p>
            <p className="text-[13px] leading-relaxed text-on-surface-variant font-medium mb-4">
              Our goal is to deliver a satisfying midnight dining experience with rich taste, generous portions, and halal-certified food. Whether you're craving Juicy Chicken Mandi, Alfaham, or other signature varieties, we ensure every meal is prepared with care and served fresh.
            </p>
            <p className="text-[13px] leading-relaxed text-on-surface-variant font-medium">
              At Feast at Night, great taste meets late-night cravings.
            </p>

            <div className="mt-8 pt-6 border-t border-black/[0.04]">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center">Quality You Can Taste</p>
            </div>
          </motion.div>
        </main>

        {/* Developer credit */}
        <div className="pt-2 pb-6 text-center text-[10.5px] text-outline tracking-wide font-medium">
          Developed by{' '}
          <a href="https://innoveldlabs-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-secondary hover:text-primary transition-colors cursor-pointer">
            InnoVeld Labs
          </a>
        </div>
      </div>

    </div>
  )
}
