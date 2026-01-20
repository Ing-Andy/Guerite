import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  const questionReponse = [
    {
      question: "comment s'enregistrer ?",
      reponse:
        "pour s'enregistrer il vous suffit de re-Entrer dans l'application, et vous serez a nouveaux sur la login page, rassurer vous juste d'etre sur le formulaire d'enregistrement",
    },
    {
      question: "comment ajouter un membre du staff ?",
      reponse:
        "appuyer su le menu en haut a droite, puis selectionner ajouter un membre, pour plus de securiter vous devrier entrer le mot de passe administrateur par defaut c'est a dire 0000, puis entrer votre membre",
    },
    {
      question: "comment se connecter ?",
      reponse:
        "pour s'enregistrer il vous suffit de re-Entrer dans l'application, et vous serez a nouveaux sur la login page, rassurer vous juste d'etre sur le formulaire d'enregistrement",
    },
    {
      question: "comment Guerrite AI fonctionne ?",
      reponse:
        "guerite AI fonctionne avec la base de donner IndexDB du navigateur. elle y stocke vos informations que vous devez telecharger en fin de journer pour pouvoir vider le cache, ce qui fais en sorte que vous puisser travailler sans data",
    },
    {
      question: "comment ajouter un visiteur ?",
      reponse:
        "remplire avec les donnees personelle du visiteur, les case du formullaire, aller y progressivement et eviter toute erreur, a la fin du remplissage, veillez valider",
    },
    {
      question: "Qui sommes nous ?",
      reponse:
        "NMD (nanosatelliteMissionDesign) est une entreprise nano satellitaire et compte parmie ses branches Ict qui s'occupe des sollution IA pour les structure comme vous !",
    },
  ];
  return (
    <div className="flex flex-col w-full h-screen justify-center items-center bg-gray500">
      <h1 className="text-3xl lg:text-5xl font-semibold text-center ">Vous Renseigner !!</h1>
      <div className="flex flex-col gap-5 w-[80%] h-max justify-center my-10 items-center">
        {questionReponse.map((el, index) => (
          <Accordion key={index} type="single" collapsible className="w-full shadow">
            <AccordionItem value={`items-${index}`} className="border rounded-md px-10 min-w-full">
              <AccordionTrigger>{el.question}</AccordionTrigger>
              <AccordionContent>{el.reponse}</AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
      <Button ><Link href={"/register"} >cancel</Link></Button>
    </div>
  );
}
