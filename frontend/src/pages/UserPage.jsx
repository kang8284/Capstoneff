import { useState } from "react";
import { useNavigate } from "react-router-dom";

const maleStyles = [
  { id: "casual", label: "캐주얼", img: "/images/casual.jpg" },
  { id: "street", label: "스트릿", img: "/images/street.jpg" },
  { id: "formal", label: "포멀", img: "/images/formal.jpg" },
];

const femaleStyles = [
  { id: "casual", label: "캐주얼", img: "/images/casual.jpg" },
  { id: "street", label: "스트릿", img: "/images/street.jpg" },
  { id: "lovely", label: "러블리", img: "/images/lovely.jpg" },
  { id: "formal", label: "포멀", img: "/images/formal.jpg" },
];

function UserPage() {
  const navigate = useNavigate();

  const [gender, setGender] = useState("female");
  const [style, setStyle] = useState("casual");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const styles = gender === "male" ? maleStyles : femaleStyles;

  const handleGenderChange = (selectedGender) => {
    setGender(selectedGender);
    setStyle("casual");
  };

  const handleNext = () => {
    navigate("/camera", {
      state: {
        gender,
        style,
        height,
        weight,
      },
    });
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 flex items-center justify-center p-6 relative">
      <div className="absolute left-[-40px] top-[-40px] w-44 h-44 rounded-full bg-cyan-300/40 blur-xl" />
      <div className="absolute right-[-30px] bottom-[-30px] w-48 h-48 rounded-full bg-purple-300/40 blur-xl" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {styles.map((item) => (
            <button
              key={item.id}
              onClick={() => setStyle(item.id)}
              className={`h-52 rounded-2xl bg-white/55 backdrop-blur-md shadow-lg border-2 transition overflow-hidden
                ${
                  style === item.id
                    ? "border-purple-400 scale-[1.02]"
                    : "border-white/70 hover:border-purple-300"
                }`}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                  {item.label}
                </h2>

                <img
                  src={item.img}
                  alt={item.label}
                  className="h-28 object-contain"
                />
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl bg-white/55 backdrop-blur-md shadow-lg p-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              HEIGHT (cm)
            </label>
            <input
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              type="number"
              className="w-full h-12 rounded-xl bg-white border border-emerald-200 px-4 outline-none shadow-inner mb-6 focus:ring-2 focus:ring-emerald-300"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WEIGHT (kg)
            </label>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              type="number"
              className="w-full h-12 rounded-xl bg-white border border-purple-200 px-4 outline-none shadow-inner mb-6 focus:ring-2 focus:ring-purple-300"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleGenderChange("male")}
                className={`flex-1 h-10 rounded-full font-bold text-white shadow-md transition
                  ${
                    gender === "male"
                      ? "bg-blue-500 scale-105"
                      : "bg-blue-300"
                  }`}
              >
                MALE
              </button>

              <button
                onClick={() => handleGenderChange("female")}
                className={`flex-1 h-10 rounded-full font-bold text-white shadow-md transition
                  ${
                    gender === "female"
                      ? "bg-pink-500 scale-105"
                      : "bg-pink-300"
                  }`}
              >
                FEMALE
              </button>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="h-14 rounded-2xl bg-white/60 backdrop-blur-md shadow-lg"
          >
            <span className="inline-flex w-full h-full items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-lg font-extrabold shadow-md">
              NEXT
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPage;