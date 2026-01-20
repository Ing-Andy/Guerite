"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import VisitorForm from "@/components/visitor-form";
import VisitorList from "@/components/visitor-list";
import { List, ListEnd, Menu, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function page() {
  const [scannedData, setScannedData] = useState<object>({});
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const handleVisitorAdded = () => {
    console.log("[v0] Visiteur ajouté, rechargement de la liste");
    setRefreshKey((k) => k + 1);
    setScannedData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <header className="hidden lg:flex bg-white border-b border-gray-200 shadow-sm">
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

            <div className="flex gap-4">
              <Button>
                <Link href={"/addStaff"}>ajouter un membre</Link>
              </Button>
              <Button>
                <Link href={"/"}>aide</Link>
              </Button>
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Système opérationnel
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex lg:hidden px-4">
        <div className="max-w-1/2">
          <h1 className="text-3xl font-bold text-gray-900">Guerite AI</h1>
          <p className="text-sm text-gray-600">
            Système de gestion autonome des visiteurs
          </p>
        </div>
        <div className="w-2/3 flex justify-end">
          <Sheet>
            <SheetTrigger>
              <Menu className="w-8 h-8 float-right " />
            </SheetTrigger>
            <SheetContent className="justify-start items-start">
              <SheetHeader className="">
              <SheetTitle className="text-start">Menu latteral</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-4 w-full *:capitalize">
                <Link href={'/addStaff'} className="bg-white/20 text-black">Add a staff member</Link>
                <Link href={'/help'} className="bg-white/20 text-black">go to Help</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
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

          {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
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
          </div> */}
        </div>
      </main>

      <footer className=" mt-12">
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
