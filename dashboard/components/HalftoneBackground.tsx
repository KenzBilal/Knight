import Image from "next/image";

export function HalftoneBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center mix-blend-multiply opacity-80">
      <div className="relative w-full h-full">
        <Image
          src="/images/halftone-hands.png"
          alt="Creation of Adam halftone pattern"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}
