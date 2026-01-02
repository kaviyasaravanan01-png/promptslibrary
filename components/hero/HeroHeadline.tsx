"use client";

export default function HeroHeadline() {
  return (
    <div className="space-y-1.5">
      {/* Main Heading */}
      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
        Prompt Marketplace
      </h1>

      {/* Subheading */}
      <p className="text-sm md:text-base text-gray-300 max-w-2xl">
        Access 240k high-quality AI prompts & video tutorials
      </p>

      {/* AI Tools Highlight */}
      <p className="text-xs md:text-sm text-gray-400 pt-1">
        For{" "}
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
          Midjourney
        </span>
        ,{" "}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
          ChatGPT
        </span>
        ,{" "}
        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-semibold">
          Veo
        </span>
        ,{" "}
        <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent font-semibold">
          Gemini
        </span>
        , & more
      </p>
    </div>
  );
}
