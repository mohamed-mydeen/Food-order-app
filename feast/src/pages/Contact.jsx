import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'

const contacts = [
  {
    label: 'Primary Line',
    icon: 'call',
    number: '+91 93842 34560',
    tel: 'tel:+919384234560',
    whatsapp: 'https://wa.me/919384234560',
  },
  {
    label: 'Alternate Line',
    icon: 'support_agent',
    number: '+91 70943 31888',
    tel: 'tel:+917094331888',
    whatsapp: 'https://wa.me/917094331888',
  },
]

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
}

export default function Contact() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />

      <div className="flex-1 overflow-y-auto hide-scrollbar">

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
              Reservations &amp; Support
            </span>
            <h2 className="text-white font-headline font-extrabold text-3xl tracking-tighter mb-1">
              Book Your Order
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Planning a grand evening? Call or WhatsApp us to pre-order or book a table.
            </p>
          </motion.div>
        </div>

        <main className="px-4 pt-5 pb-8 space-y-4">

          {/* Contact Cards */}
          {contacts.map(({ label, icon, number, tel, whatsapp }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="bg-white rounded-xl p-4 shadow-sm"
              whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(0,0,0,0.1)' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined icon-filled">{icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-on-surface font-headline">{number}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.a
                  href={tel}
                  className="flex-1 px-4 py-3 bg-primary text-on-primary rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="material-symbols-outlined text-sm">call</span> Call Now
                </motion.a>
                <motion.a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-[#25D366] text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="material-symbols-outlined text-sm">chat</span> WhatsApp
                </motion.a>
              </div>
            </motion.div>
          ))}

          {/* Opening Hours */}
          <motion.div
            className="bg-white rounded-xl p-5 shadow-sm"
            custom={2}
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px] icon-filled">schedule</span>
              </div>
              <h2 className="font-headline font-bold text-on-surface">Opening Hours</h2>
            </div>
            <div className="space-y-0">
              {[
                { day: 'Monday – Friday', time: '8:00 PM – 2:00 AM' },
                { day: 'Saturday',        time: '7:00 PM – 3:00 AM' },
                { day: 'Sunday',          time: '7:00 PM – 2:00 AM' },
              ].map(({ day, time }) => (
                <div key={day} className="flex justify-between items-center py-2.5 border-b border-surface-container last:border-0">
                  <span className="text-sm font-medium text-on-surface-variant">{day}</span>
                  <span className="text-sm font-bold text-on-surface">{time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            className="bg-white rounded-xl overflow-hidden shadow-sm"
            custom={3}
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px] icon-filled">location_on</span>
                </div>
                <h2 className="font-headline font-bold text-on-surface">Our Location</h2>
              </div>
              <p className="text-on-surface font-semibold text-sm mb-0.5">mpm hub</p>
              <p className="text-on-surface-variant text-xs leading-relaxed">
                Melapalayam, Tirunelveli,<br />Tamil Nadu, India.
              </p>
            </div>

            {/* Map placeholder */}
            <motion.a
              href="https://maps.google.com/?q=Melapalayam,+Tirunelveli"
              target="_blank"
              rel="noopener noreferrer"
              className="h-36 bg-gradient-to-br from-orange-50 to-surface-container-high flex items-center justify-center block"
              whileHover={{ opacity: 0.85 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-4xl icon-filled">map</span>
                <p className="text-xs text-secondary font-bold mt-1 uppercase tracking-wider">Open in Google Maps</p>
              </div>
            </motion.a>
          </motion.div>

        </main>
      </div>

      <BottomNav />
    </div>
  )
}
