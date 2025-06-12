import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, User, Car, Apple, ChevronDown, ChevronUp, HelpCircle, Phone, Mail } from "lucide-react";

const faqCategories = [
  {
    id: "minors",
    title: "Trámites de Menores",
    icon: User,
    description: "Autorización y documentación requerida",
    faqs: [
      {
        question: "¿Qué documentos necesito para cruzar con un menor?",
        answer: "Para el cruce fronterizo con menores necesitas: autorización notarial firmada por ambos padres, documento de identidad del menor, y documento de identidad del acompañante. La autorización debe estar vigente y especificar los países de destino."
      },
      {
        question: "¿La autorización notarial tiene fecha de vencimiento?",
        answer: "Sí, la autorización notarial generalmente tiene una vigencia de 90 días desde su emisión. Debe especificar claramente las fechas de viaje y los países de destino."
      },
      {
        question: "¿Puedo viajar con un menor sin ser el padre o madre?",
        answer: "Sí, pero necesitas una autorización notarial específica que te designe como acompañante autorizado, firmada por ambos padres o tutores legales del menor."
      }
    ]
  },
  {
    id: "vehicles",
    title: "Vehículos",
    icon: Car,
    description: "Admisión temporal y documentos",
    faqs: [
      {
        question: "¿Qué documentos necesito para ingresar mi vehículo a Argentina?",
        answer: "Necesitas: permiso de circulación vigente, seguro obligatorio, cédula de identidad del conductor, y registro de propiedad del vehículo. Todos los documentos deben estar vigentes."
      },
      {
        question: "¿Por cuánto tiempo puedo mantener mi vehículo en Argentina?",
        answer: "El régimen de admisión temporal permite mantener el vehículo por hasta 8 meses en un período de 12 meses para turistas."
      },
      {
        question: "¿El seguro chileno es válido en Argentina?",
        answer: "El seguro obligatorio chileno tiene validez limitada. Se recomienda contratar un seguro adicional que cubra territorio argentino para mayor protección."
      }
    ]
  },
  {
    id: "declarations",
    title: "Declaraciones",
    icon: Apple,
    description: "Alimentos, plantas y mascotas",
    faqs: [
      {
        question: "¿Qué alimentos puedo transportar?",
        answer: "Puedes transportar alimentos procesados e industrializados en cantidades para consumo personal. Las frutas, verduras frescas y productos cárnicos tienen restricciones especiales y requieren declaración obligatoria."
      },
      {
        question: "¿Puedo llevar plantas o semillas?",
        answer: "Las plantas vivas y semillas requieren certificados fitosanitarios específicos del SAG. Algunos productos están prohibidos completamente. Siempre declara estos elementos."
      },
      {
        question: "¿Qué necesito para viajar con mi mascota?",
        answer: "Para mascotas necesitas: certificado veterinario vigente (máximo 14 días), certificado de vacunas al día, tratamiento antiparasitario, y microchip de identificación."
      }
    ]
  }
];

const generalFaqs = [
  {
    question: "¿Cuánto tiempo toma la revisión de mi trámite?",
    answer: "Los tiempos de revisión varían según el tipo de trámite: SAG revisa declaraciones en 2-4 horas, PDI verifica documentos en 1-2 horas, y el proceso completo generalmente toma entre 4-8 horas hábiles."
  },
  {
    question: "¿Puedo modificar mi declaración después de enviarla?",
    answer: "No puedes modificar una declaración una vez enviada. Si detectas un error, contacta inmediatamente al funcionario de aduanas en el paso fronterizo o utiliza el sistema de observaciones."
  },
  {
    question: "¿Qué pasa si mi trámite es rechazado?",
    answer: "Si tu trámite es rechazado, recibirás una notificación con las observaciones específicas. Puedes corregir los problemas y presentar una nueva solicitud, o apelar la decisión según corresponda."
  },
  {
    question: "¿El sistema funciona las 24 horas?",
    answer: "El sistema está disponible 24/7 para envío de formularios, pero la revisión por parte de funcionarios se realiza en horario hábil (8:00 a 20:00 hrs). Los pasos fronterizos tienen horarios específicos de atención."
  }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);

  const toggleFaq = (faqId: string) => {
    setOpenFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const filteredFaqs = generalFaqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0 || searchTerm === "");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
          <p className="text-gray-600 mt-2">
            Encuentra respuestas a tus preguntas frecuentes sobre trámites fronterizos
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar en la ayuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 text-lg focus:ring-chile-blue focus:border-chile-blue"
          />
        </div>

        {/* FAQ Categories */}
        {!searchTerm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSearchTerm(category.title.toLowerCase())}
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="text-chile-blue w-12 h-12 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ Sections */}
        <div className="space-y-6">
          {searchTerm && filteredCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <category.icon className="w-5 h-5 mr-2 text-chile-blue" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.faqs.map((faq, index) => {
                  const faqId = `${category.id}-${index}`;
                  const isOpen = openFaqs.includes(faqId);
                  
                  return (
                    <Collapsible key={faqId}>
                      <CollapsibleTrigger 
                        className="flex items-center justify-between w-full text-left p-4 rounded-lg border border-gray-200 hover:border-chile-blue transition-colors"
                        onClick={() => toggleFaq(faqId)}
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 px-4 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {/* General FAQs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-chile-blue" />
                Preguntas Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(searchTerm ? filteredFaqs : generalFaqs).map((faq, index) => {
                const faqId = `general-${index}`;
                const isOpen = openFaqs.includes(faqId);
                
                return (
                  <Collapsible key={faqId}>
                    <CollapsibleTrigger 
                      className="flex items-center justify-between w-full text-left p-4 rounded-lg border border-gray-200 hover:border-chile-blue transition-colors"
                      onClick={() => toggleFaq(faqId)}
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 px-4 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Contact Support */}
        <Card className="mt-8 bg-chile-blue text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">¿No encuentras lo que buscas?</h3>
            <p className="mb-6 text-blue-100">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier consulta específica
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                className="bg-white text-chile-blue hover:bg-gray-100"
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar: +56 2 2345 6789
              </Button>
              <Button 
                variant="secondary"
                className="bg-white text-chile-blue hover:bg-gray-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email: soporte@aduana.cl
              </Button>
            </div>
            <div className="mt-6 text-sm text-blue-100">
              <p>Horario de atención: Lunes a Viernes 8:00 - 20:00 hrs</p>
              <p>Sábados y Domingos 9:00 - 17:00 hrs</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tutoriales en Video</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Aprende paso a paso cómo completar tus trámites con nuestros videos explicativos.
              </p>
              <Button variant="outline" className="w-full">
                Ver Tutoriales
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Normativas Vigentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Consulta las regulaciones actuales y acuerdos internacionales que aplican a tu viaje.
              </p>
              <Button variant="outline" className="w-full">
                Ver Normativas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
