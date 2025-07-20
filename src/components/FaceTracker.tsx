"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceMesh from "@tensorflow-models/facemesh";
import Webcam from "react-webcam";

const FaceTracker = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);

  const setupCamera = async () => {
    await tf.ready();
    const net = await faceMesh.load();

    const detect = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video as HTMLVideoElement;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

      
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;

        if (canvasRef.current) {
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }

        
        const face = await net.estimateFaces(video);

        const ctx = canvasRef.current?.getContext("2d");
        ctx?.clearRect(0, 0, videoWidth, videoHeight);

        if (ctx && face.length > 0) {
          face.forEach((pred) => {
            const keypoints = pred.scaledMesh;

            keypoints.forEach((point) => {
              const [x, y] = point as [number, number];
              ctx.beginPath();
              ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
              ctx.fillStyle = "red";
              ctx.fill();
            });
          });
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  useEffect(() => {
    setupCamera();
  }, []);

  const startRecording = () => {
    const stream = document.querySelector("video")?.captureStream();
    if (!stream) return;

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    recordedChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      setRecordedVideoURL(url);
      localStorage.setItem("face-track-video", url);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full max-w-md aspect-video">
        <Webcam ref={webcamRef} className="absolute top-0 left-0 w-full h-full" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      <div className="mt-4 space-x-2">
        {!isRecording ? (
          <button onClick={startRecording} className="px-4 py-2 bg-green-500 text-white rounded">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="px-4 py-2 bg-red-500 text-white rounded">
            Stop Recording
          </button>
        )}
      </div>

      {recordedVideoURL && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">Recorded Video:</h3>
          <video src={recordedVideoURL} controls className="w-full max-w-md" />
        </div>
      )}
    </div>
  );
};

export default FaceTracker;