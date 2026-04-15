import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function About() {
  return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
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
              Welcome to <span className="font-bold text-on-surface">Feast At Night</span>, where we believe that the best cravings happen after dark. We specialize in bringing you the most authentic flavors of traditional <span className="font-bold text-primary">Chicken Mandi</span>, fragrant Biriyani, and a wide selection of refreshing fresh juices.
            </p>
            <p className="text-[13px] leading-relaxed text-on-surface-variant font-medium mb-4">
              Our journey started with a simple idea: late-night hunger should never be compromised with mediocre food. Every dish we serve is prepared with carefully sourced spices, premium ingredients, and the warmth of home-style cooking.
            </p>
            <p className="text-[13px] leading-relaxed text-on-surface-variant font-medium">
              We are based in Tirunelveli, and our mission is to deliver not just food, but an unforgettable dining experience straight to your doorstep.
            </p>

            <div className="mt-8 pt-6 border-t border-black/[0.04]">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center">Quality You Can Taste</p>
            </div>
          </motion.div>
        </main>

        {/* Developer credit */}
        <div className="pt-2 pb-6 text-center text-[10.5px] text-outline tracking-wide font-medium">
          Developed by <span className="font-bold text-secondary">InnoVeld Labs</span>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
