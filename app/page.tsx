"use client";

import { useEffect, useState } from "react";
import VisitorForm from "@/components/visitor-form";
import VisitorList from "@/components/visitor-list";
import { Shield, List } from "lucide-react";
// import { loginUser } from "@/fir";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface form {
  name?: string;
  email: string;
  password: string;
}

export default function GueriteAI() {
  const [scannedData, setScannedData] = useState<object>({});
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<"scanner" | "form">("scanner");
  const [connected, setConnected] = useState<boolean>(false);
  const [forConnect, setForConnect] = useState<boolean>(false);
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

  const handleVisitorAdded = () => {
    console.log("[v0] Visiteur ajouté, rechargement de la liste");
    setRefreshKey((k) => k + 1);
    setScannedData({});
  };

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
        }
      } catch (error) {
        console.error("Error signing in:", error);
      }
    }
  };

  if (connected === false) {
    return (
      // bg-[url('/login.png')] bg-no-repeat bg-cover bg-[0]
      <div className="h-screen flex flex-col items-center justify-center 
       gap-4 bg-gradient-to-L from-gray-200 via-white  to-gray-200">
        <h1 className="first-letter:text-4xl text-2xl font-bold ">
          Guerite <span className="uppercase text-4xl">Ai</span>
        </h1>

        <div className=" bg-white shadow-md py-10 px-10 rounded-2xl border-2 border-gray-50">
          <p className="text-center mb-4 font-semibold lg:mx-40">
            {forConnect === false
              ? "Enregistrer vous a fin de sauvegarder vos visiteurs"
              : "connecter vous pour reprendre"}
          </p>
          <form className="" onSubmit={handleSubmit}>
            {forConnect === false && (
              <div className=" flex flex-col">
                <label htmlFor="name">nom :</label>
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
              <label htmlFor="email">Email :</label>
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
              <label htmlFor="password">passWord :</label>
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
            <button className="border-2 bg-black py-2 mt-5 flex justify-center rounded-lg w-60 m-auto text-gray-300 hover:text-white duration-300">
              submit
            </button>
            <p className="mx-auto flex justify-center mt-2 gap-1">
              souhaitez vous, vous connecter ? cliquez{" "}
              <span
                onClick={() => setForConnect(!forConnect)}
                className="hover:text-red-600 duration-300 hover:underline underline-offset-4"
              >
                ici
              </span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Guerite AI</h1>
                <p className="text-sm text-gray-600">
                  Système de gestion autonome des visiteurs
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                Système opérationnel
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <VisitorForm
                initialData={scannedData}
                onVisitorAdded={handleVisitorAdded}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <List className="w-6 h-6" />
                Registre des visiteurs
              </h2>
            </div>
            <div className="p-6">
              <div key={refreshKey}>
                <VisitorList />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">
              Fonctionnalités du système:
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Scan automatique:</strong> Extraction automatique des
                  données depuis la CNI via OCR
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Saisie manuelle:</strong> Formulaire de secours pour
                  entrée manuelle des données
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Photos CNI:</strong> Capture automatique du recto et
                  verso de la CNI
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Détection de doublons:</strong> Identification
                  automatique des visiteurs déjà enregistrés
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Historique des visites:</strong> Dropdown affichant
                  toutes les visites précédentes d'un visiteur
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>100% autonome:</strong> Fonctionne sans connexion
                  internet, données stockées localement
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">
              Guerite AI - Système de gestion autonome
            </p>
            <p className="mt-1">
              Toutes les données sont stockées localement sur cet appareil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
