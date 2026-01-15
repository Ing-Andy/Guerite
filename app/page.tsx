"use client";

import { useEffect, useState } from "react";
// import { loginUser } from "@/fir";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


interface form {
  name?: string;
  email: string;
  password: string;
}

interface staff {
  nom: string;
  role: string;
}

export default function GueriteAI() {
  const Router = useRouter();
  const [scannedData, setScannedData] = useState<object>({});
  const [activeMode, setActiveMode] = useState<"scanner" | "form">("scanner");
  const [connected, setConnected] = useState<boolean>(false);
  const [forConnect, setForConnect] = useState<boolean>(false);
  const [staff, setStaff] = useState<staff[]>([]);
  const [formData, setFormData] = useState<form>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDataExtracted = (data: any) => {
    console.log("[v0] Données extraites du scan:", data);
    setScannedData(data);
    setActiveMode("form");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Utilisateur déjà connecté :", user);
        setConnected(true);
      } else {
        setConnected(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (forConnect === false) {
      try {
        const res = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log("Created:", res.user);
        if (res.user) {
          setConnected(true);
          Router.push("/register");
        }
      } catch (error) {
        console.error("Error creating user:", error);
      }
    } else {
      try {
        const res = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log("Logged:", res.user);
        if (res.user) {
          setConnected(true);
          Router.push("/register");
        }
      } catch (error) {
        console.error("Error signing in:", error);
      }
    }
  };

  return (
    // bg-[url('/login.png')] bg-no-repeat bg-cover bg-[0]
    <div className="h-screen flex flex-col items-center justify-center relative gap-4 bg-gradient-to-L from-gray-200 via-white  to-gray-200">
      <h1 className="first-letter:text-4xl text-2xl font-bold ">
        Guerite <span className="uppercase text-4xl">Ai</span>
      </h1>

      <div className=" bg-white shadow-md py-10 px-10 rounded-2xl border-2 border-gray-50 relative">
        <p className="text-center mb-4 font-semibold lg:mx-40">
          {forConnect === false
            ? "Enregistrer vous a fin de sauvegarder vos visiteurs"
            : "connecter vous pour reprendre"}
        </p>
        <form className="" onSubmit={handleSubmit}>
          {forConnect === false && (
            <div className=" flex flex-col">
              <label htmlFor="name">nom de l'entreprise:</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="h-12 rounded-md pl-2 my-2 shadow-sm border-2"
                placeholder="enter your name"
              />
            </div>
          )}
          <div className=" flex flex-col">
            <label htmlFor="email">Email de l'entreprise:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              id="email"
              className="h-12 rounded-md pl-2 my-2 shadow-sm border-2"
              placeholder="enter your email"
            />
          </div>
          <div className=" flex flex-col">
            <label htmlFor="password">PassWord :</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="h-12 rounded-md pl-2 my-2 shadow-sm border-2"
              placeholder="enter your password"
            />
          </div>
          <div className="flex gap-2 w-full">
            <Button className="w-full">submit</Button>
            <Button>
              <Link href={"/help"} className="">
                help
              </Link>
            </Button>
          </div>
          <p className="mx-auto   text-center mt-2 gap-1">
            souhaitez vous, vous connecter ? cliquez{" "}
            <span
              onClick={() => setForConnect((prev) => !prev)}
              className="hover:text-red-600 duration-300 cursor-pointer hover:underline underline-offset-4"
            >
              ici
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
