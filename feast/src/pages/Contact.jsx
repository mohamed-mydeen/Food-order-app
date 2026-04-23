import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
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
          <div className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/5 overflow-hidden relative z-20 -mt-6">
            {contacts.map(({ label, icon, number, tel, whatsapp }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className={`p-4 flex items-center justify-between ${i !== contacts.length - 1 ? 'border-b border-black/[0.04]' : ''}`}
                whileHover={{ backgroundColor: '#fafafa' }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-orange-50/80 rounded-full flex items-center justify-center border border-orange-100/50">
                    <span className="material-symbols-outlined text-primary text-[22px] icon-filled">{icon}</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
                    <p className="text-[17px] font-black text-gray-800 font-headline tracking-tight">{number}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.a
                    href={tel}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-sm hover:text-primary transition-colors duration-200"
                    whileHover={{ scale: 1.05, borderColor: '#f97316' }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <span className="material-symbols-outlined text-[19px] icon-filled">call</span>
                  </motion.a>
                  <motion.a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#25D366]/5 border border-[#25D366]/30 text-[#1da851] flex items-center justify-center shadow-sm transition-colors duration-200 hover:bg-[#25D366]/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                  >
                    <span className="material-symbols-outlined text-[19px] icon-filled">chat</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Opening Hours */}
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/5 overflow-hidden relative z-20 mb-6 p-4"
            custom={2}
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[20px] icon-filled">schedule</span>
              </div>
              <div className="flex-1 w-full">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Opening Hours</p>
                  
                  {/* Pro Highlight Card */}
                  <div className="mb-6 relative overflow-hidden bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-4">
                    {/* Decorative element */}
                    <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-orange-200/20 rounded-full blur-2xl" />
                    
                    <div className="relative z-10 flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#a83100] flex items-center justify-center shadow-md shadow-orange-900/20">
                        <span className="material-symbols-outlined text-white text-[18px] font-variation-fill">stars</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-black text-gray-900 tracking-tight">Book Order Before 8 PM</span>
                          <span className="bg-[#a83100] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-widest">Recommended</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                          Secure your feast! Pre-orders placed before 8 PM ensure priority midnight processing.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-green-600 uppercase tracking-tighter">Delivery Active: 10:30 PM - 1:00 AM</span>
                    </div>


                   {[
                     { day: 'Mon – Sat', time: '10:30 PM – 1:00 AM' },
                     { day: 'Sunday',    time: '11:30 AM – 2:30 PM' },
                   ].map(({ day, time }) => (
                     <div key={day} className="flex items-center w-full">
                       <span className="text-[13px] font-medium text-on-surface-variant min-w-[70px]">{day}</span>
                       <span className="text-[12px] font-bold text-on-surface flex-1 text-right leading-tight">{time}</span>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-black/5 overflow-hidden relative z-20"
            custom={3}
            variants={itemVariants}
            initial="hidden"
            animate="show"
          >
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex gap-3.5">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[20px] icon-filled">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">Visit Us</p>
                  <h2 className="font-headline font-black text-on-surface text-lg leading-tight tracking-tight">Feast At Night</h2>
                  <p className="text-[12px] font-medium text-on-surface-variant mt-1.5 leading-relaxed max-w-[180px]">
                    Melapalayam, Tirunelveli,<br />Tamil Nadu, India.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </main>
      </div>

    </div>
  )
}
