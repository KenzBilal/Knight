"use client";

export function AbstractBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-[-1]"
      style={{
        background: "#e4e4e4",
        backgroundImage: `
          radial-gradient(circle at 15% 50%, rgba(255,255,255,0.7) 0%, transparent 50%),
          radial-gradient(circle at 85% 30%, rgba(200,200,200,0.5) 0%, transparent 50%),
          radial-gradient(circle at 50% 80%, rgba(255,255,255,0.8) 0%, transparent 60%)
        `,
        filter: "contrast(120%) brightness(105%)",
      }}
    >
      {/* 
        To mimic the wavy 3D fluid folds, we use some blurred SVGs 
        positioned absolutely.
      */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/80 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#d4d4d4] rounded-full blur-[120px] opacity-50" />
      <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-white/60 rounded-full blur-[80px] opacity-70" />
      <div className="absolute bottom-[20%] left-[20%] w-[50%] h-[50%] bg-[#cccccc] rounded-full blur-[100px] opacity-40" />
    </div>
  );
}
