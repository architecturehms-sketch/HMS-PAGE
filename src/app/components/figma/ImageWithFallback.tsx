import React, { useState } from 'react'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, priority, ...rest } = props

  if (!src || didError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#111] text-[#f4f4f0]/20 border border-[#f4f4f0]/10 ${className ?? ''}`}
        style={style}
      >
        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span className="font-mono text-[10px] tracking-widest uppercase">No Image</span>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={className} style={style} loading={priority ? "eager" : "lazy"} decoding={priority ? "auto" : "async"} {...rest} onError={handleError} />
  )
}
