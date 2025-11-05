"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Users,
  CreditCard,
  Shield,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Banknote,
  Lock,
  Star,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  TrendingUp,
  FileText,
  Wallet,
  PiggyBank,
  Crown,
  Diamond,
} from "lucide-react"
import axios from "axios"

interface FormData {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string

  // Address
  address: string
  city: string
  postalCode: string
  country: string

  // Professional
  occupation: string
  employer: string
  monthlyIncome: string
  employmentType: string

  // Account
  accountType: string
  initialDeposit: string
  purpose: string

  // Documents
  idDocument: File | null
  proofOfAddress: File | null

  // Legal
  agreeToTerms: boolean
  agreeToMarketing: boolean
}

const BankRegistrationForm = () => {
  const [language, setLanguage] = useState<"fr" | "en">("fr")
  const [activeTab, setActiveTab] = useState<"personal" | "joint">("personal")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [progress, setProgress] = useState(0)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    occupation: "",
    employer: "",
    monthlyIncome: "",
    employmentType: "",
    accountType: "",
    initialDeposit: "",
    purpose: "",
    idDocument: null,
    proofOfAddress: null,
    agreeToTerms: false,
    agreeToMarketing: false,
  })

  const totalSteps = 5

  useEffect(() => {
    setProgress((currentStep / totalSteps) * 100)
  }, [currentStep])

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as "personal" | "joint")
    setCurrentStep(1)
  }

  const handlePersonalSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await axios.post("https://l2p-finance-backend.onrender.com/auth", data)
      setTimeout(() => {
        setIsSubmitting(false)
        alert("🎉 Inscription réussie! Votre demande a été soumise avec succès.")
      }, 2000)
    } catch (err) {
      console.error("Erreur:", err)
      setIsSubmitting(false)
      alert("❌ Une erreur s'est produite. Veuillez réessayer.")
    }
  }

  const handleJointSubmit = async (data: any) => {
    setIsSubmitting(true)
    console.log("Joint Account Registration:", data)
    setTimeout(() => {
      setIsSubmitting(false)
      alert("🎉 Inscription réussie! Votre demande a été soumise avec succès.")
    }, 2000)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (activeTab === "personal") {
      await handlePersonalSubmit(formData)
    } else {
      await handleJointSubmit(formData)
    }
  }

  const t = {
    "navigation.personalAccount": "Compte Personnel",
    "navigation.jointAccount": "Compte Joint",
    "navigation.languageSwitch": language === "fr" ? "English" : "Français",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-2xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              L2P Finance
            </h1>
            <p className="text-2xl text-slate-300 font-light">Votre Partenaire Financier d'Excellence</p>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Rejoignez plus de 100,000 clients qui nous font confiance pour leurs services bancaires premium
            </p>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              <Globe className="w-4 h-4 mr-2" />
              {t["navigation.languageSwitch"]}
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Shield className="w-8 h-8 text-green-400 mb-2" />
              <span className="text-white font-semibold">Sécurisé</span>
              <span className="text-slate-400 text-sm">SSL 256-bit</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Award className="w-8 h-8 text-yellow-400 mb-2" />
              <span className="text-white font-semibold">Certifié</span>
              <span className="text-slate-400 text-sm">ISO 27001</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-white font-semibold">Croissance</span>
              <span className="text-slate-400 text-sm">+25% annuel</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <Star className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-white font-semibold">Excellence</span>
              <span className="text-slate-400 text-sm">4.9/5 étoiles</span>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white font-bold">Ouverture de Compte</CardTitle>
                    <p className="text-slate-300 mt-1">Processus sécurisé en {totalSteps} étapes</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-4 py-2 text-lg"
                >
                  Étape {currentStep}/{totalSteps}
                </Badge>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Progression</span>
                  <span>{Math.round(progress)}% complété</span>
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-3 bg-slate-800/50 rounded-full overflow-hidden" />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                {/* Enhanced Tab Navigation */}
                <TabsList className="grid w-full grid-cols-2 bg-slate-800/30 border border-slate-600/50 rounded-2xl p-2 mb-8">
                  <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300 rounded-xl py-3 px-6 font-semibold transition-all duration-300"
                  >
                    <User className="w-5 h-5 mr-2" />
                    {t["navigation.personalAccount"]}
                  </TabsTrigger>
                  <TabsTrigger
                    value="joint"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300 rounded-xl py-3 px-6 font-semibold transition-all duration-300"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {t["navigation.jointAccount"]}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Informations Personnelles</h3>
                          <p className="text-slate-400">Commençons par vos informations de base</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="firstName" className="text-slate-300 font-semibold flex items-center">
                              <User className="w-4 h-4 mr-2 text-blue-400" />
                              Prénom *
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="Votre prénom"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="lastName" className="text-slate-300 font-semibold flex items-center">
                              <User className="w-4 h-4 mr-2 text-blue-400" />
                              Nom *
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="Votre nom de famille"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="email" className="text-slate-300 font-semibold flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-blue-400" />
                              Adresse Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="votre@email.com"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-slate-300 font-semibold flex items-center">
                              <Phone className="w-4 h-4 mr-2 text-blue-400" />
                              Téléphone *
                            </Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="+33 1 23 45 67 89"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="dateOfBirth" className="text-slate-300 font-semibold flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                              Date de naissance *
                            </Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12 transition-all duration-300"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="nationality" className="text-slate-300 font-semibold flex items-center">
                              <Globe className="w-4 h-4 mr-2 text-blue-400" />
                              Nationalité *
                            </Label>
                            <Select
                              value={formData.nationality}
                              onValueChange={(value) => handleInputChange("nationality", value)}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white rounded-xl h-12">
                                <SelectValue placeholder="Sélectionner votre nationalité" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                                <SelectItem value="french">Française</SelectItem>
                                <SelectItem value="belgian">Belge</SelectItem>
                                <SelectItem value="swiss">Suisse</SelectItem>
                                <SelectItem value="canadian">Canadienne</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Address Information */}
                    {currentStep === 2 && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Adresse de Résidence</h3>
                          <p className="text-slate-400">Où pouvons-nous vous contacter ?</p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="address" className="text-slate-300 font-semibold flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-green-400" />
                            Adresse complète *
                          </Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20 rounded-xl h-12 transition-all duration-300"
                            placeholder="123 Rue de la République"
                            required
                          />
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="city" className="text-slate-300 font-semibold">
                              Ville *
                            </Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="Paris"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="postalCode" className="text-slate-300 font-semibold">
                              Code postal *
                            </Label>
                            <Input
                              id="postalCode"
                              value={formData.postalCode}
                              onChange={(e) => handleInputChange("postalCode", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="75001"
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="country" className="text-slate-300 font-semibold">
                              Pays *
                            </Label>
                            <Select
                              value={formData.country}
                              onValueChange={(value) => handleInputChange("country", value)}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white rounded-xl h-12">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                                <SelectItem value="france">France</SelectItem>
                                <SelectItem value="belgium">Belgique</SelectItem>
                                <SelectItem value="switzerland">Suisse</SelectItem>
                                <SelectItem value="canada">Canada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Professional Information */}
                    {currentStep === 3 && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Situation Professionnelle</h3>
                          <p className="text-slate-400">Parlez-nous de votre activité professionnelle</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="occupation" className="text-slate-300 font-semibold flex items-center">
                              <Building className="w-4 h-4 mr-2 text-purple-400" />
                              Profession *
                            </Label>
                            <Input
                              id="occupation"
                              value={formData.occupation}
                              onChange={(e) => handleInputChange("occupation", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="Ingénieur, Médecin, Avocat..."
                              required
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="employer" className="text-slate-300 font-semibold">
                              Employeur
                            </Label>
                            <Input
                              id="employer"
                              value={formData.employer}
                              onChange={(e) => handleInputChange("employer", e.target.value)}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-xl h-12 transition-all duration-300"
                              placeholder="Nom de votre entreprise"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="employmentType" className="text-slate-300 font-semibold">
                              Type d'emploi *
                            </Label>
                            <Select
                              value={formData.employmentType}
                              onValueChange={(value) => handleInputChange("employmentType", value)}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white rounded-xl h-12">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                                <SelectItem value="employee">Salarié</SelectItem>
                                <SelectItem value="self-employed">Indépendant</SelectItem>
                                <SelectItem value="business-owner">Chef d'entreprise</SelectItem>
                                <SelectItem value="retired">Retraité</SelectItem>
                                <SelectItem value="student">Étudiant</SelectItem>
                                <SelectItem value="unemployed">Sans emploi</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="monthlyIncome" className="text-slate-300 font-semibold flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                              Revenus mensuels *
                            </Label>
                            <Select
                              value={formData.monthlyIncome}
                              onValueChange={(value) => handleInputChange("monthlyIncome", value)}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white rounded-xl h-12">
                                <SelectValue placeholder="Sélectionner votre tranche" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                                <SelectItem value="0-1500">Moins de 1 500€</SelectItem>
                                <SelectItem value="1500-3000">1 500€ - 3 000€</SelectItem>
                                <SelectItem value="3000-5000">3 000€ - 5 000€</SelectItem>
                                <SelectItem value="5000-8000">5 000€ - 8 000€</SelectItem>
                                <SelectItem value="8000-15000">8 000€ - 15 000€</SelectItem>
                                <SelectItem value="15000+">Plus de 15 000€</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Account Configuration */}
                    {currentStep === 4 && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Configuration du Compte</h3>
                          <p className="text-slate-400">Choisissez le type de compte qui vous convient</p>
                        </div>

                        {/* Account Type Selection */}
                        <div className="space-y-6">
                          <Label className="text-slate-300 font-semibold text-lg">Type de compte *</Label>
                          <RadioGroup
                            value={formData.accountType}
                            onValueChange={(value) => handleInputChange("accountType", value)}
                            className="space-y-4"
                          >
                            {/* Standard Account */}
                            <div className="relative group">
                              <div className="flex items-center space-x-4 p-6 rounded-2xl bg-slate-800/30 border border-slate-600/50 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                                <RadioGroupItem value="standard" id="standard" className="border-slate-400" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <PiggyBank className="w-6 h-6 text-blue-400" />
                                    <Label
                                      htmlFor="standard"
                                      className="text-white font-semibold text-lg cursor-pointer"
                                    >
                                      Compte Standard
                                    </Label>
                                  </div>
                                  <p className="text-slate-400 mt-2">
                                    Parfait pour une utilisation quotidienne • Frais de tenue : 5€/mois
                                  </p>
                                  <div className="flex space-x-4 mt-3 text-sm">
                                    <span className="text-green-400">✓ Carte bancaire gratuite</span>
                                    <span className="text-green-400">✓ Virements illimités</span>
                                    <span className="text-green-400">✓ Application mobile</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Premium Account */}
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                              <div className="relative flex items-center space-x-4 p-6 rounded-2xl bg-slate-800/50 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer">
                                <RadioGroupItem value="premium" id="premium" className="border-yellow-400" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                    <Label
                                      htmlFor="premium"
                                      className="text-white font-semibold text-lg cursor-pointer"
                                    >
                                      Compte Premium
                                    </Label>
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                      Recommandé
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 mt-2">
                                    Services exclusifs et avantages premium • Frais de tenue : 15€/mois
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                    <span className="text-green-400">✓ Conseiller dédié</span>
                                    <span className="text-green-400">✓ Assurances incluses</span>
                                    <span className="text-green-400">✓ Découvert autorisé</span>
                                    <span className="text-green-400">✓ Cashback 1%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* VIP Account */}
                            <div className="relative group">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                              <div className="relative flex items-center space-x-4 p-6 rounded-2xl bg-slate-800/50 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
                                <RadioGroupItem value="vip" id="vip" className="border-purple-400" />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <Diamond className="w-6 h-6 text-purple-400" />
                                    <Label htmlFor="vip" className="text-white font-semibold text-lg cursor-pointer">
                                      Compte VIP
                                    </Label>
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                                      Exclusif
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 mt-2">
                                    Le summum du service bancaire privé • Frais de tenue : 50€/mois
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                    <span className="text-green-400">✓ Gestionnaire privé</span>
                                    <span className="text-green-400">✓ Concierge 24/7</span>
                                    <span className="text-green-400">✓ Investissements premium</span>
                                    <span className="text-green-400">✓ Cashback 2%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Initial Deposit */}
                        <div className="space-y-3">
                          <Label htmlFor="initialDeposit" className="text-slate-300 font-semibold flex items-center">
                            <Banknote className="w-4 h-4 mr-2 text-yellow-400" />
                            Dépôt initial *
                          </Label>
                          <Select
                            value={formData.initialDeposit}
                            onValueChange={(value) => handleInputChange("initialDeposit", value)}
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white rounded-xl h-12">
                              <SelectValue placeholder="Montant du dépôt initial" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                              <SelectItem value="100">100€ - Minimum requis</SelectItem>
                              <SelectItem value="500">500€ - Recommandé</SelectItem>
                              <SelectItem value="1000">1 000€ - Populaire</SelectItem>
                              <SelectItem value="5000">5 000€ - Avantages premium</SelectItem>
                              <SelectItem value="10000">10 000€ - VIP</SelectItem>
                              <SelectItem value="custom">Montant personnalisé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Purpose */}
                        <div className="space-y-3">
                          <Label htmlFor="purpose" className="text-slate-300 font-semibold">
                            Utilisation principale du compte
                          </Label>
                          <Select
                            value={formData.purpose}
                            onValueChange={(value) => handleInputChange("purpose", value)}
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white rounded-xl h-12">
                              <SelectValue placeholder="Sélectionner l'usage principal" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                              <SelectItem value="personal">Usage personnel</SelectItem>
                              <SelectItem value="business">Activité professionnelle</SelectItem>
                              <SelectItem value="savings">Épargne et investissement</SelectItem>
                              <SelectItem value="family">Gestion familiale</SelectItem>
                              <SelectItem value="travel">Voyages internationaux</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Final Confirmation */}
                    {currentStep === 5 && (
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Confirmation et Validation</h3>
                          <p className="text-slate-400">Dernière étape avant l'ouverture de votre compte</p>
                        </div>

                        {/* Summary Card */}
                        <Card className="bg-slate-800/30 border-slate-600/50 rounded-2xl">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center">
                              <FileText className="w-5 h-5 mr-2 text-blue-400" />
                              Récapitulatif de votre demande
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">Nom complet:</span>
                                <span className="text-white ml-2">
                                  {formData.firstName} {formData.lastName}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Email:</span>
                                <span className="text-white ml-2">{formData.email}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Type de compte:</span>
                                <span className="text-white ml-2 capitalize">{formData.accountType}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Dépôt initial:</span>
                                <span className="text-white ml-2">{formData.initialDeposit}€</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Legal Agreements */}
                        <div className="space-y-6">
                          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-600/50">
                            <Checkbox
                              id="terms"
                              checked={formData.agreeToTerms}
                              onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                              className="border-slate-400 data-[state=checked]:bg-blue-600 mt-1"
                            />
                            <Label htmlFor="terms" className="text-slate-300 text-sm cursor-pointer leading-relaxed">
                              J'accepte les{" "}
                              <a href="#" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                                conditions générales d'utilisation
                              </a>{" "}
                              et la{" "}
                              <a href="#" className="text-blue-400 hover:text-blue-300 underline font-semibold">
                                politique de confidentialité
                              </a>{" "}
                              de L2P Finance. Je confirme avoir lu et compris ces documents. *
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-800/30 border border-slate-600/50">
                            <Checkbox
                              id="marketing"
                              checked={formData.agreeToMarketing}
                              onCheckedChange={(checked) => handleInputChange("agreeToMarketing", checked as boolean)}
                              className="border-slate-400 data-[state=checked]:bg-purple-600 mt-1"
                            />
                            <Label
                              htmlFor="marketing"
                              className="text-slate-300 text-sm cursor-pointer leading-relaxed"
                            >
                              J'accepte de recevoir des communications marketing personnalisées de L2P Finance
                              concernant les nouveaux produits, services et offres spéciales. (Optionnel)
                            </Label>
                          </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <Shield className="w-6 h-6 text-green-400" />
                            <h4 className="text-green-300 font-semibold">Sécurité et Protection</h4>
                          </div>
                          <p className="text-green-200 text-sm leading-relaxed">
                            Vos données personnelles sont protégées par un chiffrement SSL 256-bit et stockées
                            conformément aux normes RGPD. L2P Finance s'engage à ne jamais partager vos informations
                            avec des tiers sans votre consentement explicite.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t border-slate-600/50">
                      {currentStep > 1 ? (
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 rounded-xl px-8 py-3 transition-all duration-300"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Précédent
                        </Button>
                      ) : (
                        <div></div>
                      )}

                      <div className="flex items-center space-x-4">
                        {currentStep < totalSteps ? (
                          <Button
                            type="button"
                            onClick={nextStep}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 py-3 transition-all duration-300 transform hover:scale-105"
                          >
                            Suivant
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={isSubmitting || !formData.agreeToTerms}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-8 py-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                Traitement en cours...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Ouvrir mon compte L2P
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="joint" className="space-y-8">
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Compte Joint</h3>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                      Les comptes joints seront bientôt disponibles. Cette fonctionnalité premium permettra à deux
                      personnes de gérer conjointement un compte bancaire avec des droits partagés.
                    </p>
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-8 py-3"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Être notifié du lancement
                      </Button>
                      <p className="text-slate-500 text-sm">
                        En attendant, vous pouvez ouvrir un compte personnel et ajouter un co-titulaire plus tard.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Footer Security */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 backdrop-blur-sm">
            <Lock className="w-5 h-5 text-green-400 mr-3" />
            <span className="text-green-300 font-semibold">Connexion sécurisée SSL 256-bit</span>
            <div className="w-2 h-2 bg-green-400 rounded-full ml-3 animate-pulse"></div>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            L2P Finance • Agréé par l'ACPR • Membre du Fonds de Garantie des Dépôts
          </p>
        </div>
      </div>
    </div>
  )
}

export default BankRegistrationForm
