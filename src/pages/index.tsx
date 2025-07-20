// pages/index.tsx
import Head from "next/head";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";

const FaceTracker = dynamic(() => import("../components/FaceTracker"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>Face Tracker App</title>
      </Head>
      <h1 className="text-3xl mb-4 font-bold">🎯 Face Tracking Recorder</h1>
      <FaceTracker />
    </div>
  );
}
