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
import { StarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    <div className="flex w-full *:h-full h-screen">
      <div className="hidden lg:flex flex-col text-white space-y-4 lg:w-2/3 bg-blue-500 justify-end pl-4 pb-4">
        <h2 className="text-3xl capitalize">
          welcome to <br />
          <span className="text-5xl font-semibold">
            guerite <strong className="leading-3">AI</strong>
          </span>
        </h2>
        <span>
          <StarIcon className="" />
        </span>
        <p>le commencement d'une air digital au sein de vos entreprise</p>
      </div>
      <div className="w-full lg:w-1/3 bg-neutral-200 z-20 pt-20 shadow-lg flex flex-col justify-center items-center">
        <div className="w-[80%] space-y-8">
          <div className="flex gap-4 *:first-letter:font-bold *:font-semibold">
            <h5 className="">
              Guerite <strong>AI</strong>
            </h5>
            <div className="cursor-pointer" onClick={() => setForConnect(true)}>
              <h5>Sign In</h5>
              <div
                className={`${
                  forConnect === true ? "bg-blue-500 " : "bg-transparent"
                } w-full h-[2px]`}
              ></div>
            </div>
            <div
              className="cursor-pointer"
              onClick={() => setForConnect(false)}
            >
              <h5>Sign Up</h5>
              <div
                className={`${
                  forConnect === false ? "bg-blue-500 " : "bg-transparent"
                } w-full h-[2px]`}
              ></div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {forConnect === false && (
              <div className="gap-2 flex flex-col">
                <Label htmlFor="name">Nom de l'entreprise</Label>
                <Input
                  value={formData.name}
                  name="name"
                  id="name"
                  onChange={handleChange}
                  className="rounded-none shadow-lg"
                />
              </div>
            )}
            <div className="gap-2 flex flex-col">
              <Label htmlFor="email">E-mail de l'entreprise</Label>
              <Input
                value={formData.email}
                name="email"
                id="email"
                onChange={handleChange}
                className="rounded-none shadow-lg"
              />
            </div>
            <div className="gap-2 flex flex-col">
              <Label htmlFor="password">Password</Label>
              <Input
                value={formData.password}
                name="password"
                id="password"
                onChange={handleChange}
                className="rounded-none shadow-lg"
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="text-black hover:bg-blue-500 hover:rounded-lg duration-500 transition-all font-semibold tracking-wider uppercase rounded-none shadow-lg bg-blue-500"
            >
              Submit
            </Button>
          </div>
          <div className="">
            <p className="text-sm text-black/30">
              fait par{" "}
              <strong className="hover:text-black cursor-pointer duration-500">
                <Link
                  href="https://andy-portfolio-jade.vercel.app/fr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Andy Bryan Nzoupet
                </Link>
              </strong>{" "}
              de l'entreprise{" "}
              <strong className="hover:text-black cursor-pointer duration-500">
                <Link
                  href="https://nanosatellitemissions.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NMD (Nanosatellite Missions Design)
                </Link>
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
