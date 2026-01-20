"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Staff {
  nom: string;
  prenom: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();

  // Admin
  const [adminPassword, setAdminPassword] = useState<string>("0000");
  const [adminIndice, setAdminIndice] = useState<string>(
    "Votre mot de passe est par défaut",
  );
  
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [inputPassword, setInputPassword] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
    // Roles dynamiques
  const [roles, setRoles] = useState<string[]>([
    "Manager",
    "Développeur",
    "Designer",
  ]);
  const STORAGE_KEY = "0000";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      setAdminPassword(data.adminPassword ?? "0000");
      setAdminIndice(data.adminIndice ?? "Votre mot de passe est par défaut");
      setIsVerified(data.isVerified ?? false);
      setStaffList(data.staffList ?? []);
      setRoles(data.roles ?? ["Manager", "Développeur", "Designer"]);
    }
  }, []);
  useEffect(() => {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      adminPassword,
      adminIndice,
      isVerified,
      staffList,
      roles,
    })
  );
}, [adminPassword, adminIndice, isVerified, staffList, roles]);


  // Staff
  // Staff

  useEffect(() => {
    if (typeof window === "undefined") return;

    const data = localStorage.getItem("staffList");
    if (data) {
      setStaffList(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("staffList", JSON.stringify(staffList));
  }, [staffList]);

  const [staffForm, setStaffForm] = useState<Staff>({
    nom: "",
    prenom: "",
    role: "",
  });



  // Dialog state
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [rolesToRemove, setRolesToRemove] = useState<string[]>([]);

  // Vérification admin
  const verifyAdmin = () => {
    if (inputPassword === adminPassword) {
      setIsVerified(true);
    } else {
      alert("Mot de passe incorrect ❌");
    }
  };

  // Ajouter un membre du staff
  const addStaff = () => {
    if (staffForm.nom && staffForm.prenom && staffForm.role) {
      setStaffList((prev) => [...prev, staffForm]);
      setStaffForm({ nom: "", prenom: "", role: "" });
    }
  };

  // Ajouter un rôle
  const addRole = () => {
    const newRole = prompt("Entrez un nouveau rôle");
    if (newRole && !roles.includes(newRole)) {
      setRoles((prev) => [...prev, newRole]);
    }
  };

  // Supprimer les rôles sélectionnés
  const confirmRemoveRoles = () => {
    setRoles((prev) => prev.filter((r) => !rolesToRemove.includes(r)));
    setRolesToRemove([]);
    setShowRoleDialog(false);
  };

  // Vérifier si le formulaire staff est complet
  const isStaffFormValid = staffForm.nom && staffForm.prenom && staffForm.role;

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-neutral-100 p-6">
      {/* Vérification admin */}
      {!isVerified && (
        <div className="bg-white shadow-2xl rounded-2xl p-10 flex flex-col items-center gap-6 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Vérification administrateur
          </h2>
          <p className="text-gray-500 text-center">
            Entrez votre mot de passe personnel
          </p>

          <Input
            type="password"
            placeholder="Mot de passe"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            required
            className="w-full"
          />

          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white w-full mt-4"
            onClick={verifyAdmin}
          >
            Vérifier
          </Button>

          <p className="text-gray-500 text-center mt-2">{adminIndice}</p>
        </div>
      )}

      {/* Dashboard Admin */}
      {isVerified && (
        <div className="bg-white shadow-2xl rounded-2xl p-10 flex flex-col gap-6 max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Dashboard Admin
          </h2>

          {/* Changer mot de passe / indice */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-black rounded-none shadow-md text-white">
                Changer mot de passe / indice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Changer mot de passe / indice</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    required
                    className="rounded-none"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Nouveau indice</Label>
                  <Input
                    required
                    value={adminIndice}
                    className="rounded-none"
                    onChange={(e) => setAdminIndice(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-black rounded-none shadow-md text-white"
                  onClick={() => alert("Mot de passe et indice mis à jour !")}
                >
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Formulaire ajout staff */}
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Nom"
              required
              className="rounded-none"
              value={staffForm.nom}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, nom: e.target.value }))
              }
            />
            <Input
              placeholder="Prénom"
              required
              className="rounded-none"
              value={staffForm.prenom}
              onChange={(e) =>
                setStaffForm((prev) => ({ ...prev, prenom: e.target.value }))
              }
            />

            {/* Select Role */}
            <div className="flex gap-2 items-center">
              <Select
                value={staffForm.role}
                onValueChange={(value) =>
                  setStaffForm((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="w-full rounded-none shadow-xs">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r, i) => (
                    <SelectItem key={i} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="bg-black rounded-none shadow-md text-white"
                onClick={addRole}
              >
                +
              </Button>

              {/* Supprimer rôle via Dialog */}
              <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-black rounded-none shadow-md text-white">
                    -
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Supprimer des rôles</DialogTitle>
                    <p>Sélectionnez les rôles à supprimer puis validez</p>
                  </DialogHeader>
                  <div className="flex flex-col gap-2 py-2">
                    {roles.map((r) => (
                      <div key={r} className="flex items-center gap-2">
                        <Checkbox
                          checked={rolesToRemove.includes(r)}
                          onCheckedChange={(checked) => {
                            if (checked)
                              setRolesToRemove((prev) => [...prev, r]);
                            else
                              setRolesToRemove((prev) =>
                                prev.filter((role) => role !== r),
                              );
                          }}
                        />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      className="bg-black rounded-none shadow-md text-white"
                      onClick={() => setShowRoleDialog(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={confirmRemoveRoles}
                    >
                      Supprimer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button
              className="bg-black rounded-none shadow-md text-white"
              onClick={addStaff}
              disabled={!isStaffFormValid}
            >
              Ajouter
            </Button>
          </div>

          {/* Liste du staff */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Liste du staff :</h3>
            <ul className="list-disc list-inside">
              {staffList.map((s, i) => (
                <li key={i}>
                  {s.nom} {s.prenom} - {s.role}
                </li>
              ))}
            </ul>
          </div>

          {/* Redirection vers register */}
          <Button
            className="bg-black rounded-none shadow-md text-white mt-4"
            onClick={() => router.push("/register")}
          >
            Retour à l'enregistrement
          </Button>
        </div>
      )}
    </div>
  );
}
