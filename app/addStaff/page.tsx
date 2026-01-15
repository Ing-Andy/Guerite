"use client";

import { Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

export default function page() {
  const [password, setPassword] = useState<string>("0000");
  const [indice, setIndice] = useState<string>("");
  return (
    <div className="w-full h-screen flex flex-col justify-center gap-4 items-center">
      <h2 className="text-4xl">
        Etes vous l'administrateur <strong className="font-bold">?</strong>
      </h2>
      <p>entrer votre mot de passe personnel</p>
      <input type="text" className=" border border-gray-300 min-w-200 h-10 rounded-lg" />
      <Accordion  type="single" collapsible>
        <AccordionTrigger>Besoin d'indice ?</AccordionTrigger>
        <AccordionContent></AccordionContent>
      </Accordion>
    </div>
  );
}
