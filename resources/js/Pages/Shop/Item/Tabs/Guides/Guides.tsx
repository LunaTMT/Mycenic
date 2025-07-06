import React, { useEffect, useState } from "react";

interface GuideVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
  featured: boolean;
  url: string;
}

export default function Guides() {
  const [videos, setVideos] = useState<GuideVideo[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"featured" | "all">("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace this URL with your actual API endpoint or YouTube API fetch function
  const YOUTUBE_API_URL = "/api/guides/videos"; 

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      setError(null);
      try {
        // Example fetch, adapt to your backend or direct YouTube API usage
        const res = await fetch(YOUTUBE_API_URL);
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data: GuideVideo[] = await res.json();

        // Set videos to state
        setVideos(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Filter videos by subtab
  const filteredVideos =
    activeSubTab === "featured" ? videos.filter((v) => v.featured) : videos;

  return (
    <div className="w-full flex flex-col bg-white dark:bg-[#424549]/80 border rounded-lg dark:border-white/20 border-black/20 overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Guides & Tutorials</h2>

        {/* Subtab toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveSubTab("featured")}
            className={`px-4 py-1 rounded-full font-medium text-sm border ${
              activeSubTab === "featured"
                ? "bg-yellow-500 text-white border-yellow-500"
                : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#53575a]"
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setActiveSubTab("all")}
            className={`px-4 py-1 rounded-full font-medium text-sm border ${
              activeSubTab === "all"
                ? "bg-yellow-500 text-white border-yellow-500"
                : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-[#53575a]"
            }`}
          >
            All Videos
          </button>
        </div>

        {loading && <p className="text-gray-500">Loading videos...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && filteredVideos.length === 0 && (
          <p className="text-gray-500">No videos available in this category.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-semibold text-md mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{new Date(video.publishedAt).toLocaleDateString()}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 flex-grow">
                  {video.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
