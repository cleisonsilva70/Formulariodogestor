import Image from 'next/image'

const SIZES = {
  sm: { h: 28, textClass: 'text-sm'  },
  md: { h: 36, textClass: 'text-lg'  },
  lg: { h: 48, textClass: 'text-2xl' },
}

export function Logo({ size = 'md' }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size]
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Scale Chat"
        height={s.h}
        width={s.h * 1.2}
        className="object-contain"
        priority
      />
      <span className={`font-bold ${s.textClass} text-gray-800`}>Scale Chat</span>
    </div>
  )
}
