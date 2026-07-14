import Image from "next/image";

export function HalftoneBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center mix-blend-multiply opacity-40">
      <div className="relative w-full h-full max-w-[1400px]">
        <Image
          src="/images/halftone-hands.png"
          alt="Creation of Adam halftone pattern"
          fill
          className="object-cover md:object-contain object-center scale-[1.2] md:scale-100"
          priority
        />
      </div>
    </div>
  );
}
