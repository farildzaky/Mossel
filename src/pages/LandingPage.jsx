import axios from "axios";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import roket from "../assets/roket.gif";
import Navbar from "../components/Navbar";
import Magnet from "../effects/Magnet";

gsap.registerPlugin(MotionPathPlugin);

const LandingPage = () => {
  const [schoolCode, setSchoolCode] = useState("");
  const [message, setMessage] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [heroTitle, setHeroTitle] = useState("Welcome to Mossel!");
  const [heroSubtitle, setHeroSubtitle] = useState("Let's start our English learning adventure! 🚀");
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State untuk disable tombol

  const navigate = useNavigate();
  const startButtonRef = useRef(null);
  const heroRef = useRef(null);

  // Animasi elemen mengambang
  useEffect(() => {
    gsap.utils.toArray(".floating").forEach((element, i) => {
      gsap.to(element, {
        duration: 3 + i,
        y: 30,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });
  }, []);

  // Animasi background shapes
  useEffect(() => {
    const shapes = gsap.utils.toArray(".shape");
    shapes.forEach((shape, i) => {
      gsap.to(shape, {
        duration: 10 + i * 2,
        rotation: 360,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
    });
  }, []);

  // Text-to-Speech setup
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const googleUKMale = voices.find(
          (v) => v.name.includes("Google UK English Male") && v.lang === "en-GB"
        );
        setSelectedVoice(googleUKMale || voices[0]);
      } else {
        setTimeout(loadVoices, 100);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      if (selectedVoice) utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStart = () => {
    // Animasi tombol
    gsap
      .timeline()
      .to(startButtonRef.current, {
        duration: 0.3,
        scale: 1.2,
        ease: "back.out(2)",
        yoyo: true,
        repeat: 1,
      })
      .to(
        heroRef.current,
        {
          duration: 0.8,
          opacity: 0,
          y: -50,
          ease: "power2.out",
          onComplete: () => {
            setHeroTitle("🧙School Code Magic!");
            setHeroSubtitle("Enter your secret school code to begin the quest!");
            setFormVisible(true);

            gsap.fromTo(
              heroRef.current,
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                onComplete: () => speakText("Enter your secret school code to begin the quest!"),
              }
            );
          },
        },
        "-=0.5"
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Jika tombol sudah disable, hentikan eksekusi
    if (isButtonDisabled) return;

    // Set loading dan disable tombol
    setIsLoading(true);
    setIsButtonDisabled(true);

    try {
      const response = await axios.post("https://mossel.up.railway.app/api/student/step1", {
        school_code: schoolCode,
      });
      if (response.status === 200) {
        const successMessage = "Hooray! Code accepted!";
        setMessage(successMessage);
        speakText(successMessage);
        localStorage.setItem("schoolCode", schoolCode);

        // Animasi sebelum navigasi
        gsap.to(heroRef.current, {
          duration: 0.8,
          scale: 1.2,
          opacity: 0,
          ease: "power2.in",
          onComplete: () => navigate("/register-student"),
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.status === 422
          ? "Oops! Wrong code. Try again! 🔍"
          : " Something went wrong. Let's try again!";
      setMessage(errorMessage);
      speakText(errorMessage);

      // Animasi error
      gsap.to(".form-input", {
        duration: 0.1,
        x: -10,
        repeat: 5,
        yoyo: true,
        ease: "power1.inOut",
      });
      // Re-enable tombol jika terjadi error
      setIsButtonDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <div
        className=" h-screen flex items-center justify-center relative 
        bg-gradient-to-br from-teal-500 via-teal-700 to-teal-900 
        bg-[length:300%_300%] animate-gradient"
      >
        <motion.img
                src={roket}
                alt="Roket"
                className="w-32 h-32 absolute z-50"
                initial={{ x: "-500%", y: "100%", rotate: 0 }}
                animate={{ x: "800%", y: "-700%", rotate: 0}}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
            />
        {/* Floating Elements */}
        <div className="shape absolute top-20 left-10 w-64 h-64 bg-[#d7edfa] rounded-full opacity-20 blur-3xl" />
        <div className="shape absolute bottom-20 right-10 w-64 h-64 bg-[#D7efda] rounded-full opacity-20 blur-3xl" />

        <div ref={heroRef} className="z-10 text-center ">
          <div className="mb-8">
            <div className="flex items-center justify-center  floating">
              <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                {heroTitle}
              </h1>
              <button
                onClick={() => speakText(heroTitle)}
                className="text-3xl animate-bounce hover:scale-110 transition"
                aria-label="Read aloud"
              >
                🎤
              </button>
            </div>
          </div>

          <div className="mb-12 floating">
            <div className="flex items-center justify-center">
              <p className="text-2xl md:text-3xl text-white/90 font-medium">
                {heroSubtitle}
              </p>
              <button
                onClick={() => speakText(heroSubtitle)}
                className="text-2xl hover:rotate-12 transition-transform"
                aria-label="Read aloud"
              >
                🔈
              </button>
            </div>
          </div>

          {!formVisible ? (
            <Magnet>
              <button
                ref={startButtonRef}
                onClick={handleStart}
                className="w-40 h-40 bg-[#fdd401] hover:bg-[#ffeb3b] font-bold text-3xl rounded-full 
                  shadow-2xl hover:shadow-3xl transition-all transform hover:rotate-12
                  border-4 border-white/20 hover:border-white/40"
              >
                START
              </button>
            </Magnet>
          ) : (
            <div className="mt-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6 animate-popIn">
                <input
                  type="text"
                  placeholder="✨ Enter magic code..."
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  required
                  className="form-input w-full px-6 py-4 text-2xl bg-white/95 border-4 border-[#fdd401] 
                    rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-[#fdd401]/50
                    placeholder:text-gray-400 hover:scale-[1.02] transition-transform"
                />
                <button
                  type="submit"
                  className={`w-full px-6 py-4 text-teal-900 text-2xl font-bold rounded-2xl shadow-xl transition-all transform ${
                    isButtonDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#fdd401] hover:bg-[#ffd700] hover:scale-[1.02]"
                  }`}
                  disabled={isButtonDisabled}
                >
                  {isLoading ? "Loading..." : "🔑 Submit"}
                </button>
              </form>
              {message && (
                <p className="mt-4 text-xl font-semibold animate-pulse">
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LandingPage;
